<?php

namespace App\Http\Controllers;

use App\Models\GigJob;
use App\Models\Bid;
use App\Models\Project;
use App\Models\Notification;
use App\Services\NotificationManager;
use App\Services\DeadlineTracker;
use App\Services\NotificationService;
use App\Services\EmployerAnalyticsService;
use App\Services\ActivityService;
use App\Services\SearchService;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployerDashboardController extends Controller
{
    protected NotificationManager $notificationManager;
    protected DeadlineTracker $deadlineTracker;
    protected NotificationService $notificationService;
    protected EmployerAnalyticsService $analyticsService;
    protected ActivityService $activityService;
    protected SearchService $searchService;
    protected ExportService $exportService;

    public function __construct(
        NotificationManager $notificationManager,
        DeadlineTracker $deadlineTracker,
        NotificationService $notificationService,
        EmployerAnalyticsService $analyticsService,
        ActivityService $activityService,
        SearchService $searchService,
        ExportService $exportService
    ) {
        $this->notificationManager = $notificationManager;
        $this->deadlineTracker = $deadlineTracker;
        $this->notificationService = $notificationService;
        $this->analyticsService = $analyticsService;
        $this->activityService = $activityService;
        $this->searchService = $searchService;
        $this->exportService = $exportService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Ensure only employers can access this dashboard
        if ($user->user_type !== 'employer') {
            return redirect()->route('dashboard');
        }

        // Get employer's posted jobs summary
        $jobsSummary = $this->getJobsSummary($user);

        // Get proposals received
        $proposalsReceived = $this->getProposalsReceived($user);

        // Get active contracts with progress
        $activeContracts = $this->getActiveContracts($user);

        // Get notifications data
        $notifications = $this->getNotificationsData($user);

        // Get analytics data
        $analytics = $this->analyticsService->getPerformanceMetrics($user);

        // Get activity data
        $activities = $this->activityService->getRecentActivities($user, 8);
        $activityStats = $this->activityService->getActivityStats($user);

        return Inertia::render('Employer/Dashboard', [
            'jobsSummary' => $jobsSummary,
            'proposalsReceived' => $proposalsReceived,
            'activeContracts' => $activeContracts,
            'notifications' => $notifications,
            'analytics' => $analytics,
            'activities' => $activities,
            'activityStats' => $activityStats,
            'stats' => [
                'totalJobs' => $jobsSummary['total'],
                'activeJobs' => $jobsSummary['active'],
                'totalProposals' => count($proposalsReceived),
                'activeContracts' => count($activeContracts),
                'completionRate' => $analytics['jobs_posted']['completion_rate'],
                'avgResponseTime' => $analytics['response_times']['avg_hours'],
                'successRate' => $analytics['success_rates']['job_to_contract_rate'],
                'monthlySpent' => $analytics['spending_analysis']['monthly']
            ]
        ]);
    }

    private function getJobsSummary($user)
    {
        $jobs = GigJob::where('employer_id', $user->id)
            ->select('status', 'created_at')
            ->get();

        return [
            'total' => $jobs->count(),
            'active' => $jobs->where('status', 'open')->count(),
            'completed' => $jobs->where('status', 'completed')->count(),
            'draft' => $jobs->where('status', 'draft')->count(),
            'recent' => $jobs->where('created_at', '>=', now()->subDays(30))->count(),
            'jobs' => GigJob::where('employer_id', $user->id)
                ->withCount(['bids'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($job) {
                    return [
                        'id' => $job->id,
                        'title' => $job->title,
                        'status' => $job->status,
                        'created_at' => $job->created_at,
                        'bids_count' => $job->bids_count,
                        'budget_type' => $job->budget_type,
                        'budget_min' => $job->budget_min,
                        'budget_max' => $job->budget_max,
                    ];
                })
        ];
    }

    private function getProposalsReceived($user)
    {
        return Bid::whereHas('job', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })
            ->with(['job', 'gigWorker'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($bid) {
                return [
                    'id' => $bid->id,
                    'job_title' => $bid->job->title,
                    'job_id' => $bid->job->id,
                    'gig_worker_name' => $bid->gigWorker->first_name . ' ' . $bid->gigWorker->last_name,
                'gig_worker_id' => $bid->gigWorker->id,
                    'bid_amount' => $bid->bid_amount,
                    'proposal_message' => $bid->proposal_message,
                    'estimated_days' => $bid->estimated_days,
                    'submitted_at' => $bid->submitted_at,
                    'status' => $bid->status,
                ];
            });
    }

    private function getActiveContracts($user)
    {
        return Project::where('employer_id', $user->id)
            ->where('contract_signed', true)
            ->whereIn('status', ['active', 'in_progress'])
            ->with(['gigWorker', 'job'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'job_title' => $project->job->title,
                    'gig_worker_name' => $project->gigWorker->first_name . ' ' . $project->gigWorker->last_name,
                'gig_worker_id' => $project->gigWorker->id,
                    'agreed_amount' => $project->agreed_amount,
                    'status' => $project->status,
                    'started_at' => $project->started_at,
                    'progress_percentage' => $project->getProgressPercentageAttribute(),
                    'payment_released' => $project->payment_released,
                    'contract_signed_at' => $project->contract_signed_at,
                ];
            });
    }

    /**
     * Get notifications data for dashboard
     */
    private function getNotificationsData($user)
    {
        return [
            'recent' => $this->notificationManager->getRelevantNotifications($user),
            'escrow' => $this->notificationManager->getEscrowAlerts($user),
            'deadlines' => $this->notificationManager->getUpcomingDeadlines($user),
            'messages' => $this->notificationManager->getMessageNotifications($user),
            'unreadCount' => $this->notificationService->getUnreadCount($user)
        ];
    }

    /**
     * Get notification service instance
     */
    protected function getNotificationService(): NotificationService
    {
        return $this->notificationService;
    }

    /**
     * Search across all employer data
     */
    public function search(Request $request)
    {
        $user = $request->user();

        // Ensure only employers can access this
        if ($user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = $request->get('q', '');
        $filters = $request->get('filters', []);

        if (empty($query) && empty($filters)) {
            return response()->json([
                'results' => [],
                'total' => 0,
                'suggestions' => $this->searchService->getSuggestions($user, ''),
                'filters' => $this->searchService->getAdvancedFilters($user)
            ]);
        }

        $results = $this->searchService->search($user, $query, $filters);

        return response()->json([
            'results' => $results,
            'query' => $query,
            'filters' => $filters,
            'suggestions' => $this->searchService->getSuggestions($user, $query),
            'available_filters' => $this->searchService->getAdvancedFilters($user)
        ]);
    }

    /**
     * Get search suggestions
     */
    public function getSuggestions(Request $request)
    {
        $user = $request->user();

        if ($user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = $request->get('q', '');

        return response()->json([
            'suggestions' => $this->searchService->getSuggestions($user, $query)
        ]);
    }

    /**
     * Get available filters
     */
    public function getFilters(Request $request)
    {
        $user = $request->user();

        if ($user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'filters' => $this->searchService->getAdvancedFilters($user),
            'stats' => $this->searchService->getSearchStats($user)
        ]);
    }

    /**
     * Export dashboard data
     */
    public function export(Request $request)
    {
        $user = $request->user();

        // Ensure only employers can access this
        if ($user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $format = $request->get('format', 'csv');
        $type = $request->get('type', 'all');
        $filters = $request->get('filters', []);

        // Validate format
        if (!in_array($format, ['csv', 'json', 'pdf'])) {
            return response()->json(['error' => 'Invalid export format'], 400);
        }

        // Validate type
        if (!in_array($type, ['all', 'jobs', 'proposals', 'contracts', 'notifications', 'deadlines', 'analytics'])) {
            return response()->json(['error' => 'Invalid export type'], 400);
        }

        try {
            switch ($format) {
                case 'csv':
                    $content = $this->exportService->exportToCSV($user, $type, $filters);
                    $filename = "export_{$type}_" . now()->format('Y-m-d_H-i-s') . '.csv';
                    $mimeType = 'text/csv';
                    break;

                case 'json':
                    $content = $this->exportService->exportToJSON($user, $type, $filters);
                    $filename = "export_{$type}_" . now()->format('Y-m-d_H-i-s') . '.json';
                    $mimeType = 'application/json';
                    break;

                case 'pdf':
                    $content = $this->exportService->exportToPDF($user);
                    $filename = "export_report_" . now()->format('Y-m-d_H-i-s') . '.json'; // PDF data as JSON
                    $mimeType = 'application/json';
                    break;

                default:
                    return response()->json(['error' => 'Unsupported format'], 400);
            }

            return response($content, 200, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Export failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available export formats
     */
    public function getExportFormats(Request $request)
    {
        $user = $request->user();

        if ($user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'formats' => $this->exportService->getAvailableFormats(),
            'types' => $this->exportService->getAvailableTypes()
        ]);
    }

    /**
     * Get export preview
     */
    public function getExportPreview(Request $request)
    {
        $user = $request->user();

        if ($user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $type = $request->get('type', 'all');
        $filters = $request->get('filters', []);

        try {
            $data = $this->exportService->getExportData($user, $type, $filters);
            $summary = $this->exportService->getExportSummary($user, $type, $filters);

            return response()->json([
                'preview' => array_slice($data, 0, 10), // Show first 10 records
                'total_records' => count($data),
                'summary' => $summary,
                'headers' => $this->exportService->getCSVHeaders($type)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Preview failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}