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
        Schema::create('skill_embeddings', function (Blueprint $table) {
            $table->id();
            $table->string('skill_name')->unique();
            $table->json('embedding'); // Store the embedding vector as JSON
            $table->timestamps();
            
            // Add index for faster skill lookups
            $table->index('skill_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skill_embeddings');
    }
};
