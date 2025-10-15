<?php

namespace App\Services;

use App\Models\User;
use App\Models\GigJob;
use App\Models\Project;
use App\Models\Bid;
use App\Models\Notification;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Builder;

class SearchService
{
    /**
     * Search across all employer data
     */
    public function search(User $employer, string $query, array $filters = []): array
    {
        $results = [
            'jobs' => $this->searchJobs($employer, $query, $filters),
            'proposals' => $this->searchProposals($employer, $query, $filters),
            'contracts' => $this->searchContracts($employer, $query, $filters),
            'notifications' => $this->searchNotifications($employer, $query, $filters),
            'total' => 0
        ];

        $results['total'] = array_sum(array_column($results, 'total'));

        return $results;
    }

    /**
     * Search jobs
     */
    public function searchJobs(User $employer, string $query, array $filters = []): array
    {
        $queryBuilder = GigJob::where('employer_id', $employer->id)
            ->where(function (Builder $q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('skills_required', 'LIKE', "%{$query}%");
            });

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $queryBuilder->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $queryBuilder->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $queryBuilder->where('created_at', '<=', $filters['date_to']);
        }

        $jobs = $queryBuilder->withCount('bids')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'type' => 'job',
                    'title' => $job->title,
                    'description' => $job->description,
                    'status' => $job->status,
                    'budget' => $job->budget_type === 'fixed' ?
                        "₱{$job->budget_min}" :
                        "₱{$job->budget_min} - ₱{$job->budget_max}",
                    'bids_count' => $job->bids_count,
                    'created_at' => $job->created_at->format('M j, Y'),
                    'url' => route('jobs.show', $job->id),
                    'relevance_score' => $this->calculateRelevanceScore($job->title . ' ' . $job->description, $query)
                ];
            });

        return [
            'results' => $jobs,
            'total' => $jobs->count()
        ];
    }

    /**
     * Search proposals
     */
    public function searchProposals(User $employer, string $query, array $filters = []): array
    {
        $queryBuilder = Bid::whereHas('job', function (Builder $q) use ($employer) {
                $q->where('employer_id', $employer->id);
            })
            ->where(function (Builder $q) use ($query) {
                $q->where('proposal_message', 'LIKE', "%{$query}%")
                  ->orWhereHas('gigWorker', function (Builder $subQuery) use ($query) {
                      $subQuery->where('first_name', 'LIKE', "%{$query}%")
                               ->orWhere('last_name', 'LIKE', "%{$query}%")
                               ->orWhere('email', 'LIKE', "%{$query}%");
                  });
            });

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $queryBuilder->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $queryBuilder->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $queryBuilder->where('created_at', '<=', $filters['date_to']);
        }

        $proposals = $queryBuilder->with(['job', 'gigWorker'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($proposal) {
                return [
                    'id' => $proposal->id,
                    'type' => 'proposal',
                    'title' => "Proposal for {$proposal->job->title}",
                    'description' => $proposal->proposal_message,
                    'status' => $proposal->status,
                    'amount' => "₱{$proposal->bid_amount}",
                    'gig_worker' => $proposal->gigWorker->first_name . ' ' . $proposal->gigWorker->last_name,
                    'created_at' => $proposal->created_at->format('M j, Y'),
                    'url' => route('bids.show', $proposal->id),
                    'relevance_score' => $this->calculateRelevanceScore(
                        $proposal->proposal_message . ' ' . $proposal->gigWorker->first_name . ' ' . $proposal->gigWorker->last_name,
                        $query
                    )
                ];
            });

        return [
            'results' => $proposals,
            'total' => $proposals->count()
        ];
    }

    /**
     * Search contracts
     */
    public function searchContracts(User $employer, string $query, array $filters = []): array
    {
        $queryBuilder = Project::where('employer_id', $employer->id)
            ->where(function (Builder $q) use ($query) {
                $q->whereHas('job', function (Builder $subQuery) use ($query) {
                    $subQuery->where('title', 'LIKE', "%{$query}%")
                             ->orWhere('description', 'LIKE', "%{$query}%");
                })
                ->orWhereHas('gigWorker', function (Builder $subQuery) use ($query) {
                    $subQuery->where('first_name', 'LIKE', "%{$query}%")
                             ->orWhere('last_name', 'LIKE', "%{$query}%");
                });
            });

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $queryBuilder->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $queryBuilder->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $queryBuilder->where('created_at', '<=', $filters['date_to']);
        }

        $contracts = $queryBuilder->with(['job', 'gigWorker'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($contract) {
                return [
                    'id' => $contract->id,
                    'type' => 'contract',
                    'title' => $contract->job->title,
                    'description' => "Contract with {$contract->gigWorker->first_name} {$contract->gigWorker->last_name}",
                    'status' => $contract->status,
                    'amount' => "₱{$contract->agreed_amount}",
                    'gig_worker' => $contract->gigWorker->first_name . ' ' . $contract->gigWorker->last_name,
                    'created_at' => $contract->created_at->format('M j, Y'),
                    'url' => route('projects.show', $contract->id),
                    'relevance_score' => $this->calculateRelevanceScore(
                        $contract->job->title . ' ' . $contract->gigWorker->first_name . ' ' . $contract->gigWorker->last_name,
                        $query
                    )
                ];
            });

        return [
            'results' => $contracts,
            'total' => $contracts->count()
        ];
    }

    /**
     * Search notifications
     */
    public function searchNotifications(User $employer, string $query, array $filters = []): array
    {
        $queryBuilder = Notification::where('user_id', $employer->id)
            ->where(function (Builder $q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('message', 'LIKE', "%{$query}%");
            });

        // Apply filters
        if (isset($filters['type']) && $filters['type'] !== 'all') {
            $queryBuilder->where('type', $filters['type']);
        }

        if (isset($filters['read_status'])) {
            $queryBuilder->where('is_read', $filters['read_status'] === 'read');
        }

        if (isset($filters['date_from'])) {
            $queryBuilder->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $queryBuilder->where('created_at', '<=', $filters['date_to']);
        }

        $notifications = $queryBuilder->latest()
            ->limit(20)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => 'notification',
                    'title' => $notification->title,
                    'description' => $notification->message,
                    'status' => $notification->is_read ? 'read' : 'unread',
                    'created_at' => $notification->created_at->format('M j, Y'),
                    'url' => $notification->action_url,
                    'relevance_score' => $this->calculateRelevanceScore(
                        $notification->title . ' ' . $notification->message,
                        $query
                    )
                ];
            });

        return [
            'results' => $notifications,
            'total' => $notifications->count()
        ];
    }

    /**
     * Get search suggestions
     */
    public function getSuggestions(User $employer, string $query): array
    {
        $suggestions = [];

        // Job title suggestions
        $jobSuggestions = GigJob::where('employer_id', $employer->id)
            ->where('title', 'LIKE', "%{$query}%")
            ->distinct()
            ->pluck('title')
            ->take(5);

        // Gig worker name suggestions
        $gigWorkerSuggestions = \App\Models\User::where('user_type', 'gig_worker')
            ->where(function (Builder $q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%");
            })
            ->distinct()
            ->get()
            ->map(function ($user) {
                return $user->first_name . ' ' . $user->last_name;
            })
            ->take(5);

        // Skill suggestions
        $skillSuggestions = GigJob::where('employer_id', $employer->id)
            ->where('skills_required', 'LIKE', "%{$query}%")
            ->distinct()
            ->pluck('skills_required')
            ->take(5);

        return [
            'jobs' => $jobSuggestions->toArray(),
            'gig_workers' => $gigWorkerSuggestions->toArray(),
            'skills' => $skillSuggestions->toArray()
        ];
    }

    /**
     * Get advanced filters
     */
    public function getAdvancedFilters(User $employer): array
    {
        return [
            'status' => [
                'all' => 'All Statuses',
                'open' => 'Open',
                'in_progress' => 'In Progress',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
                'pending' => 'Pending',
                'accepted' => 'Accepted',
                'rejected' => 'Rejected'
            ],
            'date_ranges' => [
                'today' => 'Today',
                'yesterday' => 'Yesterday',
                'last_7_days' => 'Last 7 Days',
                'last_30_days' => 'Last 30 Days',
                'last_90_days' => 'Last 90 Days',
                'this_month' => 'This Month',
                'last_month' => 'Last Month',
                'custom' => 'Custom Range'
            ],
            'amount_ranges' => [
                '0-1000' => '₱0 - ₱1,000',
                '1000-5000' => '₱1,000 - ₱5,000',
                '5000-10000' => '₱5,000 - ₱10,000',
                '10000-25000' => '₱10,000 - ₱25,000',
                '25000-50000' => '₱25,000 - ₱50,000',
                '50000+' => '₱50,000+'
            ],
            'notification_types' => [
                'all' => 'All Types',
                'escrow_status' => 'Escrow Status',
                'deadline_approaching' => 'Deadlines',
                'message_received' => 'Messages',
                'contract_signing' => 'Contract Signing',
                'bid_status' => 'Bid Status'
            ]
        ];
    }

    /**
     * Calculate relevance score for search results
     */
    private function calculateRelevanceScore(string $content, string $query): float
    {
        $content = strtolower($content);
        $query = strtolower($query);

        $score = 0;

        // Exact phrase match gets highest score
        if (strpos($content, $query) !== false) {
            $score += 100;
        }

        // Word matches get medium score
        $queryWords = explode(' ', $query);
        foreach ($queryWords as $word) {
            if (strlen($word) > 2 && strpos($content, $word) !== false) {
                $score += 10;
            }
        }

        // Partial matches get lower score
        foreach ($queryWords as $word) {
            if (strlen($word) > 2) {
                $partialMatches = substr_count($content, substr($word, 0, 3));
                $score += $partialMatches * 2;
            }
        }

        return $score;
    }

    /**
     * Get search statistics
     */
    public function getSearchStats(User $employer): array
    {
        return [
            'total_jobs' => GigJob::where('employer_id', $employer->id)->count(),
            'total_proposals' => Bid::whereHas('job', function($q) use ($employer) {
                $q->where('employer_id', $employer->id);
            })->count(),
            'total_contracts' => Project::where('employer_id', $employer->id)->count(),
            'total_notifications' => Notification::where('user_id', $employer->id)->count(),
            'recent_searches' => $this->getRecentSearches($employer)
        ];
    }

    /**
     * Get recent searches (placeholder for future implementation)
     */
    private function getRecentSearches(User $employer): array
    {
        return [
            // This would typically come from a search history table
            'web development',
            'mobile app',
            'ui design',
            'laravel developer',
            'react developer'
        ];
    }
}