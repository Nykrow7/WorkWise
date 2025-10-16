<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\AIRecommendationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\GigWorkerController;
use App\Http\Controllers\EmployerDashboardController;
use App\Http\Controllers\JobInvitationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authenticated API Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Project routes
    Route::apiResource('projects', ProjectController::class);

    // Employer routes
    Route::get('/employer/jobs', function (Request $request) {
        $user = $request->user();
        
        if ($user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $jobs = \App\Models\GigJob::where('employer_id', $user->id)
            ->where('status', 'open')
            ->select('id', 'title', 'budget_type', 'budget_min', 'budget_max')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['data' => $jobs]);
    });

    // Job Invitation routes
    Route::post('/job-invitations/send', [JobInvitationController::class, 'sendInvitation']);

    // Gig Worker routes
    Route::prefix('gig-worker')->group(function () {
        Route::get('/job-invitations', [JobInvitationController::class, 'getInvitations']);
        Route::patch('/job-invitations/{invitation}/respond', [JobInvitationController::class, 'respondToInvitation']);
        
        // AI-powered job recommendations for gig workers
        Route::get('/ai-recommendations', [AIRecommendationController::class, 'getJobRecommendations']);
    });

    // Employer routes for AI recommendations
    Route::prefix('employer')->group(function () {
        // AI-powered gig worker recommendations for specific job
        Route::get('/jobs/{jobId}/ai-recommendations', [AIRecommendationController::class, 'getWorkerRecommendations']);
    });
});

// Public API Routes (no authentication required)
Route::prefix('gig-workers')->group(function () {
    Route::get('/', [GigWorkerController::class, 'index']);
    Route::get('/skills/available', [GigWorkerController::class, 'getAvailableSkills']);
    Route::get('/stats/overview', [GigWorkerController::class, 'getStats']);
    Route::get('/{id}', [GigWorkerController::class, 'show']);
});

// Stripe webhook
Route::post('/stripe/webhook', [WebhookController::class, 'handleStripeWebhook']);

// AI Test Connection
Route::match(['GET', 'POST'], '/ai/test-connection', [AIRecommendationController::class, 'testConnection'])
    ->withoutMiddleware(['web', 'csrf']);

Route::post('/recommendations/skills', [AIRecommendationController::class, 'recommendSkills']);
Route::post('/recommendations/skills/accept', [AIRecommendationController::class, 'acceptSuggestion']);

// AI-powered recommendation endpoints
Route::get('/gig-worker/ai-recommendations', [AIRecommendationController::class, 'getJobRecommendations']);
Route::get('/employer/jobs/{jobId}/ai-recommendations', [AIRecommendationController::class, 'getWorkerRecommendations']);

// Profile update recommendation endpoint
Route::middleware('auth:sanctum')->post('/ai/recommendations/update-profile', [AIRecommendationController::class, 'updateProfileRecommendations']);