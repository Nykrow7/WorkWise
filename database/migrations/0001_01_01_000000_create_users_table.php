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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('barangay')->nullable();
            $table->enum('user_type', ['gig_worker', 'employer'])->default('gig_worker');

            // Profile completion tracking
            $table->boolean('profile_completed')->default(false);
            $table->enum('profile_status', ['pending', 'approved', 'rejected'])->default('pending');

            // Common fields
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->string('phone')->nullable();
            $table->string('profile_photo')->nullable();

            // Gig Worker-specific fields
            $table->string('professional_title')->nullable();
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->enum('experience_level', ['beginner', 'intermediate', 'expert'])->nullable();
            $table->json('skills')->nullable();
            $table->json('languages')->nullable();
            $table->string('portfolio_url')->nullable();

            // Employer-specific fields
            $table->string('company_name')->nullable();
            $table->string('work_type_needed')->nullable();
            $table->string('budget_range')->nullable();
            $table->text('project_intent')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
