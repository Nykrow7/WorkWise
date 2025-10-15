<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function createPaymentIntent(Request $request, Project $project): JsonResponse
    {
        // Ensure user is the employer
        if ($project->employer_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $result = $this->paymentService->createEscrowPayment($project);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 400);
        }

        return response()->json([
            'data' => [
                'client_secret' => $result['client_secret'],
                'payment_intent_id' => $result['payment_intent_id']
            ]
        ]);
    }

    public function releasePayment(Request $request, Project $project): JsonResponse
    {
        // Ensure user is the employer
        if ($project->employer_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Ensure project is completed
        if (!$project->isCompleted()) {
            return response()->json(['error' => 'Project must be completed before releasing payment'], 400);
        }

        $result = $this->paymentService->releasePayment($project);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 400);
        }

        return response()->json(['success' => true]);
    }

    public function refundPayment(Request $request, Project $project): JsonResponse
    {
        // Ensure user is the employer
        if ($project->employer_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $result = $this->paymentService->refundPayment(
            $project,
            $request->input('reason', 'requested_by_customer')
        );

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 400);
        }

        return response()->json(['success' => true]);
    }
}