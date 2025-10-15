<?php

namespace Database\Seeders;

use App\Models\GigJob;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AIMatchTestSeeder extends Seeder
{
    /**
     * Run the database seeds for AI matching testing.
     */
    public function run(): void
    {
        $this->command->info('🤖 Creating AI Match Test Data...');

        // Create a test employer specifically for AI matching
        $testEmployer = User::create([
            'first_name' => 'AI',
            'last_name' => 'TestEmployer',
            'email' => 'ai.testemployer@example.com',
            'password' => Hash::make('password'),
            'barangay' => 'Lahug',
            'user_type' => 'employer',
            'profile_completed' => true,
            'profile_status' => 'approved',
            'company_name' => 'AI Match Testing Inc',
            'work_type_needed' => 'Web & Mobile Development',
            'budget_range' => '$5,000 - $50,000',
            'project_intent' => 'Testing AI matching algorithms with various job requirements.',
            'bio' => 'Test employer account for AI matching functionality testing.',
            'location' => 'Cebu City, Philippines',
            'escrow_balance' => 50000.00,
        ]);

        $this->command->info('👤 Created test employer: ai.testemployer@example.com / password');

        // Create diverse jobs for AI matching testing
        $this->command->info('📝 Creating test jobs for AI matching...');

        // 1. Perfect React/Laravel match (Expert level)
        $job1 = GigJob::create([
            'employer_id' => $testEmployer->id,
            'title' => 'Senior React & Laravel Full Stack Developer',
            'description' => 'Looking for an expert full-stack developer to build a complex web application using React and Laravel. Must have extensive experience with modern JavaScript frameworks, PHP, and database design. This is a long-term project requiring high-quality, scalable code.',
            'required_skills' => ['React', 'Laravel', 'JavaScript', 'PHP', 'MySQL', 'REST API', 'Git', 'Docker'],
            'budget_type' => 'fixed',
            'budget_min' => 8000,
            'budget_max' => 12000,
            'experience_level' => 'expert',
            'estimated_duration_days' => 60,
            'deadline' => now()->addDays(90),
            'status' => 'open',
            'location' => 'Cebu City, Philippines',
            'is_remote' => true,
        ]);

        // 2. Mobile React Native job (Expert level)
        $job2 = GigJob::create([
            'employer_id' => $testEmployer->id,
            'title' => 'React Native Mobile App Developer',
            'description' => 'Need an experienced React Native developer to build a cross-platform mobile application for iOS and Android. Must be familiar with mobile UI/UX patterns, state management, and app store deployment. Experience with Firebase and payment integration preferred.',
            'required_skills' => ['React Native', 'JavaScript', 'Mobile Development', 'Firebase', 'Redux', 'iOS', 'Android'],
            'budget_type' => 'fixed',
            'budget_min' => 6000,
            'budget_max' => 9000,
            'experience_level' => 'expert',
            'estimated_duration_days' => 45,
            'deadline' => now()->addDays(75),
            'status' => 'open',
            'location' => 'Cebu City, Philippines',
            'is_remote' => true,
        ]);

        // 3. Frontend React job (Intermediate level)
        $job3 = GigJob::create([
            'employer_id' => $testEmployer->id,
            'title' => 'Frontend React Developer',
            'description' => 'Looking for a React developer to build responsive user interfaces for our web application. Must be comfortable with modern React patterns, hooks, and component-based architecture. CSS frameworks and responsive design experience required.',
            'required_skills' => ['React', 'JavaScript', 'CSS', 'HTML', 'Responsive Design', 'Git'],
            'budget_type' => 'hourly',
            'budget_min' => 25,
            'budget_max' => 45,
            'experience_level' => 'intermediate',
            'estimated_duration_days' => 30,
            'deadline' => now()->addDays(45),
            'status' => 'open',
            'location' => 'Cebu City, Philippines',
            'is_remote' => true,
        ]);

        // 4. WordPress + PHP job (Intermediate level)
        $job4 = GigJob::create([
            'employer_id' => $testEmployer->id,
            'title' => 'WordPress Developer with PHP Skills',
            'description' => 'Need a WordPress developer to customize themes and plugins for our corporate website. PHP knowledge required for custom functionality. Experience with WooCommerce and custom post types would be beneficial.',
            'required_skills' => ['WordPress', 'PHP', 'CSS', 'JavaScript', 'MySQL', 'WooCommerce'],
            'budget_type' => 'fixed',
            'budget_min' => 2000,
            'budget_max' => 4000,
            'experience_level' => 'intermediate',
            'estimated_duration_days' => 21,
            'deadline' => now()->addDays(35),
            'status' => 'open',
            'location' => 'Cebu City, Philippines',
            'is_remote' => false,
        ]);

        // 5. Simple HTML/CSS job (Beginner level)
        $job5 = GigJob::create([
            'employer_id' => $testEmployer->id,
            'title' => 'Simple Website Landing Page',
            'description' => 'Need a simple, clean landing page for our startup. Should be responsive and include basic contact form. Perfect opportunity for someone starting their career. No complex functionality required.',
            'required_skills' => ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Responsive Design'],
            'budget_type' => 'fixed',
            'budget_min' => 500,
            'budget_max' => 1000,
            'experience_level' => 'beginner',
            'estimated_duration_days' => 7,
            'deadline' => now()->addDays(14),
            'status' => 'open',
            'location' => 'Cebu City, Philippines',
            'is_remote' => true,
        ]);

        // 6. UI/UX Design job (Expert level)
        $job6 = GigJob::create([
            'employer_id' => $testEmployer->id,
            'title' => 'Senior UI/UX Designer for Web Application',
            'description' => 'Looking for a talented UI/UX designer to create wireframes, user flows, and high-fidelity designs for our SaaS platform. Must have experience with design systems, user research, and prototyping tools. Portfolio required.',
            'required_skills' => ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing'],
            'budget_type' => 'hourly',
            'budget_min' => 40,
            'budget_max' => 70,
            'experience_level' => 'expert',
            'estimated_duration_days' => 25,
            'deadline' => now()->addDays(40),
            'status' => 'open',
            'location' => 'Cebu City, Philippines',
            'is_remote' => true,
        ]);

        // 7. Content Writing job (Intermediate level)
        $job7 = GigJob::create([
            'employer_id' => $testEmployer->id,
            'title' => 'Technical Content Writer',
            'description' => 'Need a technical writer to create documentation, blog posts, and marketing content for our software products. Must be able to explain complex technical concepts in simple terms. SEO knowledge and research skills required.',
            'required_skills' => ['Content Writing', 'Technical Writing', 'SEO', 'Research', 'Blog Writing', 'Documentation'],
            'budget_type' => 'fixed',
            'budget_min' => 1500,
            'budget_max' => 2500,
            'experience_level' => 'intermediate',
            'estimated_duration_days' => 14,
            'deadline' => now()->addDays(21),
            'status' => 'open',
            'location' => 'Cebu City, Philippines',
            'is_remote' => true,
        ]);

        $this->command->info('✅ Created 7 test jobs for AI matching scenarios');
        $this->command->info('');
        $this->command->info('🎯 AI MATCH TEST SCENARIOS:');
        $this->command->info('');
        $this->command->info('PERFECT MATCHES (90%+):');
        $this->command->info('   • Expert React/Laravel developer → Job #1 (Full Stack)');
        $this->command->info('   • Expert React Native developer → Job #2 (Mobile App)');
        $this->command->info('   • Expert UI/UX Designer → Job #6 (Design)');
        $this->command->info('');
        $this->command->info('GOOD MATCHES (70-89%):');
        $this->command->info('   • Intermediate React developer → Job #3 (Frontend)');
        $this->command->info('   • Intermediate WordPress/PHP developer → Job #4 (WordPress)');
        $this->command->info('   • Intermediate Technical Writer → Job #7 (Content)');
        $this->command->info('');
        $this->command->info('PARTIAL MATCHES (50-69%):');
        $this->command->info('   • Beginner with basic skills → Job #5 (Simple Landing Page)');
        $this->command->info('   • Frontend developers → Design jobs (some overlapping skills)');
        $this->command->info('');
        $this->command->info('TESTING INSTRUCTIONS:');
        $this->command->info('   1. Run: php artisan db:seed --class=AIMatchTestSeeder');
        $this->command->info('   2. Log in as any gig worker to test AI matching');
        $this->command->info('   3. Visit /ai/recommendations to see personalized job matches');
        $this->command->info('   4. Check match scores and reasons for each recommendation');
        $this->command->info('');
        $this->command->info('📊 EXPECTED MATCH RESULTS:');
        $this->command->info('   • Expert Full Stack → 95% match (perfect skills + experience)');
        $this->command->info('   • Expert Mobile Dev → 92% match (perfect skills + experience)');
        $this->command->info('   • Intermediate React → 78% match (good skills, lower experience)');
        $this->command->info('   • Beginner Frontend → 65% match (basic skills, experience gap)');
        $this->command->info('   • Wrong specialization → 30% match (skills mismatch)');
        $this->command->info('');
        $this->command->info('🚀 Ready to test AI matching functionality!');
    }
}