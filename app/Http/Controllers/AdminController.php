<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Report;
use App\Models\Project;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Admin dashboard
     */
    public function dashboard(): Response
    {
        $stats = [
            'total_users' => User::where('is_admin', false)->count(),
            'total_gig_workers' => User::where('user_type', 'gig_worker')->count(),
            'total_employers' => User::where('user_type', 'employer')->count(),
            'total_admins' => User::where('is_admin', true)->count(),
            'new_users_this_week' => User::where('is_admin', false)->where('created_at', '>=', now()->startOfWeek())->count(),
            'verified_users' => User::where('profile_status', 'approved')->count(),
            'pending_verification' => User::where('profile_status', 'pending')->count(),
            'suspended_users' => User::where('profile_status', 'rejected')->count(),
            'total_projects' => Project::count(),
            'active_projects' => Project::whereIn('status', ['active', 'in_progress'])->count(),
            'completed_projects' => Project::where('status', 'completed')->count(),
            'total_reports' => Report::count(),
            'pending_reports' => Report::where('status', 'pending')->count(),
            'total_transactions' => Transaction::count(),
            'platform_earnings' => Transaction::where('type', 'release')->where('status', 'completed')->sum('platform_fee'),
        ];

        // Get recent activities for the dashboard
        $recentUsers = User::latest()->limit(10)->get();
        $recentReports = Report::with(['reporter', 'reportedUser'])->latest()->limit(5)->get();
        $recentProjects = Project::with(['employer', 'gigWorker'])->latest()->limit(5)->get();

        // Get recent activities (combine different types)
        $recentActivities = collect();

        // Add recent users with more details
        $recentUsers->take(5)->each(function ($user) use ($recentActivities) {
            $userType = ucfirst($user->user_type);
            $verificationStatus = ucfirst($user->profile_status ?? 'pending');
            $recentActivities->push([
                'id' => $user->id,
                'type' => 'user_signup',
                'title' => "New {$userType}: {$user->first_name} {$user->last_name}",
                'subtitle' => "Status: {$verificationStatus} • Email: {$user->email}",
                'time' => $user->created_at->diffForHumans(),
                'icon' => 'person_add',
                'color' => 'emerald',
                'user' => $user
            ]);
        });

        // Add recent completed projects
        $recentProjects->where('status', 'completed')->take(2)->each(function ($project) use ($recentActivities) {
            $jobTitle = $project->job ? $project->job->title : 'Untitled Project';
            $employerName = $project->employer ? $project->employer->first_name . ' ' . $project->employer->last_name : 'Unknown Employer';
            $gigWorkerName = $project->gigWorker ? $project->gigWorker->first_name . ' ' . $project->gigWorker->last_name : 'Unknown Gig Worker';
            $recentActivities->push([
                'id' => $project->id,
                'type' => 'project_completed',
                'title' => "Project '{$jobTitle}' completed",
                'subtitle' => "Employer: {$employerName} • Gig Worker: {$gigWorkerName}",
                'time' => $project->updated_at->diffForHumans(),
                'icon' => 'task_alt',
                'color' => 'pink',
                'project' => $project
            ]);
        });

        // Add recent payments
        $recentTransactions = Transaction::where('type', 'release')
            ->where('status', 'completed')
            ->with(['payer', 'payee', 'project.job'])
            ->latest()
            ->limit(2)
            ->get();

        $recentTransactions->each(function ($transaction) use ($recentActivities) {
            $payerName = $transaction->payer ? $transaction->payer->first_name . ' ' . $transaction->payer->last_name : 'Unknown';
            $payeeName = $transaction->payee ? $transaction->payee->first_name . ' ' . $transaction->payee->last_name : 'Unknown';
            $projectTitle = $transaction->project && $transaction->project->job ? $transaction->project->job->title : 'Unknown Project';
            $recentActivities->push([
                'id' => $transaction->id,
                'type' => 'payment',
                'title' => "Payment: $" . number_format($transaction->amount, 2),
                'subtitle' => "From: {$payerName} • To: {$payeeName} • Project: {$projectTitle}",
                'time' => $transaction->created_at->diffForHumans(),
                'icon' => 'payment',
                'color' => 'blue',
                'transaction' => $transaction
            ]);
        });

        // Add recent reports/disputes
        $recentReports->take(2)->each(function ($report) use ($recentActivities) {
            $reporterName = $report->reporter ? $report->reporter->first_name . ' ' . $report->reporter->last_name : 'Unknown';
            $reportedUserName = $report->reportedUser ? $report->reportedUser->first_name . ' ' . $report->reportedUser->last_name : 'Unknown';
            $projectTitle = $report->project && $report->project->job ? $report->project->job->title : 'Unknown Project';
            $recentActivities->push([
                'id' => $report->id,
                'type' => 'dispute',
                'title' => "New dispute reported",
                'subtitle' => "Reporter: {$reporterName} • Reported: {$reportedUserName} • Project: {$projectTitle}",
                'time' => $report->created_at->diffForHumans(),
                'icon' => 'flag',
                'color' => 'yellow',
                'report' => $report
            ]);
        });

        // Add user verification status changes
        $recentVerificationChanges = User::where('profile_status', '!=', 'pending')
            ->where('updated_at', '>=', now()->subDays(7))
            ->latest('updated_at')
            ->limit(2)
            ->get();

        $recentVerificationChanges->each(function ($user) use ($recentActivities) {
            $statusColor = $user->profile_status === 'approved' ? 'green' : 'red';
            $statusText = $user->profile_status === 'approved' ? 'approved' : 'rejected';
            $recentActivities->push([
                'id' => $user->id,
                'type' => 'verification_change',
                'title' => "User verification updated",
                'subtitle' => "{$user->first_name} {$user->last_name} was {$statusText}",
                'time' => $user->updated_at->diffForHumans(),
                'icon' => $user->profile_status === 'approved' ? 'verified' : 'cancel',
                'color' => $statusColor,
                'user' => $user
            ]);
        });

        // Sort by time and take latest 8
        $recentActivities = $recentActivities->sortByDesc(function ($activity) {
            return strtotime($activity['time']);
        })->take(8)->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentReports' => $recentReports,
            'recentProjects' => $recentProjects,
            'recentActivities' => $recentActivities,
            'url' => request()->path(),
        ]);
    }

    /**
     * Display all users
     */
    public function users(Request $request): Response
    {
        $query = User::where('is_admin', false); // Exclude admin users

        // Filter by user type
        if ($request->filled('user_type')) {
            $query->where('user_type', $request->user_type);
        }

        // Filter by profile status
        if ($request->filled('profile_status')) {
            $query->where('profile_status', $request->profile_status);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['user_type', 'profile_status', 'search']),
        ]);
    }

    /**
     * Show specific user details
     */
    public function showUser(User $user): Response
    {
        $user->load([
            'employerProjects' => function ($query) {
                $query->latest()->limit(5);
            },
            'gigWorkerProjects' => function ($query) {
                $query->latest()->limit(5);
            },
            'reportsSubmitted' => function ($query) {
                $query->latest()->limit(5);
            },
            'reportsReceived' => function ($query) {
                $query->latest()->limit(5);
            },
        ]);

        $stats = [
            'total_projects' => $user->employerProjects()->count() + $user->gigWorkerProjects()->count(),
            'completed_projects' => $user->employerProjects()->where('status', 'completed')->count() +
                                  $user->gigWorkerProjects()->where('status', 'completed')->count(),
            'total_earnings' => $user->isGigWorker() ? $user->total_earnings : 0,
            'total_spent' => $user->isEmployer() ? $user->paymentsMade()->where('status', 'completed')->sum('amount') : 0,
            'reports_submitted' => $user->reportsSubmitted()->count(),
            'reports_received' => $user->reportsReceived()->count(),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    /**
     * Update user status
     */
    public function updateUserStatus(Request $request, User $user)
    {
        $request->validate([
            'profile_status' => 'required|in:pending,approved,rejected',
            'is_admin' => 'boolean',
            'user_type' => 'required|in:gig_worker,employer,admin',
        ]);

        $user->update([
            'profile_status' => $request->profile_status,
            'is_admin' => $request->boolean('is_admin'),
            'user_type' => $request->user_type,
        ]);

        return back()->with('success', 'User status updated successfully.');
    }

    /**
     * Suspend user
     */
    public function suspendUser(User $user)
    {
        $user->update([
            'profile_status' => 'rejected',
        ]);

        return back()->with('success', 'User has been suspended.');
    }

    /**
     * Activate user
     */
    public function activateUser(User $user)
    {
        $user->update([
            'profile_status' => 'approved',
        ]);

        return back()->with('success', 'User has been activated.');
    }

    /**
     * Delete user
     */
    public function deleteUser(User $user)
    {
        // Prevent deleting admin users
        if ($user->isAdmin()) {
            return back()->with('error', 'Cannot delete admin users.');
        }

        $user->delete();

        return redirect()->route('admin.users')->with('success', 'User has been deleted.');
    }

    /**
     * Create new admin user
     */
    public function createAdmin(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => 'admin',
            'is_admin' => true,
            'profile_completed' => true,
            'profile_status' => 'approved',
            'email_verified_at' => now(),
            'barangay' => 'System Admin', // Default value for admin users
        ]);

        return back()->with('success', 'Admin user created successfully.');
    }

    /**
     * Bulk approve users
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $count = User::whereIn('id', $request->user_ids)
            ->where('is_admin', false)
            ->update(['profile_status' => 'approved']);

        return back()->with('success', "{$count} users approved successfully.");
    }

    /**
     * Bulk suspend users
     */
    public function bulkSuspend(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $count = User::whereIn('id', $request->user_ids)
            ->where('is_admin', false)
            ->update(['profile_status' => 'rejected']);

        return back()->with('success', "{$count} users suspended successfully.");
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $count = User::whereIn('id', $request->user_ids)
            ->where('is_admin', false)
            ->delete();

        return back()->with('success', "{$count} users deleted successfully.");
    }

    /**
     * Export users data
     */
    public function exportUsers(Request $request)
    {
        $format = $request->get('format', 'csv');
        $query = User::where('is_admin', false); // Exclude admin users

        // Apply filters if provided
        if ($request->filled('user_type')) {
            $query->where('user_type', $request->user_type);
        }

        if ($request->filled('profile_status')) {
            $query->where('profile_status', $request->profile_status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="users_export_' . now()->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($users) {
                $file = fopen('php://output', 'w');

                // Add headers
                fputcsv($file, [
                    'ID', 'Name', 'Email', 'User Type', 'Profile Status', 'Is Admin',
                    'Joined Date', 'Last Updated', 'Professional Title', 'Location'
                ]);

                // Add data rows
                foreach ($users as $user) {
                    fputcsv($file, [
                        $user->id,
                        $user->first_name . ' ' . $user->last_name,
                        $user->email,
                        $user->user_type,
                        $user->profile_status,
                        $user->is_admin ? 'Yes' : 'No',
                        $user->created_at->format('Y-m-d'),
                        $user->updated_at->format('Y-m-d'),
                        $user->professional_title ?? '',
                        $user->location ?? ''
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // For JSON format
        return response()->json($users, 200, [
            'Content-Disposition' => 'attachment; filename="users_export_' . now()->format('Y-m-d') . '.json"',
        ]);
    }

    /**
     * Get user analytics
     */
    public function userAnalytics()
    {
        $analytics = [
            'total_users' => User::where('is_admin', false)->count(),
            'gig_workers' => User::where('user_type', 'gig_worker')->count(),
            'employers' => User::where('user_type', 'employer')->count(),
            'verified_users' => User::where('profile_status', 'approved')->count(),
            'pending_users' => User::where('profile_status', 'pending')->count(),
            'suspended_users' => User::where('profile_status', 'rejected')->count(),
            'new_users_today' => User::where('is_admin', false)
                ->whereDate('created_at', today())->count(),
            'new_users_this_week' => User::where('is_admin', false)
                ->where('created_at', '>=', now()->startOfWeek())->count(),
            'new_users_this_month' => User::where('is_admin', false)
                ->where('created_at', '>=', now()->startOfMonth())->count(),
            'users_by_status' => User::selectRaw('profile_status, COUNT(*) as count')
                ->groupBy('profile_status')
                ->pluck('count', 'profile_status'),
            'users_by_type' => User::selectRaw('user_type, COUNT(*) as count')
                ->groupBy('user_type')
                ->pluck('count', 'user_type'),
        ];

        return response()->json($analytics);
    }

    /**
     * Admin Projects Management
     */
    public function projects(Request $request): Response
    {
        $query = Project::with(['employer', 'gigWorker', 'job']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by employer
        if ($request->filled('employer_id')) {
            $query->where('employer_id', $request->employer_id);
        }

        // Filter by gig worker
        if ($request->filled('gig_worker_id')) {
            $query->where('gig_worker_id', $request->gig_worker_id);
        }

        // Search by project title
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('job', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(15);

        $stats = [
            'total_projects' => Project::count(),
            'active_projects' => Project::whereIn('status', ['active', 'in_progress'])->count(),
            'completed_projects' => Project::where('status', 'completed')->count(),
            'average_value' => Project::avg('agreed_amount') ?? 0,
        ];

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
            'stats' => $stats,
            'filters' => $request->only(['status', 'employer_id', 'gig_worker_id', 'search']),
            'url' => request()->path(),
        ]);
    }

    /**
     * Admin Payments Management
     */
    public function payments(Request $request): Response
    {
        $query = Transaction::with(['payer', 'payee', 'project.job']);

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by amount range
        if ($request->filled('min_amount')) {
            $query->where('amount', '>=', $request->min_amount);
        }

        if ($request->filled('max_amount')) {
            $query->where('amount', '<=', $request->max_amount);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(15);

        $stats = [
            'total_revenue' => Transaction::where('type', 'release')->where('status', 'completed')->sum('platform_fee'),
            'total_volume' => Transaction::where('type', 'release')->where('status', 'completed')->sum('amount'),
            'successful_transactions' => Transaction::where('status', 'completed')->count(),
            'average_fee_percentage' => Transaction::where('type', 'release')
                ->where('status', 'completed')
                ->where('amount', '>', 0)
                ->selectRaw('AVG((platform_fee / amount) * 100) as avg_fee')
                ->value('avg_fee') ?? 0,
        ];

        return Inertia::render('Admin/Payments/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['type', 'status', 'min_amount', 'max_amount', 'date_from', 'date_to']),
            'url' => request()->path(),
        ]);
    }

    /**
     * Export projects data
     */
    public function exportProjects(Request $request)
    {
        $format = $request->get('format', 'csv');
        $query = Project::with(['job', 'employer', 'gigWorker']);

        // Apply filters if provided
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('job', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        }

        $projects = $query->orderBy('created_at', 'desc')->get();

        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="projects_export_' . now()->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($projects) {
                $file = fopen('php://output', 'w');

                // Add headers
                fputcsv($file, [
                    'ID', 'Project Title', 'Employer', 'Gig Worker', 'Amount', 'Status',
                    'Started', 'Completed', 'Created', 'Updated'
                ]);

                // Add data rows
                foreach ($projects as $project) {
                    fputcsv($file, [
                        $project->id,
                        $project->job->title ?? 'N/A',
                        $project->employer->first_name . ' ' . $project->employer->last_name ?? 'N/A',
                        $project->gigWorker->first_name . ' ' . $project->gigWorker->last_name ?? 'N/A',
                        $project->agreed_amount ?? '0',
                        $project->status,
                        $project->started_at?->format('Y-m-d') ?? 'N/A',
                        $project->completed_at?->format('Y-m-d') ?? 'N/A',
                        $project->created_at->format('Y-m-d'),
                        $project->updated_at->format('Y-m-d'),
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json($projects, 200, [
            'Content-Disposition' => 'attachment; filename="projects_export_' . now()->format('Y-m-d') . '.json"',
        ]);
    }

    /**
     * Export payments data
     */
    public function exportPayments(Request $request)
    {
        $format = $request->get('format', 'csv');
        $query = Transaction::with(['payer', 'payee', 'project.job']);

        // Apply filters if provided
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="payments_export_' . now()->format('Y-m-d') . '.csv"',
            ];

            $callback = function () use ($transactions) {
                $file = fopen('php://output', 'w');

                // Add headers
                fputcsv($file, [
                    'ID', 'Type', 'Amount', 'Platform Fee', 'Status', 'Payer', 'Payee',
                    'Project', 'Created', 'Updated'
                ]);

                // Add data rows
                foreach ($transactions as $transaction) {
                    fputcsv($file, [
                        $transaction->id,
                        $transaction->type,
                        $transaction->amount,
                        $transaction->platform_fee,
                        $transaction->status,
                        $transaction->payer->first_name . ' ' . $transaction->payer->last_name ?? 'N/A',
                        $transaction->payee->first_name . ' ' . $transaction->payee->last_name ?? 'N/A',
                        $transaction->project->job->title ?? 'N/A',
                        $transaction->created_at->format('Y-m-d H:i:s'),
                        $transaction->updated_at->format('Y-m-d H:i:s'),
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json($transactions, 200, [
            'Content-Disposition' => 'attachment; filename="payments_export_' . now()->format('Y-m-d') . '.json"',
        ]);
    }
}
