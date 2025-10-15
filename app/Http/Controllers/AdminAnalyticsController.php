<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use App\Models\Transaction;
use App\Models\Bid;
use App\Models\Review;
use App\Models\GigJob;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    /**
     * Platform overview analytics
     */
    public function overview(): Response
    {
        $overview = [
            'users' => [
                'total' => User::where('is_admin', false)->count(),
                'gig_workers' => User::where('user_type', 'gig_worker')->count(),
                'employers' => User::where('user_type', 'employer')->count(),
                'admins' => User::where('is_admin', true)->count(),
                'new_this_month' => User::where('is_admin', false)->where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
                'verified_profiles' => User::where('profile_status', 'approved')->count(),
            ],

            'projects' => [
                'total' => Project::count(),
                'active' => Project::whereIn('status', ['active', 'in_progress'])->count(),
                'completed' => Project::where('status', 'completed')->count(),
                'cancelled' => Project::where('status', 'cancelled')->count(),
                'total_value' => Project::sum('agreed_amount'),
                'average_value' => Project::avg('agreed_amount') ?? 0,
            ],

            'financial' => [
                'total_earnings' => Transaction::where('type', 'release')->where('status', 'completed')->sum('platform_fee'),
                'total_transactions' => Transaction::count(),
                'successful_transactions' => Transaction::where('status', 'completed')->count(),
                'escrow_balance' => User::sum('escrow_balance'),
                'average_transaction' => Transaction::where('status', 'completed')->avg('amount') ?? 0,
            ],

            'activity' => [
                'total_jobs' => GigJob::count(),
                'open_jobs' => GigJob::where('status', 'open')->count(),
                'total_bids' => Bid::count(),
                'average_bids_per_job' => GigJob::has('bids')->withCount('bids')->get()->avg('bids_count') ?? 0,
                'total_reviews' => Review::count(),
                'average_rating' => Review::avg('rating') ?? 0,
            ],

            'reports' => [
                'total_reports' => Report::count(),
                'pending_reports' => Report::where('status', 'pending')->count(),
                'resolved_reports' => Report::where('status', 'resolved')->count(),
                'fraud_reports' => Report::where('type', 'fraud')->count(),
            ],
        ];

        return Inertia::render('Admin/Analytics/Overview', [
            'overview' => $overview,
        ]);
    }

    /**
     * User growth analytics
     */
    public function userGrowth(Request $request): Response
    {
        $period = $request->get('period', '12months');
        $months = $period === '12months' ? 12 : ($period === '6months' ? 6 : 3);

        $userGrowth = User::selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                COUNT(*) as count,
                SUM(CASE WHEN user_type = "gig_worker" THEN 1 ELSE 0 END) as gig_workers,
                SUM(CASE WHEN user_type = "employer" THEN 1 ELSE 0 END) as employers
            ')
            ->where('created_at', '>=', Carbon::now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $userTypes = [
            'gig_workers' => User::where('user_type', 'gig_worker')->count(),
            'employers' => User::where('user_type', 'employer')->count(),
            'admins' => User::where('is_admin', true)->count(),
        ];

        $profileStatus = [
            'pending' => User::where('profile_status', 'pending')->count(),
            'approved' => User::where('profile_status', 'approved')->count(),
            'rejected' => User::where('profile_status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Analytics/UserGrowth', [
            'userGrowth' => $userGrowth,
            'userTypes' => $userTypes,
            'profileStatus' => $profileStatus,
            'period' => $period,
        ]);
    }

    /**
     * Financial analytics
     */
    public function financial(Request $request): Response
    {
        $period = $request->get('period', '12months');
        $months = $period === '12months' ? 12 : ($period === '6months' ? 6 : 3);

        $revenue = Transaction::selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                SUM(CASE WHEN type = "release" AND status = "completed" THEN platform_fee ELSE 0 END) as revenue,
                SUM(CASE WHEN type = "release" AND status = "completed" THEN amount ELSE 0 END) as total_volume,
                COUNT(CASE WHEN type = "release" AND status = "completed" THEN 1 END) as transaction_count
            ')
            ->where('created_at', '>=', Carbon::now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $financialMetrics = [
            'total_revenue' => Transaction::where('type', 'release')->where('status', 'completed')->sum('platform_fee'),
            'total_volume' => Transaction::where('type', 'release')->where('status', 'completed')->sum('amount'),
            'average_fee_percentage' => Transaction::where('type', 'release')
                ->where('status', 'completed')
                ->where('amount', '>', 0)
                ->selectRaw('AVG((platform_fee / amount) * 100) as avg_fee')
                ->value('avg_fee') ?? 0,
            'escrow_balance' => User::sum('escrow_balance'),
            'pending_payments' => Transaction::where('status', 'pending')->sum('amount'),
        ];

        return Inertia::render('Admin/Analytics/Financial', [
            'revenue' => $revenue,
            'financialMetrics' => $financialMetrics,
            'period' => $period,
        ]);
    }

    /**
     * Project analytics
     */
    public function projects(Request $request): Response
    {
        $period = $request->get('period', '12months');
        $months = $period === '12months' ? 12 : ($period === '6months' ? 6 : 3);

        $projectTrends = Project::selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                COUNT(*) as total_projects,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_projects,
                SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_projects,
                AVG(CASE WHEN agreed_amount IS NOT NULL THEN agreed_amount ELSE 0 END) as avg_value
            ')
            ->where('created_at', '>=', Carbon::now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $projectStats = [
            'total_projects' => Project::count(),
            'completion_rate' => Project::count() > 0 ?
                (Project::where('status', 'completed')->count() / Project::count()) * 100 : 0,
            'average_duration' => Project::whereNotNull('completed_at')
                ->whereNotNull('started_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(DAY, started_at, completed_at)) as avg_duration')
                ->value('avg_duration') ?? 0,
            'average_value' => Project::avg('agreed_amount') ?? 0,
            'by_status' => Project::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
        ];

        return Inertia::render('Admin/Analytics/Projects', [
            'projectTrends' => $projectTrends,
            'projectStats' => $projectStats,
            'period' => $period,
        ]);
    }

    /**
     * Export analytics data
     */
    public function export(Request $request)
    {
        $type = $request->get('type', 'overview');
        $format = $request->get('format', 'csv');

        switch ($type) {
            case 'users':
                return $this->exportUsers($format);
            case 'financial':
                return $this->exportFinancial($format);
            case 'projects':
                return $this->exportProjects($format);
            default:
                return $this->exportOverview($format);
        }
    }

    /**
     * Export user data
     */
    private function exportUsers($format)
    {
        $users = User::with(['employerProjects', 'gigWorkerProjects'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'Name' => $user->full_name,
                    'Email' => $user->email,
                    'Type' => $user->user_type,
                    'Profile Status' => $user->profile_status,
                    'Is Admin' => $user->is_admin ? 'Yes' : 'No',
                    'Joined' => $user->created_at->format('Y-m-d'),
                    'Projects Completed' => $user->employerProjects()->where('status', 'completed')->count() +
                                           $user->gigWorkerProjects()->where('status', 'completed')->count(),
                ];
            });

        return $this->generateExportResponse($users, 'users_export', $format);
    }

    /**
     * Export financial data
     */
    private function exportFinancial($format)
    {
        $transactions = Transaction::with(['project.job', 'payer', 'payee'])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'Date' => $transaction->created_at->format('Y-m-d'),
                    'Type' => $transaction->type,
                    'Amount' => $transaction->amount,
                    'Platform Fee' => $transaction->platform_fee,
                    'Project' => $transaction->project->job->title ?? 'N/A',
                    'Payer' => $transaction->payer->full_name ?? 'N/A',
                    'Payee' => $transaction->payee->full_name ?? 'N/A',
                ];
            });

        return $this->generateExportResponse($transactions, 'financial_export', $format);
    }

    /**
     * Export project data
     */
    private function exportProjects($format)
    {
        $projects = Project::with(['job', 'employer', 'gigWorker'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'Title' => $project->job->title ?? 'N/A',
                    'Employer' => $project->employer->full_name ?? 'N/A',
                    'Gig Worker' => $project->gigWorker->full_name ?? 'N/A',
                    'Amount' => $project->agreed_amount,
                    'Status' => $project->status,
                    'Started' => $project->started_at?->format('Y-m-d') ?? 'N/A',
                    'Completed' => $project->completed_at?->format('Y-m-d') ?? 'N/A',
                    'Created' => $project->created_at->format('Y-m-d'),
                ];
            });

        return $this->generateExportResponse($projects, 'projects_export', $format);
    }

    /**
     * Export overview data
     */
    private function exportOverview($format)
    {
        $overview = [
            ['Metric' => 'Total Users', 'Value' => User::where('is_admin', false)->count()],
            ['Metric' => 'Total Gig Workers', 'Value' => User::where('user_type', 'gig_worker')->count()],
            ['Metric' => 'Total Employers', 'Value' => User::where('user_type', 'employer')->count()],
            ['Metric' => 'Total Projects', 'Value' => Project::count()],
            ['Metric' => 'Completed Projects', 'Value' => Project::where('status', 'completed')->count()],
            ['Metric' => 'Total Revenue', 'Value' => Transaction::where('type', 'release')->where('status', 'completed')->sum('platform_fee')],
            ['Metric' => 'Total Reports', 'Value' => Report::count()],
            ['Metric' => 'Pending Reports', 'Value' => Report::where('status', 'pending')->count()],
        ];

        return $this->generateExportResponse($overview, 'overview_export', $format);
    }

    /**
     * Generate export response
     */
    private function generateExportResponse($data, $filename, $format)
    {
        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}_" . now()->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($data) {
                $file = fopen('php://output', 'w');

                if (!empty($data)) {
                    // Add headers
                    fputcsv($file, array_keys($data[0]));

                    // Add data rows
                    foreach ($data as $row) {
                        fputcsv($file, $row);
                    }
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // For JSON format
        return response()->json($data, 200, [
            'Content-Disposition' => "attachment; filename=\"{$filename}_" . now()->format('Y-m-d') . '.json"',
        ]);
    }
}
