<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('gig_jobs')->onDelete('cascade');
            $table->foreignId('gig_worker_id')->constrained('users')->onDelete('cascade');
            $table->decimal('bid_amount', 10, 2);
            $table->text('proposal_message');
            $table->integer('estimated_days');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'withdrawn'])->default('pending');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            // Ensure a gig worker can only bid once per job
            $table->unique(['job_id', 'gig_worker_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bids');
    }
};
