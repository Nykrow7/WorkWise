<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Transaction;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * Show payment page for project
     */
    public function show(Project $project): Response
    {
        // Ensure user is the employer for this project
        if ($project->employer_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Payment/Show', [
            'project' => $project->load(['job', 'gigWorker', 'acceptedBid']),
            'testCards' => $this->paymentService->getTestCards(),
            'stripeKey' => config('services.stripe.key')
        ]);
    }

    /**
     * Create payment intent for escrow
     */
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
            'success' => true,
            'client_secret' => $result['client_secret'],
            'payment_intent_id' => $result['payment_intent_id']
        ]);
    }

    /**
     * Confirm payment
     */
    public function confirmPayment(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string'
        ]);

        $result = $this->paymentService->confirmEscrowPayment($request->payment_intent_id);

        if ($result['success']) {
            return redirect()->route('projects.show', ['project' => $request->project_id])
                ->with('success', 'Payment completed successfully! Funds are now in escrow.');
        }

        return back()->withErrors(['payment' => $result['error']]);
    }

    /**
     * Release payment to gig worker
     */
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

    /**
     * Refund payment to employer
     */
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

    /**
     * Show payment history
     */
    public function history(): Response
    {
        $transactions = $this->paymentService->getPaymentHistory(auth()->id());

        // Calculate summary stats
        $totalEarned = collect($transactions)
            ->where('is_incoming', true)
            ->where('type', 'release')
            ->sum('net_amount');

        $totalSpent = collect($transactions)
            ->where('is_incoming', false)
            ->where('type', 'escrow')
            ->sum('amount');

        $pendingEscrow = collect($transactions)
            ->where('type', 'escrow')
            ->where('status', 'completed')
            ->sum('amount');

        return Inertia::render('Payment/History', [
            'transactions' => $transactions,
            'summary' => [
                'total_earned' => $totalEarned,
                'total_spent' => $totalSpent,
                'pending_escrow' => $pendingEscrow,
                'transaction_count' => count($transactions)
            ]
        ]);
    }

    /**
     * Show transaction details
     */
    public function transaction(Transaction $transaction): Response
    {
        // Ensure user is involved in this transaction
        if ($transaction->payer_id !== auth()->id() && $transaction->payee_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Payment/Transaction', [
            'transaction' => $transaction->load(['project.job', 'payer', 'payee'])
        ]);
    }
}
