<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add a new column for admin role instead of modifying enum
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->after('user_type');
        });

        // Update existing admin users (if any) - this would be done manually
        // User::where('user_type', 'admin')->update(['is_admin' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_admin');
        });
    }
};
