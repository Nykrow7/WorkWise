<?php

namespace App\Services;

use App\Models\User;
use App\Models\GigJob;
use App\Models\Project;
use App\Models\Bid;
use App\Models\Notification;
use App\Models\ContractDeadline;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ExportService
{
    /**
     * Export dashboard data to CSV
     */
    public function exportToCSV(User $employer, string $type = 'all', array $filters = []): string
    {
        $data = $this->getExportData($employer, $type, $filters);

        if (empty($data)) {
            return '';
        }

        // Create CSV content
        $filename = "export_{$type}_" . Carbon::now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = $this->getCSVHeaders($type);

        $output = fopen('php://temp', 'w');

        // Add BOM for UTF-8
        fwrite($output, "\xEF\xBB\xBF");

        // Add headers
        fputcsv($output, $headers);

        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }

    /**
     * Export dashboard data to JSON
     */
    public function exportToJSON(User $employer, string $type = 'all', array $filters = []): string
    {
        $data = $this->getExportData($employer, $type, $filters);

        return json_encode([
            'exported_by' => $employer->first_name . ' ' . $employer->last_name,
            'exported_at' => Carbon::now()->toISOString(),
            'type' => $type,
            'filters' => $filters,
            'data' => $data,
            'summary' => $this->getExportSummary($employer, $type, $filters)
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Export analytics report to PDF (placeholder for PDF generation)
     */
    public function exportToPDF(User $employer): string
    {
        // This would typically use a PDF library like TCPDF or DomPDF
        // For now, return a structured array that could be used to generate PDF

        $analytics = app(EmployerAnalyticsService::class)->getPerformanceMetrics($employer);
        $activities = app(ActivityService::class)->getRecentActivities($employer, 20);

        return json_encode([
            'type' => 'pdf_data',
            'title' => 'Employer Dashboard Report',
            'employer' => $employer->first_name . ' ' . $employer->last_name,
            'generated_at' => Carbon::now()->toISOString(),
            'analytics' => $analytics,
            'activities' => $activities,
            'summary' => $this->getExportSummary($employer, 'all', [])
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Get data for export based on type
     */
    private function getExportData(User $employer, string $type, array $filters = []): array
    {
        switch ($type) {
            case 'jobs':
                return $this->getJobsExportData($employer, $filters);
            case 'proposals':
                return $this->getProposalsExportData($employer, $filters);
            case 'contracts':
                return $this->getContractsExportData($employer, $filters);
            case 'notifications':
                return $this->getNotificationsExportData($employer, $filters);
            case 'deadlines':
                return $this->getDeadlinesExportData($employer, $filters);
            case 'analytics':
                return $this->getAnalyticsExportData($employer, $filters);
            default:
                return $this->getAllExportData($employer, $filters);
        }
    }

    /**
     * Get jobs export data
     */
    private function getJobsExportData(User $employer, array $filters = []): array
    {
        $query = GigJob::where('employer_id', $employer->id)
            ->withCount('bids');

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $jobs = $query->get();

        $data = [];
        foreach ($jobs as $job) {
            $data[] = [
                'ID' => $job->id,
                'Title' => $job->title,
                'Description' => $job->description,
                'Status' => $job->status,
                'Budget Type' => $job->budget_type,
                'Budget Min' => $job->budget_min,
                'Budget Max' => $job->budget_max,
                'Skills Required' => $job->skills_required,
                'Bids Count' => $job->bids_count,
                'Created At' => $job->created_at->format('Y-m-d H:i:s'),
                'Updated At' => $job->updated_at->format('Y-m-d H:i:s')
            ];
        }

        return $data;
    }

    /**
     * Get proposals export data
     */
    private function getProposalsExportData(User $employer, array $filters = []): array
    {
        $query = Bid::whereHas('job', function($q) use ($employer) {
            $q->where('employer_id', $employer->id);
        })->with(['job', 'gigWorker']);

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $proposals = $query->get();

        $data = [];
        foreach ($proposals as $proposal) {
            $data[] = [
                'ID' => $proposal->id,
                'Job Title' => $proposal->job->title,
                'Gig Worker Name' => $proposal->gigWorker->first_name . ' ' . $proposal->gigWorker->last_name,
                'Gig Worker Email' => $proposal->gigWorker->email,
                'Bid Amount' => $proposal->bid_amount,
                'Estimated Days' => $proposal->estimated_days,
                'Status' => $proposal->status,
                'Proposal Message' => substr($proposal->proposal_message, 0, 200) . '...',
                'Submitted At' => $proposal->created_at->format('Y-m-d H:i:s')
            ];
        }

        return $data;
    }

    /**
     * Get contracts export data
     */
    private function getContractsExportData(User $employer, array $filters = []): array
    {
        $query = Project::where('employer_id', $employer->id)
            ->with(['job', 'gigWorker']);

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $contracts = $query->get();

        $data = [];
        foreach ($contracts as $contract) {
            $data[] = [
                'ID' => $contract->id,
                'Job Title' => $contract->job->title,
                'Gig Worker Name' => $contract->gigWorker->first_name . ' ' . $contract->gigWorker->last_name,
                'Agreed Amount' => $contract->agreed_amount,
                'Status' => $contract->status,
                'Contract Signed' => $contract->contract_signed ? 'Yes' : 'No',
                'Started At' => $contract->started_at?->format('Y-m-d H:i:s') ?? 'Not started',
                'Completed At' => $contract->completed_at?->format('Y-m-d H:i:s') ?? 'Not completed',
                'Created At' => $contract->created_at->format('Y-m-d H:i:s')
            ];
        }

        return $data;
    }

    /**
     * Get notifications export data
     */
    private function getNotificationsExportData(User $employer, array $filters = []): array
    {
        $query = Notification::where('user_id', $employer->id);

        // Apply filters
        if (isset($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['read_status'])) {
            $query->where('is_read', $filters['read_status'] === 'read');
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $notifications = $query->get();

        $data = [];
        foreach ($notifications as $notification) {
            $data[] = [
                'ID' => $notification->id,
                'Type' => $notification->type,
                'Title' => $notification->title,
                'Message' => $notification->message,
                'Is Read' => $notification->is_read ? 'Yes' : 'No',
                'Created At' => $notification->created_at->format('Y-m-d H:i:s'),
                'Read At' => $notification->read_at?->format('Y-m-d H:i:s') ?? 'Not read'
            ];
        }

        return $data;
    }

    /**
     * Get deadlines export data
     */
    private function getDeadlinesExportData(User $employer, array $filters = []): array
    {
        $query = ContractDeadline::whereHas('contract', function($q) use ($employer) {
            $q->where('employer_id', $employer->id);
        })->with(['contract.job']);

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('due_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('due_date', '<=', $filters['date_to']);
        }

        $deadlines = $query->get();

        $data = [];
        foreach ($deadlines as $deadline) {
            $data[] = [
                'ID' => $deadline->id,
                'Contract ID' => $deadline->contract_id,
                'Job Title' => $deadline->contract->job->title,
                'Milestone Name' => $deadline->milestone_name,
                'Due Date' => $deadline->due_date->format('Y-m-d'),
                'Status' => $deadline->status,
                'Reminder Sent' => $deadline->reminder_sent ? 'Yes' : 'No',
                'Created At' => $deadline->created_at->format('Y-m-d H:i:s')
            ];
        }

        return $data;
    }

    /**
     * Get analytics export data
     */
    private function getAnalyticsExportData(User $employer, array $filters = []): array
    {
        $analytics = app(EmployerAnalyticsService::class)->getPerformanceMetrics($employer);

        return [
            [
                'Metric' => 'Total Jobs Posted',
                'Value' => $analytics['jobs_posted']['total'],
                'Category' => 'Jobs'
            ],
            [
                'Metric' => 'Active Jobs',
                'Value' => $analytics['jobs_posted']['active'],
                'Category' => 'Jobs'
            ],
            [
                'Metric' => 'Job Completion Rate',
                'Value' => $analytics['jobs_posted']['completion_rate'] . '%',
                'Category' => 'Jobs'
            ],
            [
                'Metric' => 'Total Proposals Received',
                'Value' => $analytics['proposals_received']['total'],
                'Category' => 'Proposals'
            ],
            [
                'Metric' => 'Average Proposals per Job',
                'Value' => $analytics['proposals_received']['avg_per_job'],
                'Category' => 'Proposals'
            ],
            [
                'Metric' => 'Proposal Quality Score',
                'Value' => $analytics['proposals_received']['quality_score'] . '/100',
                'Category' => 'Proposals'
            ],
            [
                'Metric' => 'Total Contracts',
                'Value' => $analytics['contracts_active']['total'],
                'Category' => 'Contracts'
            ],
            [
                'Metric' => 'Active Contracts',
                'Value' => $analytics['contracts_active']['active'],
                'Category' => 'Contracts'
            ],
            [
                'Metric' => 'Contract Completion Rate',
                'Value' => $analytics['contracts_active']['completion_rate'] . '%',
                'Category' => 'Contracts'
            ],
            [
                'Metric' => 'Average Contract Duration',
                'Value' => $analytics['contracts_active']['avg_duration'] . ' days',
                'Category' => 'Contracts'
            ],
            [
                'Metric' => 'Total Spending',
                'Value' => '₱' . number_format($analytics['spending_analysis']['total'], 2),
                'Category' => 'Financial'
            ],
            [
                'Metric' => 'Monthly Spending',
                'Value' => '₱' . number_format($analytics['spending_analysis']['monthly'], 2),
                'Category' => 'Financial'
            ],
            [
                'Metric' => 'Average Project Cost',
                'Value' => '₱' . number_format($analytics['spending_analysis']['avg_per_project'], 2),
                'Category' => 'Financial'
            ],
            [
                'Metric' => 'Platform Fees',
                'Value' => '₱' . number_format($analytics['spending_analysis']['platform_fees'], 2),
                'Category' => 'Financial'
            ],
            [
                'Metric' => 'Average Response Time',
                'Value' => $analytics['response_times']['avg_hours'] . ' hours',
                'Category' => 'Performance'
            ],
            [
                'Metric' => 'Success Rate (Job to Contract)',
                'Value' => $analytics['success_rates']['job_to_contract_rate'] . '%',
                'Category' => 'Performance'
            ]
        ];
    }

    /**
     * Get all export data combined
     */
    private function getAllExportData(User $employer, array $filters = []): array
    {
        $data = [];

        // Add jobs data
        $jobsData = $this->getJobsExportData($employer, $filters);
        foreach ($jobsData as $row) {
            $data[] = array_merge(['Section' => 'Jobs'], $row);
        }

        // Add proposals data
        $proposalsData = $this->getProposalsExportData($employer, $filters);
        foreach ($proposalsData as $row) {
            $data[] = array_merge(['Section' => 'Proposals'], $row);
        }

        // Add contracts data
        $contractsData = $this->getContractsExportData($employer, $filters);
        foreach ($contractsData as $row) {
            $data[] = array_merge(['Section' => 'Contracts'], $row);
        }

        return $data;
    }

    /**
     * Get CSV headers based on type
     */
    private function getCSVHeaders(string $type): array
    {
        switch ($type) {
            case 'jobs':
                return ['ID', 'Title', 'Description', 'Status', 'Budget Type', 'Budget Min', 'Budget Max', 'Skills Required', 'Bids Count', 'Created At', 'Updated At'];
            case 'proposals':
                return ['ID', 'Job Title', 'Gig Worker Name', 'Gig Worker Email', 'Bid Amount', 'Estimated Days', 'Status', 'Proposal Message', 'Submitted At'];
            case 'contracts':
                return ['ID', 'Job Title', 'Gig Worker Name', 'Agreed Amount', 'Status', 'Contract Signed', 'Started At', 'Completed At', 'Created At'];
            case 'notifications':
                return ['ID', 'Type', 'Title', 'Message', 'Is Read', 'Created At', 'Read At'];
            case 'deadlines':
                return ['ID', 'Contract ID', 'Job Title', 'Milestone Name', 'Due Date', 'Status', 'Reminder Sent', 'Created At'];
            case 'analytics':
                return ['Metric', 'Value', 'Category'];
            default:
                return ['Section', 'ID', 'Title', 'Description', 'Status', 'Amount', 'Created At', 'Updated At'];
        }
    }

    /**
     * Get export summary
     */
    private function getExportSummary(User $employer, string $type, array $filters): array
    {
        $summary = [
            'total_records' => 0,
            'date_range' => [
                'from' => $filters['date_from'] ?? 'All time',
                'to' => $filters['date_to'] ?? 'Present'
            ],
            'filters_applied' => $filters,
            'generated_at' => Carbon::now()->toISOString()
        ];

        $data = $this->getExportData($employer, $type, $filters);
        $summary['total_records'] = count($data);

        return $summary;
    }

    /**
     * Get available export formats
     */
    public function getAvailableFormats(): array
    {
        return [
            'csv' => 'CSV (Comma Separated Values)',
            'json' => 'JSON (JavaScript Object Notation)',
            'pdf' => 'PDF (Portable Document Format)'
        ];
    }

    /**
     * Get export types
     */
    public function getAvailableTypes(): array
    {
        return [
            'all' => 'All Data',
            'jobs' => 'Jobs Only',
            'proposals' => 'Proposals Only',
            'contracts' => 'Contracts Only',
            'notifications' => 'Notifications Only',
            'deadlines' => 'Deadlines Only',
            'analytics' => 'Analytics Report'
        ];
    }
}