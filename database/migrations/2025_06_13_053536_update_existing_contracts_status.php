<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Update existing contracts to use the new employer-first signing workflow
     */
    public function up(): void
    {
        // Update any existing contracts with 'pending_gig_worker_signature' status
        // to 'pending_employer_signature' to enforce employer-first signing
        DB::table('contracts')
            ->where('status', 'pending_gig_worker_signature')
            ->whereNull('employer_signed_at')
            ->whereNull('gig_worker_signed_at')
            ->update(['status' => 'pending_employer_signature']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to the old workflow if needed
        DB::table('contracts')
            ->where('status', 'pending_employer_signature')
            ->whereNull('employer_signed_at')
            ->whereNull('gig_worker_signed_at')
            ->update(['status' => 'pending_gig_worker_signature']);
    }
};
