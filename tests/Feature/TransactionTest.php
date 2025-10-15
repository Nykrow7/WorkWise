<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Project;
use App\Models\Transaction;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Stripe\PaymentIntent;
use Stripe\Transfer;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private $paymentService;
    private $client;
    private $gigWorker;
    private $project;

    protected function setUp(): void
    {
        parent::setUp();

        // Set test Stripe configuration
        config([
            'services.stripe.key' => 'pk_test_51OvKQXJBPPGLxXXXXXXXXXXXX',
            'services.stripe.secret' => 'sk_test_51OvKQXJBPPGLxXXXXXXXXXXXX',
            'services.stripe.webhook.secret' => 'whsec_test',
            'services.stripe.currency' => 'php'
        ]);

        // Mock PaymentService
        $this->paymentService = Mockery::mock(PaymentService::class);
        $this->app->instance(PaymentService::class, $this->paymentService);

        // Seed test data
        $this->artisan('db:seed', ['--class' => 'TestTransactionSeeder']);

        // Get test data
        $this->client = User::where('email', 'test.client@example.com')->first();
        $this->gigWorker = User::where('email', 'test.gigworker@example.com')->first();
        $this->project = Project::first();

        // Authenticate client
        Sanctum::actingAs($this->client);
    }

    /** @test */
    public function test_complete_transaction_flow()
    {
        // Mock payment intent creation
        $this->paymentService->shouldReceive('createEscrowPayment')
            ->once()
            ->with($this->project)
            ->andReturn([
                'success' => true,
                'client_secret' => 'test_client_secret',
                'payment_intent_id' => 'pi_test123'
            ]);

        // 1. Create Payment Intent
        $response = $this->postJson("/api/projects/{$this->project->id}/payment/intent");

        $this->assertTrue($response->json('success'));
        $this->assertEquals('test_client_secret', $response->json('client_secret'));
        $paymentIntentId = $response->json('payment_intent_id');

        // 2. Confirm Payment (simulate Stripe webhook)
        $webhookResponse = $this->postJson('/api/stripe/webhook', [
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => $paymentIntentId,
                    'charges' => [
                        'data' => [['id' => 'ch_test123']]
                    ]
                ]
            ]
        ], ['Stripe-Signature' => 'test_signature']);

        $this->assertEquals(200, $webhookResponse->status());

        // 3. Verify Transaction Status
        $transaction = Transaction::where('stripe_payment_intent_id', $paymentIntentId)
            ->first();

        $this->assertEquals('completed', $transaction->status);
        $this->assertEquals('escrow', $transaction->type);

        // 4. Complete Project
        $response = $this->postJson("/api/projects/{$this->project->id}/complete", [
            'completion_notes' => 'Project completed successfully'
        ]);

        $this->assertTrue($response->json('success'));

        // Mock payment release
        $this->paymentService->shouldReceive('releasePayment')
            ->once()
            ->with($this->project)
            ->andReturn(['success' => true]);

        // 5. Release Payment
        $response = $this->postJson("/api/projects/{$this->project->id}/payment/release");

        $this->assertTrue($response->json('success'));

        // 6. Verify Release Transaction
        $releaseTransaction = Transaction::where('project_id', $this->project->id)
            ->where('type', 'release')
            ->first();

        $this->assertNotNull($releaseTransaction);
        $this->assertEquals('completed', $releaseTransaction->status);
        
        // 7. Verify Project Status
        $this->project->refresh();
        $this->assertTrue($this->project->payment_released);
        $this->assertEquals('completed', $this->project->status);
    }

    /** @test */
    public function test_payment_failure_handling()
    {
        // Mock payment intent creation
        $this->paymentService->shouldReceive('createEscrowPayment')
            ->once()
            ->with($this->project)
            ->andReturn([
                'success' => true,
                'client_secret' => 'test_client_secret',
                'payment_intent_id' => 'pi_test123'
            ]);

        // 1. Create Payment Intent
        $response = $this->postJson("/api/projects/{$this->project->id}/payment/intent");

        $this->assertTrue($response->json('success'));
        $paymentIntentId = $response->json('payment_intent_id');

        // 2. Simulate Payment Failure (webhook)
        $webhookResponse = $this->postJson('/api/stripe/webhook', [
            'type' => 'payment_intent.payment_failed',
            'data' => [
                'object' => [
                    'id' => $paymentIntentId,
                    'last_payment_error' => [
                        'message' => 'Your card was declined.'
                    ]
                ]
            ]
        ], ['Stripe-Signature' => 'test_signature']);

        $this->assertEquals(200, $webhookResponse->status());

        // 3. Verify Transaction Status
        $transaction = Transaction::where('stripe_payment_intent_id', $paymentIntentId)
            ->first();

        $this->assertEquals('failed', $transaction->status);
        $this->assertArrayHasKey('failure_message', $transaction->metadata);
    }

    /** @test */
    public function test_refund_flow()
    {
        // Mock payment intent creation
        $this->paymentService->shouldReceive('createEscrowPayment')
            ->once()
            ->with($this->project)
            ->andReturn([
                'success' => true,
                'client_secret' => 'test_client_secret',
                'payment_intent_id' => 'pi_test123'
            ]);

        // 1. Create and Complete Payment
        $response = $this->postJson("/api/projects/{$this->project->id}/payment/intent");

        $this->assertTrue($response->json('success'));
        $paymentIntentId = $response->json('payment_intent_id');

        // Simulate successful payment
        $this->postJson('/api/stripe/webhook', [
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => $paymentIntentId,
                    'charges' => [
                        'data' => [['id' => 'ch_test123']]
                    ]
                ]
            ]
        ], ['Stripe-Signature' => 'test_signature']);

        // Mock refund
        $this->paymentService->shouldReceive('refundPayment')
            ->once()
            ->with($this->project, 'requested_by_customer')
            ->andReturn(['success' => true]);

        // 2. Request Refund
        $response = $this->postJson("/api/projects/{$this->project->id}/payment/refund", [
            'reason' => 'requested_by_customer'
        ]);

        $this->assertTrue($response->json('success'));

        // 3. Verify Refund Transaction
        $refundTransaction = Transaction::where('project_id', $this->project->id)
            ->where('type', 'refund')
            ->first();

        $this->assertNotNull($refundTransaction);
        $this->assertEquals('completed', $refundTransaction->status);
    }
}