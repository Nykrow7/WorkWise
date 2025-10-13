<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\AIRecommendationController;
use App\Http\Controllers\Api\UserController;

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

Route::middleware('auth:sanctum')->group(function () {
    // Project Payment Routes
    Route::post('/projects/{project}/payment/intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/projects/{project}/payment/release', [PaymentController::class, 'releasePayment']);
    Route::post('/projects/{project}/payment/refund', [PaymentController::class, 'refundPayment']);
    
    // Project Status Routes
    Route::post('/projects/{project}/complete', [ProjectController::class, 'complete']);
    
    // User Routes
    Route::get('/users/{id}', [UserController::class, 'show']);
});

// Stripe webhook
Route::post('/stripe/webhook', [WebhookController::class, 'handleStripeWebhook']);

// AI Test Connection
Route::match(['GET', 'POST'], '/ai/test-connection', [AIRecommendationController::class, 'testConnection'])
    ->withoutMiddleware(['web', 'csrf']);

Route::post('/recommendations/skills', [AIRecommendationController::class, 'recommendSkills']);
Route::post('/recommendations/skills/accept', [AIRecommendationController::class, 'acceptSuggestion']);