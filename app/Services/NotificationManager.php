<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\ContractDeadline;
use App\Models\Project;
use Illuminate\Support\Collection;

class NotificationManager
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Create escrow alert notification
     */
    public function createEscrowAlert(User $user, array $escrowData): Notification
    {
        $title = '💰 Escrow Alert';
        $message = "Escrow balance for project '{$escrowData['project_title']}' requires attention.";

        if ($escrowData['alert_type'] === 'low_balance') {
            $title = '⚠️ Low Escrow Balance';
            $message = "Escrow balance for '{$escrowData['project_title']}' is running low. Current balance: ₱{$escrowData['current_balance']}";
        } elseif ($escrowData['alert_type'] === 'payment_released') {
            $title = '✅ Payment Released';
            $message = "Payment of ₱{$escrowData['amount']} has been released for '{$escrowData['project_title']}'";
        }

        return $this->notificationService->create([
            'user_id' => $user->id,
            'type' => 'escrow_status',
            'title' => $title,
            'message' => $message,
            'data' => $escrowData,
            'action_url' => route('projects.show', $escrowData['project_id']),
            'icon' => 'currency-dollar'
        ]);
    }

    /**
     * Create deadline alert notification
     */
    public function createDeadlineAlert(User $user, array $deadlineData): Notification
    {
        $title = '⏰ Deadline Approaching';
        $message = "Deadline for '{$deadlineData['milestone_name']}' is approaching on {$deadlineData['due_date']}";

        if ($deadlineData['alert_type'] === 'overdue') {
            $title = '🚨 Deadline Overdue';
            $message = "Deadline for '{$deadlineData['milestone_name']}' was due on {$deadlineData['due_date']} and is now overdue";
        }

        return $this->notificationService->create([
            'user_id' => $user->id,
            'type' => 'deadline_approaching',
            'title' => $title,
            'message' => $message,
            'data' => $deadlineData,
            'action_url' => route('projects.show', $deadlineData['project_id']),
            'icon' => 'clock'
        ]);
    }

    /**
     * Create message notification
     */
    public function createMessageAlert(User $user, array $messageData): Notification
    {
        return $this->notificationService->create([
            'user_id' => $user->id,
            'type' => 'message_received',
            'title' => '💬 New Message',
            'message' => "New message from {$messageData['sender_name']}: {$messageData['message_preview']}",
            'data' => $messageData,
            'action_url' => null, // Don't set action_url to prevent redirect, use MiniChat instead
            'icon' => 'chat-bubble-left'
        ]);
    }

    /**
     * Check and create deadline alerts for all users
     */
    public function checkAndCreateDeadlineAlerts(): void
    {
        // Get all upcoming deadlines (within 3 days)
        $upcomingDeadlines = ContractDeadline::upcoming(3)
            ->with(['contract.employer', 'contract.gigWorker'])
            ->get();

        foreach ($upcomingDeadlines as $deadline) {
            $this->createDeadlineAlertForUsers($deadline);
        }

        // Check for overdue deadlines
        $overdueDeadlines = ContractDeadline::overdue()
            ->with(['contract.employer', 'contract.gigWorker'])
            ->get();

        foreach ($overdueDeadlines as $deadline) {
            $this->createOverdueDeadlineAlert($deadline);
        }
    }

    /**
     * Check and create escrow alerts
     */
    public function checkAndCreateEscrowAlerts(): void
    {
        // Get projects with low escrow balance (less than 20% of agreed amount)
        $projects = Project::where('contract_signed', true)
            ->where('status', 'in_progress')
            ->with('employer')
            ->get();

        foreach ($projects as $project) {
            $escrowBalance = $project->employer->escrow_balance ?? 0;
            $agreedAmount = $project->agreed_amount ?? 0;

            if ($escrowBalance > 0 && $escrowBalance < ($agreedAmount * 0.2)) {
                $this->createEscrowAlert($project->employer, [
                    'project_id' => $project->id,
                    'project_title' => $project->job->title ?? 'Unknown Project',
                    'alert_type' => 'low_balance',
                    'current_balance' => $escrowBalance,
                    'agreed_amount' => $agreedAmount
                ]);
            }
        }
    }

    /**
     * Get relevant notifications for employer dashboard
     */
    public function getRelevantNotifications(User $user): Collection
    {
        return Notification::where('user_id', $user->id)
            ->whereIn('type', ['escrow_status', 'deadline_approaching', 'message_received'])
            ->latest()
            ->limit(10)
            ->get();
    }

    /**
     * Get upcoming deadlines for user
     */
    public function getUpcomingDeadlines(User $user): Collection
    {
        return ContractDeadline::whereHas('contract', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })
            ->upcoming(7)
            ->with('contract:id,title')
            ->orderBy('due_date')
            ->limit(5)
            ->get();
    }

    /**
     * Get escrow alerts for user
     */
    public function getEscrowAlerts(User $user): Collection
    {
        return Notification::where('user_id', $user->id)
            ->where('type', 'escrow_status')
            ->where('is_read', false)
            ->latest()
            ->limit(3)
            ->get();
    }

    /**
     * Get message notifications for user
     */
    public function getMessageNotifications(User $user): Collection
    {
        return Notification::where('user_id', $user->id)
            ->where('type', 'message_received')
            ->where('is_read', false)
            ->latest()
            ->limit(5)
            ->get();
    }

    /**
     * Create deadline alert for all relevant users
     */
    protected function createDeadlineAlertForUsers(ContractDeadline $deadline): void
    {
        $contract = $deadline->contract;

        // Notify employer
        if ($contract->employer) {
            $this->createDeadlineAlert($contract->employer, [
                'project_id' => $contract->id,
                'milestone_name' => $deadline->milestone_name,
                'due_date' => $deadline->due_date->format('M j, Y'),
                'alert_type' => 'approaching'
            ]);
        }

        // Notify gig worker
        if ($contract->gigWorker) {
            $this->createDeadlineAlert($contract->gigWorker, [
                'project_id' => $contract->id,
                'milestone_name' => $deadline->milestone_name,
                'due_date' => $deadline->due_date->format('M j, Y'),
                'alert_type' => 'approaching'
            ]);
        }

        // Mark reminder as sent
        $deadline->markReminderSent();
    }

    /**
     * Create overdue deadline alert
     */
    protected function createOverdueDeadlineAlert(ContractDeadline $deadline): void
    {
        $contract = $deadline->contract;

        // Only create alert if not already marked as overdue
        if ($deadline->status !== 'overdue') {
            $deadline->markOverdue();

            // Notify employer
            if ($contract->employer) {
                $this->createDeadlineAlert($contract->employer, [
                    'project_id' => $contract->id,
                    'milestone_name' => $deadline->milestone_name,
                    'due_date' => $deadline->due_date->format('M j, Y'),
                    'alert_type' => 'overdue'
                ]);
            }

            // Notify gig worker
            if ($contract->gigWorker) {
                $this->createDeadlineAlert($contract->gigWorker, [
                    'project_id' => $contract->id,
                    'milestone_name' => $deadline->milestone_name,
                    'due_date' => $deadline->due_date->format('M j, Y'),
                    'alert_type' => 'overdue'
                ]);
            }
        }
    }
}