<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Models\EscrowAccount;
use App\Models\EscrowMilestone;
use App\Models\EscrowTransaction;
use App\Models\FraudDetectionLog;
use App\Models\DisputeCase;
use App\Models\InsuranceClaim;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SmartEscrowService
{
    private const RISK_THRESHOLDS = [
        'low' => 0.3,
        'medium' => 0.5,
        'high' => 0.7,
        'critical' => 0.9
    ];

    /**
     * Create protected escrow account
     */
    public function createProtectedEscrow(Project $project, array $milestones = []): array
    {
        DB::beginTransaction();
        
        try {
            // Assess project risk
            $riskAssessment = $this->assessProjectRisk($project);
            
            // Determine escrow terms based on risk
            $escrowTerms = $this->determineEscrowTerms($riskAssessment);
            
            // Create escrow account
            $escrowAccount = EscrowAccount::create([
                'project_id' => $project->id,
                'client_id' => $project->client_id,
                'gig_worker_id' => $project->gig_worker_id,
                'total_amount' => $project->agreed_amount,
                'platform_fee' => $this->calculatePlatformFee($project->agreed_amount),
                'available_amount' => $project->agreed_amount,
                'status' => 'pending',
                'protection_level' => $escrowTerms['protection_level'],
                'escrow_terms' => $escrowTerms,
                'risk_score' => $riskAssessment['risk_level'],
                'milestone_based' => $escrowTerms['milestone_based'],
                'automatic_release' => $escrowTerms['automatic_release'],
                'fraud_insurance' => $escrowTerms['fraud_insurance'],
                'multi_signature' => $escrowTerms['multi_signature'],
                'expires_at' => now()->addDays($escrowTerms['expiry_days'])
            ]);

            // Create milestones if provided
            if (!empty($milestones)) {
                $this->createMilestones($escrowAccount, $milestones);
            } else {
                $this->createDefaultMilestones($escrowAccount, $project);
            }

            DB::commit();

            return [
                'success' => true,
                'escrow_account' => $escrowAccount,
                'risk_assessment' => $riskAssessment,
                'protection_features' => $this->getProtectionFeatures($escrowTerms)
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Escrow creation failed', [
                'project_id' => $project->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Assess project risk level
     */
    public function assessProjectRisk(Project $project): array
    {
        $factors = [
            'client_history' => $this->analyzeClientHistory($project->client),
            'gig_worker_history' => $this->analyzeGigWorkerHistory($project->gigWorker),
            'project_complexity' => $this->analyzeProjectComplexity($project),
            'communication_quality' => $this->analyzeCommunicationQuality($project),
            'timeline_realism' => $this->analyzeTimelineRealism($project),
            'amount_risk' => $this->analyzeAmountRisk($project->agreed_amount),
            'skill_match' => $this->analyzeSkillMatch($project)
        ];

        $riskLevel = $this->calculateRiskLevel($factors);

        return [
            'risk_level' => $riskLevel,
            'risk_factors' => $factors,
            'protection_level' => $this->recommendProtectionLevel($riskLevel),
            'risk_description' => $this->getRiskDescription($riskLevel, $factors)
        ];
    }

    /**
     * Monitor escrow safety in real-time
     */
    public function monitorEscrowSafety(EscrowAccount $escrowAccount): void
    {
        $suspiciousPatterns = [
            'rapid_milestone_completion' => $this->checkRapidCompletion($escrowAccount),
            'unusual_communication' => $this->checkCommunicationPatterns($escrowAccount),
            'external_pressure' => $this->detectExternalPressure($escrowAccount),
            'account_compromise' => $this->checkAccountSecurity($escrowAccount),
            'delivery_anomalies' => $this->checkDeliveryAnomalies($escrowAccount),
            'payment_manipulation' => $this->detectPaymentManipulation($escrowAccount)
        ];

        $totalRiskScore = collect($suspiciousPatterns)->sum();
        
        // Log detection results
        foreach ($suspiciousPatterns as $pattern => $riskScore) {
            if ($riskScore > 0.3) {
                FraudDetectionLog::create([
                    'escrow_account_id' => $escrowAccount->id,
                    'user_id' => $this->getRelevantUserId($escrowAccount, $pattern),
                    'detection_type' => $pattern,
                    'risk_score' => $riskScore,
                    'detection_data' => $this->getDetectionData($escrowAccount, $pattern),
                    'action_taken' => $this->determineAction($riskScore)
                ]);
            }
        }

        // Take action if risk is too high
        if ($totalRiskScore > self::RISK_THRESHOLDS['high']) {
            $this->triggerSecurityMeasures($escrowAccount, $suspiciousPatterns);
        }
    }

    /**
     * Process milestone completion
     */
    public function processMilestoneCompletion(EscrowMilestone $milestone, array $deliverables): array
    {
        // Verify deliverables
        $verification = $this->verifyDeliverables($milestone, $deliverables);
        
        if (!$verification['is_valid']) {
            return [
                'success' => false,
                'message' => 'Deliverables verification failed',
                'issues' => $verification['issues']
            ];
        }

        // Update milestone
        $milestone->update([
            'status' => 'completed',
            'deliverables' => $deliverables,
            'completed_at' => now()
        ]);

        // Check for fraud patterns
        $this->monitorEscrowSafety($milestone->escrowAccount);

        // Auto-approve if conditions are met
        if ($this->shouldAutoApprove($milestone)) {
            return $this->approveMilestone($milestone);
        }

        return [
            'success' => true,
            'message' => 'Milestone completed, awaiting client approval',
            'milestone' => $milestone
        ];
    }

    /**
     * Approve milestone and release payment
     */
    public function approveMilestone(EscrowMilestone $milestone): array
    {
        DB::beginTransaction();

        try {
            // Update milestone status
            $milestone->update([
                'status' => 'completed',
                'approved_at' => now()
            ]);

            // Create release transaction
            $transaction = EscrowTransaction::create([
                'escrow_account_id' => $milestone->escrow_account_id,
                'milestone_id' => $milestone->id,
                'transaction_type' => 'release',
                'amount' => $milestone->amount,
                'status' => 'processing',
                'description' => "Payment release for milestone: {$milestone->title}",
                'transaction_metadata' => [
                    'milestone_id' => $milestone->id,
                    'approved_at' => now()->toISOString()
                ]
            ]);

            // Process payment through Stripe
            $paymentResult = $this->processStripeTransfer($transaction);

            if ($paymentResult['success']) {
                $transaction->update([
                    'status' => 'completed',
                    'stripe_transfer_id' => $paymentResult['transfer_id'],
                    'processed_at' => now()
                ]);

                $milestone->update(['released_at' => now()]);

                // Update escrow account available amount
                $milestone->escrowAccount->decrement('available_amount', $milestone->amount);

                DB::commit();

                return [
                    'success' => true,
                    'message' => 'Payment released successfully',
                    'transaction' => $transaction
                ];
            } else {
                throw new \Exception('Payment processing failed: ' . $paymentResult['error']);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Milestone approval failed', [
                'milestone_id' => $milestone->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Freeze escrow account for investigation
     */
    public function freezeEscrowAccount(EscrowAccount $escrowAccount, string $reason): void
    {
        $escrowAccount->update([
            'status' => 'disputed',
            'escrow_terms' => array_merge($escrowAccount->escrow_terms, [
                'frozen_at' => now()->toISOString(),
                'freeze_reason' => $reason,
                'frozen_by' => 'system'
            ])
        ]);

        // Notify relevant parties
        $this->notifyAccountFreeze($escrowAccount, $reason);

        Log::warning('Escrow account frozen', [
            'escrow_id' => $escrowAccount->id,
            'reason' => $reason
        ]);
    }

    /**
     * Create dispute case
     */
    public function createDispute(EscrowAccount $escrowAccount, User $initiator, array $disputeData): DisputeCase
    {
        $dispute = DisputeCase::create([
            'escrow_account_id' => $escrowAccount->id,
            'milestone_id' => $disputeData['milestone_id'] ?? null,
            'initiated_by' => $initiator->id,
            'dispute_type' => $disputeData['type'],
            'description' => $disputeData['description'],
            'evidence' => $disputeData['evidence'] ?? [],
            'status' => 'open'
        ]);

        // Freeze escrow if high-value dispute
        if ($escrowAccount->total_amount > 50000) { // ₱50,000
            $this->freezeEscrowAccount($escrowAccount, 'High-value dispute initiated');
        }

        return $dispute;
    }

    /**
     * Process insurance claim
     */
    public function processInsuranceClaim(EscrowAccount $escrowAccount, User $claimant, array $claimData): InsuranceClaim
    {
        if (!$escrowAccount->fraud_insurance) {
            throw new \Exception('This escrow account does not have fraud insurance coverage');
        }

        return InsuranceClaim::create([
            'escrow_account_id' => $escrowAccount->id,
            'claimant_id' => $claimant->id,
            'claim_type' => $claimData['type'],
            'claim_amount' => min($claimData['amount'], $escrowAccount->total_amount),
            'description' => $claimData['description'],
            'evidence' => $claimData['evidence'],
            'status' => 'submitted'
        ]);
    }

    /**
     * Determine escrow terms based on risk assessment
     */
    private function determineEscrowTerms(array $riskAssessment): array
    {
        $riskLevel = $riskAssessment['risk_level'];

        return [
            'protection_level' => $riskAssessment['protection_level'],
            'milestone_based' => true,
            'automatic_release' => $riskLevel < self::RISK_THRESHOLDS['medium'],
            'fraud_insurance' => $riskLevel > self::RISK_THRESHOLDS['medium'],
            'multi_signature' => $riskLevel > self::RISK_THRESHOLDS['high'],
            'expiry_days' => $riskLevel > self::RISK_THRESHOLDS['high'] ? 90 : 60,
            'approval_timeout_hours' => $riskLevel > self::RISK_THRESHOLDS['medium'] ? 72 : 48,
            'dispute_resolution' => true,
            'insurance_coverage_percent' => $riskLevel > self::RISK_THRESHOLDS['high'] ? 100 : 80
        ];
    }

    /**
     * Analyze client history for risk assessment
     */
    private function analyzeClientHistory(User $client): float
    {
        $completedProjects = $client->clientProjects()->where('status', 'completed')->count();
        $disputedProjects = $client->clientProjects()->where('status', 'disputed')->count();
        $avgRating = $client->givenReviews()->avg('rating') ?? 3.0;
        $accountAge = $client->created_at->diffInDays(now());

        $riskScore = 0.5; // Base risk

        // Account age factor
        if ($accountAge < 30) {
            $riskScore += 0.3; // New accounts are riskier
        } elseif ($accountAge > 365) {
            $riskScore -= 0.2; // Established accounts are safer
        }

        // Project history factor
        if ($completedProjects > 10) {
            $riskScore -= 0.2;
        } elseif ($completedProjects === 0) {
            $riskScore += 0.3;
        }

        // Dispute history factor
        if ($disputedProjects > 0) {
            $riskScore += ($disputedProjects / max($completedProjects, 1)) * 0.4;
        }

        // Rating factor
        if ($avgRating >= 4.5) {
            $riskScore -= 0.2;
        } elseif ($avgRating < 3.0) {
            $riskScore += 0.3;
        }

        return min(1.0, max(0.0, $riskScore));
    }

    /**
     * Analyze gig worker history for risk assessment
     */
    private function analyzeGigWorkerHistory(User $gigWorker): float
    {
        $completedProjects = $gigWorker->gigWorkerProjects()->where('status', 'completed')->count();
        $avgRating = $gigWorker->receivedReviews()->avg('rating') ?? 3.0;
        $verificationLevel = $gigWorker->verification_level ?? 'none';

        $riskScore = 0.4; // Base risk

        // Verification level factor
        $verificationRisk = match($verificationLevel) {
            'premium' => -0.3,
            'enhanced' => -0.2,
            'basic' => -0.1,
            default => 0.2
        };
        $riskScore += $verificationRisk;

        // Experience factor
        if ($completedProjects > 20) {
            $riskScore -= 0.2;
        } elseif ($completedProjects < 3) {
            $riskScore += 0.2;
        }

        // Rating factor
        if ($avgRating >= 4.5) {
            $riskScore -= 0.2;
        } elseif ($avgRating < 3.5) {
            $riskScore += 0.2;
        }

        return min(1.0, max(0.0, $riskScore));
    }

    /**
     * Check for rapid milestone completion (potential fraud indicator)
     */
    private function checkRapidCompletion(EscrowAccount $escrowAccount): float
    {
        $milestones = $escrowAccount->milestones()
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subHours(24))
            ->get();

        if ($milestones->count() > 3) {
            return 0.8; // High risk for completing multiple milestones in 24 hours
        } elseif ($milestones->count() > 1) {
            return 0.5; // Medium risk
        }

        return 0.1;
    }

    /**
     * Check communication patterns for anomalies
     */
    private function checkCommunicationPatterns(EscrowAccount $escrowAccount): float
    {
        // This would analyze message patterns, frequency, etc.
        // For now, return a base risk score
        return 0.2;
    }

    /**
     * Detect external pressure indicators
     */
    private function detectExternalPressure(EscrowAccount $escrowAccount): float
    {
        // This would analyze for signs of external pressure to release payments
        // Such as urgent messages, threats, etc.
        return 0.1;
    }

    /**
     * Check account security indicators
     */
    private function checkAccountSecurity(EscrowAccount $escrowAccount): float
    {
        // Check for signs of account compromise
        // Such as unusual login patterns, device changes, etc.
        return 0.1;
    }

    /**
     * Calculate platform fee
     */
    private function calculatePlatformFee(float $amount): float
    {
        return $amount * 0.05; // 5% platform fee
    }

    /**
     * Calculate overall risk level
     */
    private function calculateRiskLevel(array $factors): float
    {
        $weights = [
            'client_history' => 0.25,
            'gig_worker_history' => 0.25,
            'project_complexity' => 0.15,
            'communication_quality' => 0.10,
            'timeline_realism' => 0.10,
            'amount_risk' => 0.10,
            'skill_match' => 0.05
        ];

        $totalRisk = 0;
        foreach ($factors as $factor => $risk) {
            $totalRisk += $risk * ($weights[$factor] ?? 0);
        }

        return min(1.0, max(0.0, $totalRisk));
    }

    /**
     * Recommend protection level based on risk
     */
    private function recommendProtectionLevel(float $riskLevel): string
    {
        if ($riskLevel >= self::RISK_THRESHOLDS['high']) {
            return 'premium';
        } elseif ($riskLevel >= self::RISK_THRESHOLDS['medium']) {
            return 'enhanced';
        }

        return 'basic';
    }

    /**
     * Process Stripe transfer (simplified implementation)
     */
    private function processStripeTransfer(EscrowTransaction $transaction): array
    {
        try {
            // This would integrate with actual Stripe API
            // For now, simulate successful transfer
            return [
                'success' => true,
                'transfer_id' => 'tr_' . uniqid(),
                'amount' => $transaction->amount
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    // Additional helper methods would be implemented here...
    // Including: analyzeProjectComplexity, createMilestones, verifyDeliverables, etc.
}
