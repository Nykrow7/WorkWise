<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Transaction;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class EmployerWalletController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('stripe.secret'));
    }

    /**
     * Show employer wallet with escrow balance and deposit functionality
     */
    public function index(): Response
    {
        $user = auth()->user();
        
        // Auto-check pending deposits before showing the page
        $this->autoConfirmPendingDeposits();

        // Get deposit history
        $deposits = $user->deposits()
            ->latest()
            ->paginate(10);

        // Get projects where employer made payments
        $paidProjects = Project::where('employer_id', $user->id)
            ->whereHas('transactions', function($query) {
                $query->where('type', 'escrow')->where('status', 'completed');
            })
            ->with(['job', 'gig_worker', 'transactions'])
            ->latest()
            ->take(5)
            ->get();

        // Get transaction history (payments made)
        $transactions = Transaction::where('payer_id', $user->id)
            ->where('type', 'escrow')
            ->where('status', 'completed')
            ->with(['project.job', 'payee'])
            ->latest()
            ->paginate(10);

        // Calculate total spent
        $totalSpent = Transaction::where('payer_id', $user->id)
            ->where('type', 'escrow')
            ->where('status', 'completed')
            ->sum('amount');

        return Inertia::render('Employer/Wallet', [
            'deposits' => $deposits,
            'paidProjects' => $paidProjects,
            'transactions' => $transactions,
            'totalSpent' => $totalSpent,
            'escrowBalance' => $user->escrow_balance ?? 0,
            'stripe_key' => config('stripe.key'),
            'currency' => [
                'code' => config('app.currency', 'PHP'),
                'symbol' => '₱',
                'decimal_places' => 2
            ]
        ]);
    }

    /**
     * Create payment intent for adding funds to escrow
     */
    public function createIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1'
        ]);

        try {
            $amount = $request->amount * 100; // Convert to cents for Stripe
            $user = auth()->user();

            $intent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => strtolower(config('app.currency', 'php')),
                'metadata' => [
                    'user_id' => $user->id,
                    'purpose' => 'escrow_deposit'
                ]
            ]);

            // Create a pending deposit record
            $deposit = Deposit::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'currency' => strtolower(config('app.currency', 'php')),
                'stripe_payment_intent_id' => $intent->id,
                'status' => 'pending',
                'metadata' => [
                    'client_secret' => $intent->client_secret
                ]
            ]);

            return response()->json([
                'clientSecret' => $intent->client_secret,
                'deposit_id' => $deposit->id
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create payment intent: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Auto-confirm pending deposits by checking with Stripe
     */
    private function autoConfirmPendingDeposits()
    {
        $pendingDeposits = auth()->user()->deposits()
            ->where('status', 'pending')
            ->get();

        foreach ($pendingDeposits as $deposit) {
            try {
                $paymentIntent = PaymentIntent::retrieve($deposit->stripe_payment_intent_id);
                
                if ($paymentIntent->status === 'succeeded') {
                    $deposit->update([
                        'status' => 'completed',
                        'payment_method' => $paymentIntent->payment_method
                    ]);

                    // Update user's escrow balance
                    $deposit->user->increment('escrow_balance', $deposit->amount);
                }
            } catch (\Exception $e) {
                // Log error but continue processing other deposits
                \Log::error('Failed to check deposit status', [
                    'deposit_id' => $deposit->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}
