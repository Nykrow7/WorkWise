<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSkillRecommendationStatsTable extends Migration
{
    public function up(): void
    {
        Schema::create('skill_recommendation_stats', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'skill' or 'role'
            $table->string('value');
            $table->unsignedBigInteger('accepted_count')->default(0);
            $table->json('context')->nullable();
            $table->timestamp('last_accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['type', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_recommendation_stats');
    }
}