<?php

namespace App\Services;

use App\Models\ContractDeadline;
use App\Models\Project;
use App\Models\Notification;
use Carbon\Carbon;

class DeadlineTracker
{
    protected NotificationManager $notificationManager;

    public function __construct(NotificationManager $notificationManager)
    {
        $this->notificationManager = $notificationManager;
    }

    /**
     * Track contract deadlines for a project
     */
    public function trackContractDeadlines(Project $contract): void
    {
        // If contract doesn't have predefined milestones, create default ones
        if (ContractDeadline::where('contract_id', $contract->id)->count() === 0) {
            $this->createDefaultDeadlines($contract);
        }
    }

    /**
     * Check upcoming deadlines and send reminders
     */
    public function checkUpcomingDeadlines(): void
    {
        $this->notificationManager->checkAndCreateDeadlineAlerts();
    }

    /**
     * Send deadline reminders
     */
    public function sendDeadlineReminders(): void
    {
        // Get deadlines that need reminders (3 days before due date)
        $deadlinesNeedingReminders = ContractDeadline::where('due_date', '=', now()->addDays(3)->toDateString())
            ->where('status', 'pending')
            ->where('reminder_sent', false)
            ->with(['contract.employer', 'contract.gigWorker'])
            ->get();

        foreach ($deadlinesNeedingReminders as $deadline) {
            $this->sendReminder($deadline);
        }
    }

    /**
     * Mark deadline as completed
     */
    public function markDeadlineComplete(int $deadlineId): void
    {
        $deadline = ContractDeadline::findOrFail($deadlineId);
        $deadline->markCompleted();
    }

    /**
     * Create default deadlines for a contract
     */
    protected function createDefaultDeadlines(Project $contract): void
    {
        $startDate = Carbon::parse($contract->started_at ?? now());
        $estimatedDays = $contract->estimated_days ?? 30;

        // Create milestone deadlines
        $milestones = [
            [
                'milestone_name' => 'Initial Review',
                'days_offset' => max(3, intval($estimatedDays * 0.1))
            ],
            [
                'milestone_name' => 'Mid-point Review',
                'days_offset' => intval($estimatedDays * 0.5)
            ],
            [
                'milestone_name' => 'Final Review',
                'days_offset' => max(intval($estimatedDays * 0.9), $estimatedDays - 3)
            ],
            [
                'milestone_name' => 'Project Completion',
                'days_offset' => $estimatedDays
            ]
        ];

        foreach ($milestones as $milestone) {
            ContractDeadline::create([
                'contract_id' => $contract->id,
                'milestone_name' => $milestone['milestone_name'],
                'due_date' => $startDate->copy()->addDays($milestone['days_offset']),
                'status' => 'pending'
            ]);
        }
    }

    /**
     * Send reminder for a specific deadline
     */
    protected function sendReminder(ContractDeadline $deadline): void
    {
        $contract = $deadline->contract;

        // Send notification to employer
        if ($contract->employer) {
            $this->notificationManager->createDeadlineAlert($contract->employer, [
                'project_id' => $contract->id,
                'milestone_name' => $deadline->milestone_name,
                'due_date' => $deadline->due_date->format('M j, Y'),
                'alert_type' => 'reminder'
            ]);
        }

        // Send notification to gig worker
        if ($contract->gigWorker) {
            $this->notificationManager->createDeadlineAlert($contract->gigWorker, [
                'project_id' => $contract->id,
                'milestone_name' => $deadline->milestone_name,
                'due_date' => $deadline->due_date->format('M j, Y'),
                'alert_type' => 'reminder'
            ]);
        }

        // Mark reminder as sent
        $deadline->markReminderSent();
    }

    /**
     * Get overdue deadlines count
     */
    public function getOverdueDeadlinesCount(): int
    {
        return ContractDeadline::overdue()->count();
    }

    /**
     * Get upcoming deadlines count
     */
    public function getUpcomingDeadlinesCount(int $days = 7): int
    {
        return ContractDeadline::upcoming($days)->count();
    }

    /**
     * Clean up old completed deadlines (older than 90 days)
     */
    public function cleanupOldDeadlines(): int
    {
        return ContractDeadline::where('status', 'completed')
            ->where('created_at', '<', now()->subDays(90))
            ->delete();
    }
}