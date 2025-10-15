<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use App\Models\Project;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display user's submitted reports
     */
    public function index(): Response
    {
        $reports = Report::where('reporter_id', auth()->id())
            ->with(['reportedUser:id,first_name,last_name', 'project.job:id,title'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Reports/Index', [
            'reports' => $reports
        ]);
    }

    /**
     * Submit a new report
     */
    public function store(Request $request)
    {
        $request->validate([
            'reported_user_id' => 'required|exists:users,id|different:reporter_id',
            'project_id' => 'nullable|exists:projects,id',
            'type' => 'required|in:fraud,spam,inappropriate,scam,fake_profile,other',
            'description' => 'required|string|min:20|max:1000',
            'evidence' => 'nullable|array',
            'evidence.*' => 'string|max:500'
        ]);

        // Ensure user can't report themselves
        if ($request->reported_user_id == auth()->id()) {
            return back()->withErrors(['reported_user_id' => 'You cannot report yourself.']);
        }

        // Check if user has already reported this user for the same project
        $existingReport = Report::where('reporter_id', auth()->id())
            ->where('reported_user_id', $request->reported_user_id)
            ->where('project_id', $request->project_id)
            ->where('type', $request->type)
            ->first();

        if ($existingReport) {
            return back()->withErrors(['report' => 'You have already submitted a similar report for this user.']);
        }

        Report::create([
            'reporter_id' => auth()->id(),
            'reported_user_id' => $request->reported_user_id,
            'project_id' => $request->project_id,
            'type' => $request->type,
            'description' => $request->description,
            'evidence' => $request->evidence,
            'status' => 'pending'
        ]);

        return back()->with('success', 'Report submitted successfully. We will review it and take appropriate action.');
    }

    /**
     * Display specific report details
     */
    public function show(Report $report): Response
    {
        // Ensure user can only view their own reports
        if ($report->reporter_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $report->load(['reportedUser', 'project.job', 'reporter']);

        return Inertia::render('Reports/Show', [
            'report' => $report
        ]);
    }

    /**
     * Show report form for specific user
     */
    public function create(Request $request): Response
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'project_id' => 'nullable|exists:projects,id'
        ]);

        $reportedUser = User::findOrFail($request->user_id);
        $project = $request->project_id ? Project::findOrFail($request->project_id) : null;

        // Ensure user can't report themselves
        if ($reportedUser->id === auth()->id()) {
            abort(403, 'You cannot report yourself.');
        }

        return Inertia::render('Reports/Create', [
            'reportedUser' => $reportedUser,
            'project' => $project,
            'reportTypes' => [
                'fraud' => 'Fraudulent activity or scam',
                'spam' => 'Spam or unwanted messages',
                'inappropriate' => 'Inappropriate behavior or content',
                'scam' => 'Attempted scam or deception',
                'fake_profile' => 'Fake or misleading profile',
                'other' => 'Other violation'
            ]
        ]);
    }

    /**
     * Get report statistics (for admin dashboard)
     */
    public function statistics()
    {
        $stats = [
            'total_reports' => Report::count(),
            'pending_reports' => Report::where('status', 'pending')->count(),
            'resolved_reports' => Report::where('status', 'resolved')->count(),
            'reports_by_type' => Report::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'recent_reports' => Report::with(['reporter', 'reportedUser'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];

        return response()->json($stats);
    }

    /**
     * Admin: Update report status
     */
    public function updateStatus(Request $request, Report $report)
    {
        // This would be for admin users only
        // For demo purposes, we'll allow any user to simulate admin actions

        $request->validate([
            'status' => 'required|in:pending,investigating,resolved,dismissed',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        $report->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'resolved_at' => $request->status === 'resolved' ? now() : null
        ]);

        return back()->with('success', 'Report status updated successfully.');
    }

    /**
     * Get fraud detection insights
     */
    public function fraudInsights()
    {
        // AI-powered fraud detection insights
        $insights = [
            'high_risk_users' => User::whereHas('reportsReceived', function($query) {
                $query->where('type', 'fraud')
                      ->where('status', '!=', 'dismissed');
            })
            ->withCount('reportsReceived')
            ->having('reports_received_count', '>=', 2)
            ->limit(10)
            ->get(),

            'fraud_patterns' => [
                'common_types' => Report::where('type', 'fraud')
                    ->selectRaw('description, COUNT(*) as frequency')
                    ->groupBy('description')
                    ->orderBy('frequency', 'desc')
                    ->limit(5)
                    ->get(),

                'time_patterns' => Report::selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
                    ->groupBy('hour')
                    ->orderBy('hour')
                    ->get()
            ],

            'prevention_tips' => [
                'Always verify gig worker credentials before hiring',
                'Use the platform\'s escrow system for payments',
                'Be cautious of unusually low bids or prices',
                'Report suspicious behavior immediately',
                'Check user reviews and ratings carefully'
            ]
        ];

        return response()->json($insights);
    }

    /**
     * Display transaction reports for the authenticated user
     */
    public function transactions(Request $request): Response
    {
        $user = auth()->user();
        $filters = $request->only(['date_from', 'date_to', 'type', 'status']);

        try {
            // Build query based on user type
            if ($user->isAdmin()) {
                $query = Transaction::query();
            } elseif ($user->isGigWorker()) {
                $query = Transaction::where('payee_id', $user->id);
            } else {
                $query = Transaction::where('payer_id', $user->id);
            }

            // Apply filters
            if (!empty($filters['date_from'])) {
                $query->where('created_at', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->where('created_at', '<=', $filters['date_to']);
            }

            if (!empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            $transactions = $query->with(['project.job', 'payer', 'payee'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $summary = $this->calculateTransactionSummary($query);

            return Inertia::render('Reports/TransactionReports', [
                'transactions' => $transactions,
                'summary' => $summary,
                'filters' => $filters,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            \Log::error('Transaction reports error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'filters' => $filters,
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Reports/TransactionReports', [
                'transactions' => ['data' => []],
                'summary' => [
                    'total_volume' => 0,
                    'total_transactions' => 0,
                    'success_rate' => 0,
                    'average_amount' => 0,
                    'total_fees' => 0,
                    'net_amount' => 0
                ],
                'filters' => $filters,
                'user' => $user,
                'error' => 'Unable to load transaction data. Please try again.'
            ]);
        }
    }

    /**
     * Export transaction reports
     */
    public function exportTransactions(Request $request)
    {
        try {
            $user = auth()->user();
            $format = $request->get('format', 'pdf');
            $filters = $request->only(['date_from', 'date_to', 'type', 'status']);

            // Build query based on user type
            if ($user->isAdmin()) {
                $query = Transaction::query();
            } elseif ($user->isGigWorker()) {
                $query = Transaction::where('payee_id', $user->id);
            } else {
                $query = Transaction::where('payer_id', $user->id);
            }

            // Apply filters
            if (!empty($filters['date_from'])) {
                $query->where('created_at', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->where('created_at', '<=', $filters['date_to']);
            }

            if (!empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            $transactions = $query->with(['project.job', 'payer', 'payee'])
                ->orderBy('created_at', 'desc')
                ->get();

            if ($format === 'pdf') {
                return $this->generateTransactionPdf($transactions, $user, $filters);
            } elseif ($format === 'excel') {
                return $this->generateTransactionExcel($transactions, $user);
            }

            return response()->json(['error' => 'Unsupported format'], 400);
        } catch (\Exception $e) {
            \Log::error('Transaction export error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'format' => $format,
                'filters' => $filters
            ]);

            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Calculate transaction summary statistics
     */
    private function calculateTransactionSummary($query)
    {
        try {
            $baseQuery = clone $query;

            return [
                'total_volume' => (float) $baseQuery->sum('amount'),
                'total_transactions' => $baseQuery->count(),
                'success_rate' => $this->calculateSuccessRate($baseQuery),
                'average_amount' => (float) $baseQuery->avg('amount'),
                'total_fees' => (float) $baseQuery->sum('platform_fee'),
                'net_amount' => (float) $baseQuery->sum('net_amount')
            ];
        } catch (\Exception $e) {
            \Log::error('Summary calculation error: ' . $e->getMessage());
            return [
                'total_volume' => 0,
                'total_transactions' => 0,
                'success_rate' => 0,
                'average_amount' => 0,
                'total_fees' => 0,
                'net_amount' => 0
            ];
        }
    }

    /**
     * Calculate transaction success rate
     */
    private function calculateSuccessRate($query)
    {
        try {
            $baseQuery = clone $query;
            $total = $baseQuery->count();

            if ($total === 0) return 0;

            $successful = (clone $query)->where('status', 'completed')->count();

            return round(($successful / $total) * 100, 1);
        } catch (\Exception $e) {
            \Log::error('Success rate calculation error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Generate PDF report for transactions
     */
    private function generateTransactionPdf($transactions, $user, $filters)
    {
        try {
            $summary = $this->calculateTransactionSummary(
                $this->buildTransactionQuery($user, $filters)
            );

            $data = $transactions->map(function ($transaction) use ($user) {
                return [
                    'Date' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'Type' => ucfirst($transaction->type),
                    'Description' => $transaction->description ?? ucfirst($transaction->type) . ' transaction',
                    'Amount' => $transaction->amount,
                    'Platform_Fee' => $transaction->platform_fee ?? 0,
                    'Net_Amount' => $transaction->net_amount ?? $transaction->amount,
                    'Status' => ucfirst($transaction->status),
                    'Project' => $transaction->project?->job?->title ?? 'N/A',
                    'Counterparty' => $this->getCounterpartyName($transaction, $user)
                ];
            });

            $pdf = Pdf::loadView('reports.transaction-report', [
                'data' => $data,
                'user' => $user,
                'summary' => $summary,
                'filters' => $filters,
                'generatedAt' => now()
            ])->setPaper('a4', 'landscape');

            $filename = 'transaction_report_' . $user->id . '_' . now()->format('Y-m-d_H-i-s');

            return $pdf->download($filename . '.pdf');
        } catch (\Exception $e) {
            \Log::error('PDF generation error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'transaction_count' => $transactions->count()
            ]);

            return response()->json(['error' => 'PDF generation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generate Excel report for transactions
     */
    private function generateTransactionExcel($transactions, $user)
    {
        $data = $transactions->map(function ($transaction) {
            return [
                'Date' => $transaction->created_at->format('Y-m-d H:i:s'),
                'Type' => ucfirst($transaction->type),
                'Description' => $transaction->description ?? ucfirst($transaction->type) . ' transaction',
                'Amount' => $transaction->amount,
                'Platform_Fee' => $transaction->platform_fee ?? 0,
                'Net_Amount' => $transaction->net_amount ?? $transaction->amount,
                'Status' => ucfirst($transaction->status),
                'Project' => $transaction->project?->job?->title ?? 'N/A',
                'Counterparty' => $this->getCounterpartyName($transaction, $user)
            ];
        });

        $filename = 'transaction_report_' . $user->id . '_' . now()->format('Y-m-d_H-i-s');

        return response()->json($data, 200, [
            'Content-Disposition' => "attachment; filename=\"{$filename}.json\"",
        ]);
    }

    /**
     * Build transaction query based on user type and filters
     */
    private function buildTransactionQuery($user, $filters)
    {
        try {
            if ($user->isAdmin()) {
                $query = Transaction::query();
            } elseif ($user->isGigWorker()) {
                $query = Transaction::where('payee_id', $user->id);
            } else {
                $query = Transaction::where('payer_id', $user->id);
            }

            // Apply filters
            if (!empty($filters['date_from'])) {
                $query->where('created_at', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->where('created_at', '<=', $filters['date_to']);
            }

            if (!empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            return $query;
        } catch (\Exception $e) {
            \Log::error('Query building error: ' . $e->getMessage());
            return Transaction::query();
        }
    }

    /**
     * Get counterparty name for transaction
     */
    private function getCounterpartyName($transaction, $user)
    {
        try {
            if ($user->isAdmin()) {
                return ($transaction->payer?->full_name ?? 'N/A') . ' → ' . ($transaction->payee?->full_name ?? 'N/A');
            } elseif ($user->isGigWorker()) {
                return $transaction->payer?->full_name ?? 'N/A';
            } else {
                return $transaction->payee?->full_name ?? 'N/A';
            }
        } catch (\Exception $e) {
            \Log::error('Counterparty name error: ' . $e->getMessage());
            return 'N/A';
        }
    }
}
