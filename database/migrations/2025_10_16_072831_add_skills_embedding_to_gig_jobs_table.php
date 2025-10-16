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
        Schema::table('gig_jobs', function (Blueprint $table) {
            $table->json('skills_embedding')->nullable()->after('required_skills')->comment('AI-generated embedding vector for job requirements and description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gig_jobs', function (Blueprint $table) {
            $table->dropColumn('skills_embedding');
        });
    }
};
