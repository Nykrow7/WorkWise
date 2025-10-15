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

class ActivityService
{
    /**
     * Get recent activities for employer dashboard
     */
    public function getRecentActivities(User $employer, int $limit = 10): Collection
    {
        $activities = collect();

        // Get recent job posts
        $recentJobs = GigJob::where('employer_id', $employer->id)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->withCount('bids')
            ->latest()
            ->limit(3)
            ->get();

        foreach ($recentJobs as $job) {
            $activities->push([
                'type' => 'job_posted',
                'title' => 'New Job Posted',
                'description' => "Posted \"{$job->title}\" - {$job->bids_count} proposals received",
                'time' => $this->getTimeAgo($job->created_at),
                'icon' => 'briefcase',
                'color' => 'blue',
                'action_url' => route('jobs.show', $job->id)
            ]);
        }

        // Get recent contract signings
        $recentContracts = Project::where('employer_id', $employer->id)
            ->where('contract_signed', true)
            ->where('contract_signed_at', '>=', Carbon::now()->subDays(7))
            ->with(['job', 'gigWorker'])
            ->latest('contract_signed_at')
            ->limit(3)
            ->get();

        foreach ($recentContracts as $contract) {
            $activities->push([
                'type' => 'contract_signed',
                'title' => 'Contract Signed',
                'description' => "Contract signed with {$contract->gigWorker->first_name} {$contract->gigWorker->last_name} for {$contract->job->title}",
                'time' => $this->getTimeAgo($contract->contract_signed_at),
                'icon' => 'check-circle',
                'color' => 'purple',
                'action_url' => route('projects.show', $contract->id)
            ]);
        }

        // Get recent payments/milestones
        $recentPayments = Project::where('employer_id', $employer->id)
            ->where('payment_released', true)
            ->where('payment_released_at', '>=', Carbon::now()->subDays(7))
            ->with(['job'])
            ->latest('payment_released_at')
            ->limit(3)
            ->get();

        foreach ($recentPayments as $payment) {
            $activities->push([
                'type' => 'payment_made',
                'title' => 'Payment Released',
                'description' => "Released ₱{$payment->agreed_amount} payment for {$payment->job->title} milestone",
                'time' => $this->getTimeAgo($payment->payment_released_at),
                'icon' => 'currency-dollar',
                'color' => 'yellow',
                'action_url' => route('projects.show', $payment->id)
            ]);
        }

        // Get completed deadlines
        $completedDeadlines = ContractDeadline::whereHas('contract', function($query) use ($employer) {
                $query->where('employer_id', $employer->id);
            })
            ->where('status', 'completed')
            ->where('updated_at', '>=', Carbon::now()->subDays(7))
            ->with(['contract.job'])
            ->latest('updated_at')
            ->limit(3)
            ->get();

        foreach ($completedDeadlines as $deadline) {
            $activities->push([
                'type' => 'deadline_met',
                'title' => 'Deadline Completed',
                'description' => "\"{$deadline->milestone_name}\" milestone completed for {$deadline->contract->job->title}",
                'time' => $this->getTimeAgo($deadline->updated_at),
                'icon' => 'clock',
                'color' => 'indigo',
                'action_url' => route('projects.show', $deadline->contract_id)
            ]);
        }

        // Get recent proposals
        $recentProposals = Bid::whereHas('job', function($query) use ($employer) {
                $query->where('employer_id', $employer->id);
            })
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->with(['job', 'gigWorker'])
            ->latest()
            ->limit(3)
            ->get();

        foreach ($recentProposals as $proposal) {
            $activities->push([
                'type' => 'proposal_received',
                'title' => 'New Proposal',
                'description' => "Received proposal from {$proposal->gigWorker->first_name} {$proposal->gigWorker->last_name} for {$proposal->job->title}",
                'time' => $this->getTimeAgo($proposal->created_at),
                'icon' => 'document-text',
                'color' => 'green',
                'action_url' => route('bids.show', $proposal->id)
            ]);
        }

        // Get recent notifications
        $recentNotifications = Notification::where('user_id', $employer->id)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->whereIn('type', ['escrow_status', 'deadline_approaching'])
            ->latest()
            ->limit(2)
            ->get();

        foreach ($recentNotifications as $notification) {
            $activities->push([
                'type' => 'notification',
                'title' => 'System Notification',
                'description' => $notification->message,
                'time' => $this->getTimeAgo($notification->created_at),
                'icon' => $notification->icon,
                'color' => 'gray',
                'action_url' => $notification->action_url
            ]);
        }

        // Sort by time and limit
        return $activities->sortByDesc(function($activity) {
            // Parse relative time strings back to timestamps for sorting
            if (preg_match('/(\d+)\s*(minute|hour|day|week)s?\s*ago/', $activity['time'], $matches)) {
                $value = $matches[1];
                $unit = $matches[2];

                $carbon = Carbon::now();
                switch ($unit) {
                    case 'minute':
                        $carbon->subMinutes($value);
                        break;
                    case 'hour':
                        $carbon->subHours($value);
                        break;
                    case 'day':
                        $carbon->subDays($value);
                        break;
                    case 'week':
                        $carbon->subWeeks($value);
                        break;
                }
                return $carbon->timestamp;
            }
            return 0;
        })->take($limit)->values();
    }

    /**
     * Get activity statistics
     */
    public function getActivityStats(User $employer): array
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'today' => [
                'jobs_posted' => GigJob::where('employer_id', $employer->id)->whereDate('created_at', $today)->count(),
                'proposals_received' => Bid::whereHas('job', function($q) use ($employer) {
                    $q->where('employer_id', $employer->id);
                })->whereDate('created_at', $today)->count(),
                'contracts_signed' => Project::where('employer_id', $employer->id)
                    ->whereDate('contract_signed_at', $today)->count(),
            ],
            'this_week' => [
                'jobs_posted' => GigJob::where('employer_id', $employer->id)->where('created_at', '>=', $thisWeek)->count(),
                'proposals_received' => Bid::whereHas('job', function($q) use ($employer) {
                    $q->where('employer_id', $employer->id);
                })->where('created_at', '>=', $thisWeek)->count(),
                'contracts_signed' => Project::where('employer_id', $employer->id)
                    ->where('contract_signed_at', '>=', $thisWeek)->count(),
            ],
            'this_month' => [
                'jobs_posted' => GigJob::where('employer_id', $employer->id)->where('created_at', '>=', $thisMonth)->count(),
                'proposals_received' => Bid::whereHas('job', function($q) use ($employer) {
                    $q->where('employer_id', $employer->id);
                })->where('created_at', '>=', $thisMonth)->count(),
                'contracts_signed' => Project::where('employer_id', $employer->id)
                    ->where('contract_signed_at', '>=', $thisMonth)->count(),
            ]
        ];
    }

    /**
     * Convert timestamp to relative time string
     */
    private function getTimeAgo(Carbon $timestamp): string
    {
        $now = Carbon::now();

        if ($timestamp->diffInMinutes($now) < 1) {
            return 'Just now';
        } elseif ($timestamp->diffInMinutes($now) < 60) {
            return $timestamp->diffInMinutes($now) . ' minute' . ($timestamp->diffInMinutes($now) > 1 ? 's' : '') . ' ago';
        } elseif ($timestamp->diffInHours($now) < 24) {
            return $timestamp->diffInHours($now) . ' hour' . ($timestamp->diffInHours($now) > 1 ? 's' : '') . ' ago';
        } elseif ($timestamp->diffInDays($now) < 7) {
            return $timestamp->diffInDays($now) . ' day' . ($timestamp->diffInDays($now) > 1 ? 's' : '') . ' ago';
        } else {
            return $timestamp->format('M j, Y');
        }
    }

    /**
     * Get activity trends for the past 30 days
     */
    public function getActivityTrends(User $employer): array
    {
        $trends = [];
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        for ($i = 29; $i >= 0; $i--) {
            $date = $thirtyDaysAgo->copy()->addDays($i);

            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'jobs' => GigJob::where('employer_id', $employer->id)->whereDate('created_at', $date)->count(),
                'proposals' => Bid::whereHas('job', function($q) use ($employer) {
                    $q->where('employer_id', $employer->id);
                })->whereDate('created_at', $date)->count(),
                'contracts' => Project::where('employer_id', $employer->id)->whereDate('created_at', $date)->count(),
            ];
        }

        return $trends;
    }
}