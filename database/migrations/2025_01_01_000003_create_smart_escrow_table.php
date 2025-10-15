<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escrow_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('employer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('gig_worker_id')->constrained('users')->onDelete('cascade');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('platform_fee', 10, 2);
            $table->decimal('available_amount', 10, 2);
            $table->enum('status', ['pending', 'active', 'completed', 'disputed', 'cancelled']);
            $table->enum('protection_level', ['basic', 'enhanced', 'premium']);
            $table->json('escrow_terms');
            $table->decimal('risk_score', 3, 2);
            $table->boolean('milestone_based')->default(true);
            $table->boolean('automatic_release')->default(false);
            $table->boolean('fraud_insurance')->default(false);
            $table->boolean('multi_signature')->default(false);
            $table->timestamp('funded_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status']);
            $table->index(['risk_score', 'protection_level']);
        });

        Schema::create('escrow_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escrow_account_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->decimal('amount', 10, 2);
            $table->integer('order_index');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'disputed']);
            $table->json('completion_criteria');
            $table->json('deliverables')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();

            $table->index(['escrow_account_id', 'status']);
            $table->index(['status', 'due_date']);
        });

        Schema::create('escrow_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escrow_account_id')->constrained()->onDelete('cascade');
            $table->foreignId('milestone_id')->nullable()->constrained('escrow_milestones')->onDelete('set null');
            $table->enum('transaction_type', ['deposit', 'release', 'refund', 'fee', 'insurance_claim']);
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled']);
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_transfer_id')->nullable();
            $table->json('transaction_metadata');
            $table->text('description');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['escrow_account_id', 'transaction_type']);
            $table->index(['status', 'transaction_type']);
        });

        Schema::create('fraud_detection_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escrow_account_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('detection_type'); // rapid_completion, unusual_communication, etc.
            $table->decimal('risk_score', 3, 2);
            $table->json('detection_data');
            $table->enum('action_taken', ['none', 'flag', 'freeze', 'investigate', 'release']);
            $table->text('notes')->nullable();
            $table->boolean('false_positive')->default(false);
            $table->timestamps();

            $table->index(['escrow_account_id', 'detection_type']);
            $table->index(['risk_score', 'action_taken']);
        });

        Schema::create('dispute_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escrow_account_id')->constrained()->onDelete('cascade');
            $table->foreignId('milestone_id')->nullable()->constrained('escrow_milestones')->onDelete('set null');
            $table->foreignId('initiated_by')->constrained('users')->onDelete('cascade');
            $table->enum('dispute_type', ['quality', 'delivery', 'payment', 'scope', 'communication']);
            $table->text('description');
            $table->json('evidence')->nullable();
            $table->enum('status', ['open', 'investigating', 'mediation', 'resolved', 'escalated']);
            $table->enum('resolution', ['employer_favor', 'gig_worker_favor', 'partial_refund', 'full_refund', 'no_action'])->nullable();
            $table->decimal('resolution_amount', 10, 2)->nullable();
            $table->text('resolution_notes')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['escrow_account_id', 'status']);
            $table->index(['dispute_type', 'status']);
        });

        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escrow_account_id')->constrained()->onDelete('cascade');
            $table->foreignId('claimant_id')->constrained('users')->onDelete('cascade');
            $table->enum('claim_type', ['fraud', 'non_delivery', 'quality_issue', 'identity_theft']);
            $table->decimal('claim_amount', 10, 2);
            $table->text('description');
            $table->json('evidence');
            $table->enum('status', ['submitted', 'reviewing', 'investigating', 'approved', 'denied', 'paid']);
            $table->decimal('approved_amount', 10, 2)->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['escrow_account_id', 'status']);
            $table->index(['claim_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
        Schema::dropIfExists('dispute_cases');
        Schema::dropIfExists('fraud_detection_logs');
        Schema::dropIfExists('escrow_transactions');
        Schema::dropIfExists('escrow_milestones');
        Schema::dropIfExists('escrow_accounts');
    }
};
