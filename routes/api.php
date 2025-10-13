<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\AIRecommendationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\GigWorkerController;

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

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Authenticated API Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/projects/{project}/complete', [ProjectController::class, 'complete']);
    
    // User Routes
    Route::get('/users/{id}', [UserController::class, 'show']);
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