<?php

namespace App\Services;

use App\Models\User;
use App\Models\GigJob;
use App\Models\Project;
use App\Models\Bid;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class EmployerAnalyticsService
{
    /**
     * Get comprehensive performance metrics for employer
     */
    public function getPerformanceMetrics(User $employer): array
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $sevenDaysAgo = Carbon::now()->subDays(7);

        return [
            'jobs_posted' => $this->getJobsMetrics($employer),
            'proposals_received' => $this->getProposalsMetrics($employer),
            'contracts_active' => $this->getContractsMetrics($employer),
            'spending_analysis' => $this->getSpendingAnalysis($employer),
            'response_times' => $this->getResponseTimeMetrics($employer),
            'success_rates' => $this->getSuccessRateMetrics($employer),
            'trends' => $this->getTrendAnalysis($employer, $thirtyDaysAgo)
        ];
    }

    /**
     * Get jobs posting metrics
     */
    private function getJobsMetrics(User $employer): array
    {
        $totalJobs = GigJob::where('employer_id', $employer->id)->count();
        $activeJobs = GigJob::where('employer_id', $employer->id)
            ->where('status', 'open')->count();
        $recentJobs = GigJob::where('employer_id', $employer->id)
            ->where('created_at', '>=', Carbon::now()->subDays(30))->count();

        return [
            'total' => $totalJobs,
            'active' => $activeJobs,
            'recent' => $recentJobs,
            'completion_rate' => $totalJobs > 0 ?
                round((GigJob::where('employer_id', $employer->id)->where('status', 'completed')->count() / $totalJobs) * 100, 1) : 0
        ];
    }

    /**
     * Get proposals metrics
     */
    private function getProposalsMetrics(User $employer): array
    {
        $totalProposals = Bid::whereHas('job', function($query) use ($employer) {
            $query->where('employer_id', $employer->id);
        })->count();

        $recentProposals = Bid::whereHas('job', function($query) use ($employer) {
            $query->where('employer_id', $employer->id);
        })->where('created_at', '>=', Carbon::now()->subDays(7))->count();

        $avgProposalsPerJob = GigJob::where('employer_id', $employer->id)->count() > 0 ?
            round($totalProposals / GigJob::where('employer_id', $employer->id)->count(), 1) : 0;

        return [
            'total' => $totalProposals,
            'recent' => $recentProposals,
            'avg_per_job' => $avgProposalsPerJob,
            'quality_score' => $this->calculateProposalQualityScore($employer)
        ];
    }

    /**
     * Get contracts metrics
     */
    private function getContractsMetrics(User $employer): array
    {
        $totalContracts = Project::where('employer_id', $employer->id)->count();
        $activeContracts = Project::where('employer_id', $employer->id)
            ->whereIn('status', ['active', 'in_progress'])->count();
        $completedContracts = Project::where('employer_id', $employer->id)
            ->where('status', 'completed')->count();

        $completionRate = $totalContracts > 0 ?
            round(($completedContracts / $totalContracts) * 100, 1) : 0;

        return [
            'total' => $totalContracts,
            'active' => $activeContracts,
            'completed' => $completedContracts,
            'completion_rate' => $completionRate,
            'avg_duration' => $this->getAverageContractDuration($employer)
        ];
    }

    /**
     * Get spending analysis
     */
    private function getSpendingAnalysis(User $employer): array
    {
        $totalSpent = Project::where('employer_id', $employer->id)->sum('agreed_amount');
        $monthlySpent = Project::where('employer_id', $employer->id)
            ->where('created_at', '>=', Carbon::now()->startOfMonth())->sum('agreed_amount');
        $avgProjectCost = Project::where('employer_id', $employer->id)->count() > 0 ?
            round($totalSpent / Project::where('employer_id', $employer->id)->count(), 2) : 0;

        return [
            'total' => $totalSpent,
            'monthly' => $monthlySpent,
            'avg_per_project' => $avgProjectCost,
            'platform_fees' => $totalSpent * 0.05, // Assuming 5% platform fee
            'cost_trend' => $this->getSpendingTrend($employer)
        ];
    }

    /**
     * Get response time metrics
     */
    private function getResponseTimeMetrics(User $employer): array
    {
        $recentBids = Bid::whereHas('job', function($query) use ($employer) {
            $query->where('employer_id', $employer->id);
        })->where('created_at', '>=', Carbon::now()->subDays(30))
        ->with('job')->get();

        $responseTimes = [];
        foreach ($recentBids as $bid) {
            // Calculate time from bid creation to status change
            $responseTime = $bid->updated_at->diffInHours($bid->created_at);
            $responseTimes[] = $responseTime;
        }

        $avgResponseTime = count($responseTimes) > 0 ? round(array_sum($responseTimes) / count($responseTimes), 1) : 0;

        return [
            'avg_hours' => $avgResponseTime,
            'within_24h' => count(array_filter($responseTimes, fn($time) => $time <= 24)),
            'within_48h' => count(array_filter($responseTimes, fn($time) => $time <= 48)),
            'over_48h' => count(array_filter($responseTimes, fn($time) => $time > 48))
        ];
    }

    /**
     * Get success rate metrics
     */
    private function getSuccessRateMetrics(User $employer): array
    {
        $totalJobs = GigJob::where('employer_id', $employer->id)->count();
        $jobsWithContracts = GigJob::where('employer_id', $employer->id)
            ->whereHas('projects')->count();

        $successRate = $totalJobs > 0 ? round(($jobsWithContracts / $totalJobs) * 100, 1) : 0;

        return [
            'job_to_contract_rate' => $successRate,
            'avg_bids_to_contract' => $this->getAvgBidsToContract($employer),
            'employer_satisfaction' => $this->getEmployerSatisfactionScore($employer)
        ];
    }

    /**
     * Get trend analysis
     */
    private function getTrendAnalysis(User $employer, Carbon $since): array
    {
        $periods = collect(range(0, 29))->map(function($days) use ($since, $employer) {
            $date = $since->copy()->addDays($days);
            return [
                'date' => $date->format('Y-m-d'),
                'jobs' => GigJob::where('employer_id', $employer->id)
                    ->whereDate('created_at', $date)->count(),
                'proposals' => Bid::whereHas('job', function($query) use ($employer) {
                    $query->where('employer_id', $employer->id);
                })->whereDate('created_at', $date)->count(),
                'contracts' => Project::where('employer_id', $employer->id)
                    ->whereDate('created_at', $date)->count()
            ];
        });

        return [
            'jobs_trend' => $periods->pluck('jobs')->toArray(),
            'proposals_trend' => $periods->pluck('proposals')->toArray(),
            'contracts_trend' => $periods->pluck('contracts')->toArray(),
            'growth_rate' => $this->calculateGrowthRate($employer, $since)
        ];
    }

    /**
     * Calculate proposal quality score
     */
    private function calculateProposalQualityScore(User $employer): float
    {
        $proposals = Bid::whereHas('job', function($query) use ($employer) {
            $query->where('employer_id', $employer->id);
        })->with(['gigWorker'])->get();

        if ($proposals->isEmpty()) return 0;

        $qualityFactors = [
            'experience' => $proposals->avg(fn($p) => 1), // Simplified for now
            'rating' => $proposals->avg(fn($p) => 4.0), // Default rating
            'completeness' => $proposals->avg(fn($p) => strlen($p->proposal_message) > 100 ? 1 : 0.5)
        ];

        return round((array_sum($qualityFactors) / count($qualityFactors)) * 20, 1); // Scale to 0-100
    }

    /**
     * Get average contract duration
     */
    private function getAverageContractDuration(User $employer): int
    {
        $completedProjects = Project::where('employer_id', $employer->id)
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->get();

        if ($completedProjects->isEmpty()) return 0;

        $durations = $completedProjects->map(function($project) {
            return Carbon::parse($project->started_at)->diffInDays($project->completed_at);
        });

        return round($durations->avg());
    }

    /**
     * Get spending trend
     */
    private function getSpendingTrend(User $employer): string
    {
        $thisMonth = Project::where('employer_id', $employer->id)
            ->where('created_at', '>=', Carbon::now()->startOfMonth())->sum('agreed_amount');

        $lastMonth = Project::where('employer_id', $employer->id)
            ->whereBetween('created_at', [
                Carbon::now()->subMonth()->startOfMonth(),
                Carbon::now()->subMonth()->endOfMonth()
            ])->sum('agreed_amount');

        if ($lastMonth == 0) return $thisMonth > 0 ? 'increasing' : 'stable';

        $change = (($thisMonth - $lastMonth) / $lastMonth) * 100;

        if ($change > 10) return 'increasing';
        if ($change < -10) return 'decreasing';
        return 'stable';
    }

    /**
     * Get average bids to contract ratio
     */
    private function getAvgBidsToContract(User $employer): float
    {
        $jobsWithContracts = GigJob::where('employer_id', $employer->id)
            ->whereHas('projects')->withCount('bids')->get();

        if ($jobsWithContracts->isEmpty()) return 0;

        return round($jobsWithContracts->avg('bids_count'), 1);
    }

    /**
         * Get employer satisfaction score
         */
        private function getEmployerSatisfactionScore(User $employer): float
    {
        // This would typically come from review/rating data
        // For now, return a placeholder based on completion rate
        $completionRate = $this->getContractsMetrics($employer)['completion_rate'];
        return min(100, $completionRate + 10); // Add 10 points as baseline satisfaction
    }

    /**
     * Calculate growth rate
     */
    private function calculateGrowthRate(User $employer, Carbon $since): array
    {
        $recentJobs = GigJob::where('employer_id', $employer->id)
            ->where('created_at', '>=', $since)->count();

        $previousJobs = GigJob::where('employer_id', $employer->id)
            ->whereBetween('created_at', [
                $since->copy()->subDays(30),
                $since->copy()->subDays(1)
            ])->count();

        $growthRate = $previousJobs > 0 ?
            round((($recentJobs - $previousJobs) / $previousJobs) * 100, 1) : 0;

        return [
            'jobs' => $growthRate,
            'direction' => $growthRate > 0 ? 'up' : ($growthRate < 0 ? 'down' : 'stable')
        ];
    }
}