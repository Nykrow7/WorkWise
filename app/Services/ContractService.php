<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\Project;
use App\Models\Bid;
use App\Models\User;
use App\Services\NotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ContractService
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Create contract from accepted bid
     */
    public function createContractFromBid(Project $project, Bid $bid): Contract
    {
        try {
            \Log::info('Starting contract creation from bid', [
                'project_id' => $project->id,
                'bid_id' => $bid->id
            ]);

            $job = $bid->job;
            $employer = $job->employer;
            $gigWorker = $bid->gigWorker;

            \Log::info('Contract parties identified', [
                'employer_id' => $employer->id,
                'employer_name' => $employer->first_name . ' ' . $employer->last_name,
                'gig_worker_id' => $gigWorker->id,
                'gig_worker_name' => $gigWorker->first_name . ' ' . $gigWorker->last_name,
                'job_id' => $job->id,
                'job_title' => $job->title
            ]);

            // Calculate project dates
            $startDate = now()->addDays(2); // Give 2 days for contract signing
            $endDate = $startDate->copy()->addDays($bid->estimated_days);

            // Default responsibilities
            $employerResponsibilities = [
                'Provide detailed requirements and feedback promptly.',
                'Supply all necessary content and materials for the project.',
                'Approve milestones and release payments as per the agreed schedule.',
                'Respond to communications within 48 hours during business days.',
                'Provide access to necessary tools, accounts, or resources as needed.'
            ];

            $gigWorkerResponsibilities = [
                'Complete the tasks as outlined in the scope of work.',
                'Communicate regularly with the employer regarding progress.',
                'Deliver work according to the agreed deadlines and quality standards.',
                'Make revisions based on employer feedback within reasonable limits.',
                'Maintain confidentiality of all project-related information.',
                'Use best practices and professional standards in all deliverables.'
            ];

            $contractData = [
                'contract_id' => Contract::generateContractId(),
                'project_id' => $project->id,
                'employer_id' => $employer->id,
                'gig_worker_id' => $gigWorker->id,
                'job_id' => $job->id,
                'bid_id' => $bid->id,
                'scope_of_work' => $this->generateScopeOfWork($job, $bid),
                'total_payment' => $bid->bid_amount,
                'contract_type' => 'Fixed-Price Contract',
                'project_start_date' => $startDate->toDateString(),
                'project_end_date' => $endDate->toDateString(),
                'employer_responsibilities' => $employerResponsibilities,
                'gig_worker_responsibilities' => $gigWorkerResponsibilities,
                'preferred_communication' => 'Email and WorkWise messaging',
                'communication_frequency' => 'Weekly updates',
                'status' => 'pending_employer_signature'
            ];

            \Log::info('Creating contract with data', [
                'contract_data' => $contractData
            ]);

            $contract = Contract::create($contractData);

            \Log::info('Contract created successfully', [
                'contract_id' => $contract->id,
                'contract_number' => $contract->contract_id
            ]);

            // Update project with contract reference
            $project->update([
                'contract_id' => $contract->id
            ]);

            \Log::info('Project updated with contract reference', [
                'project_id' => $project->id,
                'contract_id' => $contract->id
            ]);

            return $contract;

        } catch (\Exception $e) {
            \Log::error('Contract creation failed in service', [
                'project_id' => $project->id,
                'bid_id' => $bid->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Generate scope of work from job and bid
     */
    private function generateScopeOfWork($job, $bid): string
    {
        $gigWorkerName = $bid->gigWorker ? $bid->gigWorker->first_name . ' ' . $bid->gigWorker->last_name : 'the gig worker';
        $employerName = $job->employer ? $job->employer->first_name . ' ' . $job->employer->last_name : 'the employer';
        $jobTitle = $job->title ?? 'the project';
        $jobDescription = $job->description ?? 'No description provided';

        $scope = "The gig worker, {$gigWorkerName}, agrees to provide the following services for the employer, {$employerName}:\n\n";

        // Add job description as main scope
        $scope .= "Project: {$jobTitle}\n\n";
        $scope .= "Description: {$jobDescription}\n\n";
        
        // Add specific deliverables if available
        $skills = $job->required_skills;

        // Handle case where skills might be a string or need decoding
        if (is_string($skills)) {
            // Try to decode if it's a JSON string
            $decoded = json_decode($skills, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $skills = $decoded;
            } else {
                // If it's not valid JSON, treat as null
                $skills = null;
            }
        }

        if ($skills && is_array($skills) && count($skills) > 0) {
            $scope .= "Required Skills/Technologies:\n";
            foreach ($skills as $index => $skill) {
                $scope .= ($index + 1) . ". {$skill}\n";
            }
            $scope .= "\n";
        }

        // Add proposal details
        $scope .= "Additional Details from Proposal:\n";
        $scope .= $bid->proposal_message;

        return $scope;
    }

    /**
     * Update contract status after signature
     * Client must sign first, then gig worker
     */
    public function updateContractAfterSignature(Contract $contract, string $signerRole): void
    {
        $now = now();

        if ($signerRole === 'employer') {
            // Employer signs first
            $contract->update([
                'employer_signed_at' => $now,
                'status' => 'pending_gig_worker_signature'
            ]);
        } elseif ($signerRole === 'gig_worker') {
            // Gig worker signs after employer
            $contract->update([
                'gig_worker_signed_at' => $now,
                'status' => 'fully_signed',
                'fully_signed_at' => $now
            ]);

            // Update project status to active and mark contract as signed
            if ($contract->project) {
                $contract->project->update([
                    'status' => 'active',
                    'contract_signed' => true,
                    'contract_signed_at' => $now,
                    'started_at' => $now
                ]);
            }

            // Generate final PDF
            $this->generateContractPdf($contract);

            // Send notifications to both parties that contract is fully signed
            $jobTitle = $contract->job ? $contract->job->title : 'the project';

            // Only send notifications if users exist
            if ($contract->employer) {
                $this->notificationService->createContractFullySignedNotification($contract->employer, [
                    'job_title' => $jobTitle,
                    'contract_id' => $contract->id,
                    'project_id' => $contract->project_id
                ]);
                // Also notify that payment is now pending until completion
                $this->notificationService->createEscrowStatusNotification($contract->employer, [
                    'project_id' => $contract->project_id,
                    'project_title' => $jobTitle,
                    'status' => 'payment_pending'
                ]);
            }

            if ($contract->gigWorker) {
                $this->notificationService->createContractFullySignedNotification($contract->gigWorker, [
                    'job_title' => $jobTitle,
                    'contract_id' => $contract->id,
                    'project_id' => $contract->project_id
                ]);
                // Also notify that payment is now pending until completion
                $this->notificationService->createEscrowStatusNotification($contract->gigWorker, [
                    'project_id' => $contract->project_id,
                    'project_title' => $jobTitle,
                    'status' => 'payment_pending'
                ]);
            }
        }
    }

    /**
     * Generate contract PDF with enhanced error handling
     */
    public function generateContractPdf(Contract $contract): string
    {
        try {
            \Log::info('Starting PDF generation for contract', [
                'contract_id' => $contract->id,
                'contract_number' => $contract->contract_id
            ]);

            $contract->load([
                'employer',
                'gigWorker',
                'job',
                'project',
                'bid',
                'signatures'
            ]);

            // Validate required relationships
            if (!$contract->employer || !$contract->gigWorker || !$contract->job) {
                throw new \Exception('Contract is missing required relationships (employer, gigWorker, or job)');
            }

            // Ensure responsibilities are arrays
            $employerResponsibilities = $contract->employer_responsibilities ?? [];
            $gigWorkerResponsibilities = $contract->gig_worker_responsibilities ?? [];

            if (!is_array($employerResponsibilities)) {
                $employerResponsibilities = [];
            }
            if (!is_array($gigWorkerResponsibilities)) {
                $gigWorkerResponsibilities = [];
            }

            // Prepare data for PDF with safe defaults
            $data = [
                'contract' => $contract,
                'employer' => $contract->employer,
                'gigWorker' => $contract->gigWorker,
                'job' => $contract->job,
                'project' => $contract->project,
                'bid' => $contract->bid,
                'employerSignature' => $contract->getSignatureForRole('employer'),
                'gigWorkerSignature' => $contract->getSignatureForRole('gig_worker'),
                'isFullySigned' => $contract->isFullySigned(),
                'generatedAt' => now(),
                'employerResponsibilities' => $employerResponsibilities,
                'gigWorkerResponsibilities' => $gigWorkerResponsibilities
            ];

            \Log::info('PDF data prepared', [
                'contract_id' => $contract->id,
                'has_employer' => !is_null($contract->employer),
                'has_gig_worker' => !is_null($contract->gigWorker),
                'has_job' => !is_null($contract->job),
                'employer_responsibilities_count' => count($employerResponsibilities),
                'gig_worker_responsibilities_count' => count($gigWorkerResponsibilities)
            ]);

            // Generate PDF with enhanced options for better styling
            $pdf = Pdf::loadView('contracts.pdf', $data)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'defaultFont' => 'DejaVu Sans',
                    'isRemoteEnabled' => false, // Disable for security
                    'isHtml5ParserEnabled' => true,
                    'isPhpEnabled' => false, // Disable for security
                    'fontDir' => storage_path('app/fonts'), // Custom fonts directory
                    'fontCache' => storage_path('app/fonts/cache'),
                    'dpi' => 150, // Higher DPI for better quality
                    'defaultPaperSize' => 'a4',
                    'orientation' => 'portrait',
                    'debugKeepTemp' => false,
                    'debugPng' => false,
                    'debugCss' => false,
                    'debugLayout' => false,
                    'debugLayoutLines' => false,
                    'debugLayoutBlocks' => false,
                    'debugLayoutInline' => false,
                    'debugLayoutPaddingBox' => false,
                    // Additional options for better font rendering
                    'tempDir' => storage_path('app/temp'),
                    'chroot' => storage_path('app'),
                    'enable_css_float' => true,
                    'enable_html5_parser' => true
                ]);

            // Use public disk for contracts so they can be downloaded
            // Ensure contracts directory exists in public storage
            if (!Storage::disk('public')->exists('contracts')) {
                Storage::disk('public')->makeDirectory('contracts');
            }

            // Save PDF to public disk
            $filename = "contracts/contract_{$contract->contract_id}.pdf";
            $pdfOutput = $pdf->output();

            if (empty($pdfOutput)) {
                throw new \Exception('PDF generation produced empty output');
            }

            Storage::disk('public')->put($filename, $pdfOutput);

            // Verify file was saved
            if (!Storage::disk('public')->exists($filename)) {
                throw new \Exception('PDF file was not saved successfully');
            }

            // Update contract with PDF path
            $contract->update([
                'pdf_path' => $filename,
                'pdf_generated_at' => now()
            ]);

            \Log::info('PDF generated successfully', [
                'contract_id' => $contract->id,
                'filename' => $filename,
                'file_size' => Storage::disk('public')->size($filename)
            ]);

            return $filename;

        } catch (\Exception $e) {
            \Log::error('PDF generation failed', [
                'contract_id' => $contract->id,
                'contract_number' => $contract->contract_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw with more context
            throw new \Exception('Failed to generate contract PDF: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Send contract notification to user
     */
    public function sendContractNotification(Contract $contract, User $user, string $type): void
    {
        $message = '';
        $senderId = null;

        switch ($type) {
            case 'contract_ready':
                // Notify gig worker that contract is ready for signing
                $employerName = $contract->employer ? $contract->employer->first_name . ' ' . $contract->employer->last_name : 'the employer';
                $message = "🎉 Great news! {$employerName} has accepted your bid for \"{$contract->job->title}\"!\n\n" .
                          " Project Amount: ₱{$contract->total_payment}\n" .
                          "📋 Contract ID: {$contract->contract_id}\n\n" .
                          "Please review and sign the contract to begin work. You can access it from your Contracts dashboard.";
                $senderId = $contract->employer_id;
                break;

            case 'awaiting_employer_signature':
                // Notify employer that gig worker has signed
                $gigWorkerName = $contract->gigWorker ? $contract->gigWorker->first_name . ' ' . $contract->gigWorker->last_name : 'the gig worker';
                $message = "✅ {$gigWorkerName} has signed the contract for \"{$contract->job->title}\"!\n\n" .
                          "📋 Contract ID: {$contract->contract_id}\n" .
                          " Project Amount: ₱{$contract->total_payment}\n\n" .
                          "Please review and sign the contract to officially begin the project.";
                $senderId = $contract->gig_worker_id;
                break;

            case 'contract_fully_signed':
                // Notify both parties that contract is fully signed
                $jobTitle = $contract->job ? $contract->job->title : 'the project';
                $message = "🚀 The contract for \"{$jobTitle}\" is now fully signed!\n\n" .
                          "📋 Contract ID: {$contract->contract_id}\n" .
                          " Project Amount: ₱{$contract->total_payment}\n\n" .
                          "Work can now officially begin. Good luck with your project!";
                $senderId = $user->id === $contract->employer_id ? $contract->gig_worker_id : $contract->employer_id;
                break;
        }

        if ($message && $senderId) {
            try {
                // Create a system message
                \App\Models\Message::create([
                    'sender_id' => $senderId,
                    'receiver_id' => $user->id,
                    'project_id' => $contract->project_id,
                    'message' => $message,
                    'type' => 'system'
                ]);

                \Log::info('Contract notification sent', [
                    'type' => $type,
                    'contract_id' => $contract->id,
                    'user_id' => $user->id,
                    'sender_id' => $senderId
                ]);
            } catch (\Exception $e) {
                \Log::warning('Failed to send contract notification', [
                    'error' => $e->getMessage(),
                    'type' => $type,
                    'contract_id' => $contract->id,
                    'user_id' => $user->id
                ]);
                // Don't fail the whole process for notification failure
            }
        }
    }

    /**
     * Regenerate contract PDF with improved settings
     */
    public function regenerateContractPdf(Contract $contract): string
    {
        try {
            \Log::info('Regenerating PDF for contract', [
                'contract_id' => $contract->id,
                'contract_number' => $contract->contract_id
            ]);

            // Delete existing PDF if exists
            if ($contract->pdf_path && Storage::disk('public')->exists($contract->pdf_path)) {
                Storage::disk('public')->delete($contract->pdf_path);
                \Log::info('Deleted existing PDF', [
                    'contract_id' => $contract->id,
                    'old_path' => $contract->pdf_path
                ]);
            }

            // Generate new PDF with improved settings
            return $this->generateContractPdf($contract);

        } catch (\Exception $e) {
            \Log::error('PDF regeneration failed', [
                'contract_id' => $contract->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw new \Exception('Failed to regenerate contract PDF: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Get contract summary for dashboard
     */
    public function getContractSummary(User $user): array
    {
        $query = Contract::where(function ($q) use ($user) {
            $q->where('employer_id', $user->id)
              ->orWhere('gig_worker_id', $user->id);
        });

        return [
            'total' => $query->count(),
            'pending_signature' => $query->where('status', 'like', 'pending_%')->count(),
            'fully_signed' => $query->where('status', 'fully_signed')->count(),
            'cancelled' => $query->where('status', 'cancelled')->count(),
        ];
    }
}
