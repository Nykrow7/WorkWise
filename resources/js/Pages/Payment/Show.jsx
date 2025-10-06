import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// stripePromise will be initialized in the component

function PaymentForm({ project, clientSecret, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const { post } = useForm();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/confirm?project_id=${project.id}`,
                },
                redirect: 'if_required',
            });

            if (result.error) {
                throw result.error;
            }

            if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                // Payment succeeded
                post('/payment/confirm', {
                    payment_intent_id: result.paymentIntent.id,
                    project_id: project.id
                });
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'An error occurred while processing your payment.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <span className="text-blue-400 text-xl">🔒</span>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Secure Escrow Payment
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>Your payment will be held securely in escrow until the project is completed to your satisfaction.</p>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentElement options={{
                layout: 'tabs',
                paymentMethodOrder: ['card'],
            }} />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400 text-xl">❌</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Payment Error
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {processing ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                    </div>
                ) : (
                    `Pay $${project.agreed_amount.toLocaleString()} (Escrow)`
                )}
            </button>
        </form>
    );
}

export default function PaymentShow({ project, testCards, stripeKey }) {
    const [showTestCards, setShowTestCards] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [isLoadingIntent, setIsLoadingIntent] = useState(true);
    const [intentError, setIntentError] = useState(null);
    const [stripePromise, setStripePromise] = useState(null);

    // Initialize Stripe
    useEffect(() => {
        if (stripeKey) {
            setStripePromise(loadStripe(stripeKey));
        }
    }, [stripeKey]);

    useEffect(() => {
        // Create payment intent when component mounts
        const createPaymentIntent = async () => {
            try {
                setIsLoadingIntent(true);
                setIntentError(null);

                // Get CSRF token safely
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                if (!csrfToken) {
                    throw new Error('CSRF token not found. Please refresh the page and try again.');
                }

                const response = await fetch(`/projects/${project.id}/payment/intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                });

                const data = await response.json();

                if (data.success && data.client_secret) {
                    setClientSecret(data.client_secret);
                } else {
                    setIntentError(data.error || 'Failed to initialize payment');
                }
            } catch (err) {
                setIntentError('Failed to initialize payment');
            } finally {
                setIsLoadingIntent(false);
            }
        };

        createPaymentIntent();
    }, [project.id]);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Payment for: {project.job.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Secure escrow payment with {project.gig_worker.first_name} {project.gig_worker.last_name}
                    </p>
                </div>
            }
        >
            <Head title={`Payment - ${project.job.title}`} />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Payment Form */}
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-6">Complete Payment</h3>

                                {isLoadingIntent ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-600">Initializing payment...</div>
                                    </div>
                                ) : stripePromise && clientSecret && clientSecret.startsWith('pi_') ? (
                                    <Elements
                                        key={clientSecret} // Force re-render when clientSecret changes
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: {
                                                theme: 'stripe',
                                            },
                                        }}
                                    >
                                        <PaymentForm project={project} clientSecret={clientSecret} />
                                    </Elements>
                                ) : intentError ? (
                                    <div className="text-center py-8">
                                        <div className="text-red-600">{intentError}</div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-600">Unable to load payment form</div>
                                    </div>
                                )}

                                {/* Test Cards for Demo */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowTestCards(!showTestCards)}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        🧪 Show Test Cards for Demo
                                    </button>
                                    
                                    {showTestCards && (
                                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                            <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                                Demo Test Cards (No Real Money)
                                            </h4>
                                            <div className="space-y-2 text-xs text-yellow-700">
                                                {testCards.map((card, index) => (
                                                    <div key={index} className="flex justify-between">
                                                        <span className="font-mono">{card.number}</span>
                                                        <span>{card.description}</span>
                                                    </div>
                                                ))}
                                                <p className="text-xs mt-2">
                                                    Use any future expiry date and any 3-digit CVC.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Project Summary */}
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-6">Payment Summary</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Project Value</span>
                                        <span className="font-semibold">₱{project.agreed_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform Fee (5%)</span>
                                        <span className="font-semibold">₱{(project.agreed_amount * 0.05).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gig Worker Receives</span>
                                        <span className="font-semibold text-green-600">
                                            ₱{(project.agreed_amount * 0.95).toFixed(2)}
                                        </span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-semibold">Total Payment</span>
                                        <span className="font-bold text-blue-600">
                                            ₱{project.agreed_amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-medium mb-3">Project Details</h4>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Gig Worker</dt>
                                            <dd className="font-medium">
                                                {project.gig_worker.first_name} {project.gig_worker.last_name}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Duration</dt>
                                            <dd className="font-medium">{project.agreed_duration_days} days</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Deadline</dt>
                                            <dd className="font-medium">
                                                {project.deadline 
                                                    ? new Date(project.deadline).toLocaleDateString()
                                                    : 'Not set'
                                                }
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-medium mb-3">How Escrow Works</h4>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-start">
                                            <span className="text-blue-500 mr-2">1.</span>
                                            <span>Your payment is securely held in escrow</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="text-blue-500 mr-2">2.</span>
                                            <span>Gig Worker completes the work</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="text-blue-500 mr-2">3.</span>
                                            <span>You approve the completed work</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="text-blue-500 mr-2">4.</span>
                                            <span>Payment is released to gig worker</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <span className="text-green-400 text-xl">🛡️</span>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">
                                                100% Protected
                                            </h3>
                                            <div className="mt-2 text-sm text-green-700">
                                                <p>Your money is protected until you're completely satisfied with the work.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                body {
                    background: white;
                    color: #333;
                    font-family: 'Inter', sans-serif;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
