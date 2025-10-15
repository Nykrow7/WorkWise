<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\GigJob;
use App\Models\Bid;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkWiseBasicTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_loads(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_user_can_register_as_gig_worker(): void
    {
        // Set the session to simulate role selection
        session(['selected_user_type' => 'gig_worker']);

        $response = $this->post('/register', [
            'name' => 'Test Gig Worker',
            'email' => 'gigworker@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', [
            'email' => 'gigworker@test.com',
            'user_type' => 'gig_worker',
        ]);
    }

    public function test_user_can_register_as_employer(): void
    {
        // Set the session to simulate role selection
        session(['selected_user_type' => 'employer']);

        $response = $this->post('/register', [
            'name' => 'Test Employer',
            'email' => 'employer@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', [
            'email' => 'employer@test.com',
            'user_type' => 'employer',
        ]);
    }

    public function test_employer_can_create_job(): void
    {
        $employer = User::factory()->create(['user_type' => 'employer']);

        $response = $this->actingAs($employer)->post('/jobs', [
            'title' => 'Test Job',
            'description' => 'This is a test job description that meets the minimum length requirement of 100 characters for proper validation.',
            'required_skills' => ['PHP', 'Laravel'],
            'budget_type' => 'fixed',
            'budget_min' => 1000,
            'budget_max' => 2000,
            'experience_level' => 'intermediate',
            'estimated_duration_days' => 30,
            'is_remote' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('gig_jobs', [
            'title' => 'Test Job',
            'employer_id' => $employer->id,
        ]);
    }

    public function test_gig_worker_can_submit_bid(): void
    {
        $employer = User::factory()->create(['user_type' => 'employer']);
        $gigWorker = User::factory()->create(['user_type' => 'gig_worker']);

        $job = GigJob::factory()->create([
            'employer_id' => $employer->id,
            'title' => 'Test Job',
            'status' => 'open',
        ]);

        $response = $this->actingAs($gigWorker)->post('/bids', [
            'job_id' => $job->id,
            'bid_amount' => 1500,
            'proposal_message' => 'This is a test proposal message that is long enough to meet the minimum requirements.',
            'estimated_days' => 25,
        ]);

        $this->assertDatabaseHas('bids', [
            'job_id' => $job->id,
            'gig_worker_id' => $gigWorker->id,
            'bid_amount' => 1500,
        ]);
    }

    public function test_jobs_index_page_loads(): void
    {
        $response = $this->get('/jobs');
        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_role_selection_page_loads(): void
    {
        $response = $this->get('/join');
        $response->assertStatus(200);
    }

    public function test_role_selection_redirects_to_register(): void
    {
        $response = $this->post('/join', [
            'user_type' => 'gig_worker'
        ]);

        $response->assertRedirect('/register');
        $this->assertEquals('gig_worker', session('selected_user_type'));
    }

    public function test_register_redirects_to_role_selection_without_session(): void
    {
        $response = $this->get('/register');
        $response->assertRedirect('/join');
    }
}
