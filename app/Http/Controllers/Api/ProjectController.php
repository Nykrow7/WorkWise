<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function complete(Request $request, Project $project): JsonResponse
    {
        // Ensure user is the employer
        if ($project->employer_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Validate request
        $request->validate([
            'completion_notes' => 'required|string|max:1000'
        ]);

        // Update project
        $project->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completion_notes' => $request->completion_notes
        ]);

        return response()->json(['success' => true]);
    }
}