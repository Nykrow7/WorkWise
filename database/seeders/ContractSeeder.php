<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\GigJob;
use App\Models\Bid;
use App\Models\Project;
use App\Models\Contract;
use App\Models\ContractSignature;
use App\Services\ContractService;

class ContractSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get existing users
        $employer = User::where('user_type', 'employer')->first();
        $gigWorker = User::where('user_type', 'gig_worker')->first();

        if (!$employer || !$gigWorker) {
            $this->command->info('No employer or gig worker found. Please run UserSeeder first.');
            return;
        }

        // Get or create a job
        $job = GigJob::where('employer_id', $employer->id)->first();
        if (!$job) {
            $job = GigJob::create([
                'employer_id' => $employer->id,
                'title' => 'Sample Web Development Project',
                'description' => 'Build a modern e-commerce website with React and Laravel backend. The project includes user authentication, product catalog, shopping cart, and payment integration.',
                'budget_min' => 15000,
                'budget_max' => 25000,
                'project_duration' => '2-4 weeks',
                'required_skills' => ['React', 'Laravel', 'PHP', 'JavaScript', 'MySQL'],
                'experience_level' => 'intermediate',
                'project_type' => 'fixed',
                'location' => 'Remote',
                'status' => 'closed'
            ]);
        }

        // Get or create a bid
        $bid = Bid::where('job_id', $job->id)->where('gig_worker_id', $gigWorker->id)->first();
        if (!$bid) {
            $bid = Bid::create([
                'job_id' => $job->id,
                'gig_worker_id' => $gigWorker->id,
                'bid_amount' => 20000,
                'estimated_days' => 21,
                'proposal_message' => 'I am excited to work on your e-commerce project. With 5+ years of experience in React and Laravel, I can deliver a high-quality, scalable solution. My approach includes: 1) Setting up the Laravel backend with API endpoints, 2) Building the React frontend with modern UI/UX, 3) Implementing secure payment integration, 4) Thorough testing and deployment.',
                'status' => 'accepted',
                'accepted_at' => now()
            ]);
        }

        // Create project if not exists
        $project = Project::where('bid_id', $bid->id)->first();
        if (!$project) {
            $platformFee = $bid->bid_amount * 0.05; // 5% platform fee
            $netAmount = $bid->bid_amount - $platformFee;

            $project = Project::create([
                'job_id' => $job->id,
                'employer_id' => $employer->id,
                'gig_worker_id' => $gigWorker->id,
                'bid_id' => $bid->id,
                'agreed_amount' => $bid->bid_amount,
                'platform_fee' => $platformFee,
                'net_amount' => $netAmount,
                'status' => 'pending_contract'
            ]);
        }

        // Create contract using the service
        $contractService = new ContractService();
        
        // Create a contract that's ready for gig worker signature
        $contract1 = Contract::create([
            'contract_id' => Contract::generateContractId(),
            'project_id' => $project->id,
            'employer_id' => $employer->id,
            'gig_worker_id' => $gigWorker->id,
            'job_id' => $job->id,
            'bid_id' => $bid->id,
            'scope_of_work' => $contractService->generateScopeOfWork($job, $bid),
            'total_payment' => $bid->bid_amount,
            'contract_type' => 'Fixed-Price Contract',
            'project_start_date' => now()->addDays(2)->toDateString(),
            'project_end_date' => now()->addDays(23)->toDateString(),
            'employer_responsibilities' => [
                'Provide detailed requirements and feedback promptly.',
                'Supply all necessary content and materials for the project.',
                'Approve milestones and release payments as per the agreed schedule.'
            ],
            'gig_worker_responsibilities' => [
                'Complete the tasks as outlined in the scope of work.',
                'Communicate regularly with the employer regarding progress.',
                'Deliver work according to the agreed deadlines and quality standards.',
                'Make revisions based on employer feedback within reasonable limits.'
            ],
            'preferred_communication' => 'Email and WorkWise messaging',
            'communication_frequency' => 'Weekly updates',
            'status' => 'pending_employer_signature'
        ]);

        // Update project with contract reference
        $project->update([
            'contract_id' => $contract1->id
        ]);

        // Create another contract that's fully signed for demonstration
        $job2 = GigJob::create([
            'employer_id' => $employer->id,
            'title' => 'Mobile App UI/UX Design',
            'description' => 'Design a modern mobile app interface for a fitness tracking application. Includes wireframes, mockups, and interactive prototypes.',
            'budget_min' => 8000,
            'budget_max' => 12000,
            'project_duration' => '1-2 weeks',
            'required_skills' => ['UI/UX Design', 'Figma', 'Adobe XD', 'Mobile Design'],
            'experience_level' => 'intermediate',
            'project_type' => 'fixed',
            'location' => 'Remote',
            'status' => 'closed'
        ]);

        $bid2 = Bid::create([
            'job_id' => $job2->id,
            'gig_worker_id' => $gigWorker->id,
            'bid_amount' => 10000,
            'estimated_days' => 10,
            'proposal_message' => 'I specialize in mobile app UI/UX design with a focus on user-centered design principles. I will create intuitive, modern interfaces that enhance user experience.',
            'status' => 'accepted',
            'accepted_at' => now()->subDays(2)
        ]);

        $platformFee2 = $bid2->bid_amount * 0.05;
        $netAmount2 = $bid2->bid_amount - $platformFee2;

        $project2 = Project::create([
            'job_id' => $job2->id,
            'employer_id' => $employer->id,
            'gig_worker_id' => $gigWorker->id,
            'bid_id' => $bid2->id,
            'agreed_amount' => $bid2->bid_amount,
            'platform_fee' => $platformFee2,
            'net_amount' => $netAmount2,
            'status' => 'active',
            'contract_signed' => true,
            'contract_signed_at' => now()->subDays(1),
            'started_at' => now()->subDays(1)
        ]);

        $contract2 = Contract::create([
            'contract_id' => Contract::generateContractId(),
            'project_id' => $project2->id,
            'employer_id' => $employer->id,
            'gig_worker_id' => $gigWorker->id,
            'job_id' => $job2->id,
            'bid_id' => $bid2->id,
            'scope_of_work' => "Design a modern mobile app interface for a fitness tracking application.\n\nDeliverables:\n1. User research and persona development\n2. Wireframes for key screens\n3. High-fidelity mockups\n4. Interactive prototypes\n5. Design system and style guide",
            'total_payment' => $bid2->bid_amount,
            'contract_type' => 'Fixed-Price Contract',
            'project_start_date' => now()->subDays(1)->toDateString(),
            'project_end_date' => now()->addDays(9)->toDateString(),
            'employer_responsibilities' => [
                'Provide detailed requirements and feedback promptly.',
                'Supply all necessary content and materials for the project.',
                'Approve milestones and release payments as per the agreed schedule.'
            ],
            'gig_worker_responsibilities' => [
                'Complete the tasks as outlined in the scope of work.',
                'Communicate regularly with the employer regarding progress.',
                'Deliver work according to the agreed deadlines and quality standards.',
                'Make revisions based on employer feedback within reasonable limits.'
            ],
            'preferred_communication' => 'Email and WorkWise messaging',
            'communication_frequency' => 'Daily updates',
            'status' => 'fully_signed',
            'gig_worker_signed_at' => now()->subDays(1),
            'employer_signed_at' => now()->subDays(1),
            'fully_signed_at' => now()->subDays(1)
        ]);

        // Create signatures for the fully signed contract
        ContractSignature::create([
            'contract_id' => $contract2->id,
            'user_id' => $gigWorker->id,
            'full_name' => $gigWorker->first_name . ' ' . $gigWorker->last_name,
            'role' => 'gig_worker',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'signed_at' => now()->subDays(1),
            'contract_version_hash' => hash('sha256', serialize($contract2->toArray())),
            'device_type' => 'desktop'
        ]);

        ContractSignature::create([
            'contract_id' => $contract2->id,
            'user_id' => $employer->id,
            'full_name' => $employer->first_name . ' ' . $employer->last_name,
            'role' => 'employer',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'signed_at' => now()->subDays(1),
            'contract_version_hash' => hash('sha256', serialize($contract2->toArray())),
            'device_type' => 'desktop'
        ]);

        // Update project with contract reference
        $project2->update([
            'contract_id' => $contract2->id
        ]);

        $this->command->info('Contract test data created successfully!');
        $this->command->info("Contract 1 (Pending Gig Worker Signature): {$contract1->contract_id}");
        $this->command->info("Contract 2 (Fully Signed): {$contract2->contract_id}");
    }

    /**
     * Generate scope of work from job and bid
     */
    private function generateScopeOfWork($job, $bid): string
    {
        $scope = "The gig worker, {$bid->gigWorker->first_name} {$bid->gigWorker->last_name}, agrees to provide the following services for the employer, {$job->employer->first_name} {$job->employer->last_name}:\n\n";
        
        // Add job description as main scope
        $scope .= "Project: {$job->title}\n\n";
        $scope .= "Description: {$job->description}\n\n";
        
        // Add specific deliverables if available
        if ($job->required_skills && count($job->required_skills) > 0) {
            $scope .= "Required Skills/Technologies:\n";
            foreach ($job->required_skills as $index => $skill) {
                $scope .= ($index + 1) . ". {$skill}\n";
            }
            $scope .= "\n";
        }

        // Add proposal details
        $scope .= "Additional Details from Proposal:\n";
        $scope .= $bid->proposal_message;

        return $scope;
    }
}
