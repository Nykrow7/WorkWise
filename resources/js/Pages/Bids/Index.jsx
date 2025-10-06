import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SuccessModal from '@/Components/SuccessModal';
import { formatDistanceToNow } from 'date-fns';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'green', isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white/95 backdrop-blur-sm rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
                    <div className="bg-gradient-to-br from-white to-blue-50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl shadow-lg ${confirmColor === 'green' ? 'bg-gradient-to-br from-green-100 to-green-200' : confirmColor === 'gray' ? 'bg-gradient-to-br from-gray-100 to-gray-200' : 'bg-gradient-to-br from-red-100 to-red-200'} sm:mx-0 sm:h-10 sm:w-10`}>
                                {confirmColor === 'green' ? (
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : confirmColor === 'gray' ? (
                                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                )}
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-6 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl transform hover:scale-105 disabled:transform-none ${
                                confirmColor === 'green'
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500'
                                    : confirmColor === 'gray'
                                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus:ring-gray-500'
                                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500'
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : confirmText}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-lg px-6 py-3 bg-white/70 backdrop-blur-sm text-base font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function BidsIndex({ bids }) {
    const { auth } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [processing, setProcessing] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        bidId: null,
        action: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'green'
    });
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        message: ''
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatAmount = (value) => {
        const number = Number(value ?? 0);
        return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'withdrawn':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const isGigWorker = auth.user.user_type === 'gig_worker';

    const handleBidAction = (bidId, action) => {
        let title, message, confirmText, confirmColor;

        switch (action) {
            case 'accept':
                title = 'Accept Proposal';
                message = 'Are you sure you want to accept this proposal? This will create a new project and deduct the bid amount from your escrow balance.';
                confirmText = 'Accept Proposal';
                confirmColor = 'green';
                break;
            case 'reject':
                title = 'Decline Proposal';
                message = 'Are you sure you want to decline this proposal? This action cannot be undone.';
                confirmText = 'Decline Proposal';
                confirmColor = 'red';
                break;
            case 'withdraw':
                title = 'Withdraw Bid';
                message = 'Are you sure you want to withdraw this bid? You will not be able to resubmit it later.';
                confirmText = 'Withdraw Bid';
                confirmColor = 'gray';
                break;
            default:
                return;
        }

        setConfirmModal({
            isOpen: true,
            bidId,
            action,
            title,
            message,
            confirmText,
            confirmColor
        });
    };

    const handleConfirmAction = () => {
        setProcessing(true);

        const { bidId, action } = confirmModal;
        let url, method, data;

        switch (action) {
            case 'accept':
                url = route('bids.update', bidId);
                method = 'patch';
                data = { status: 'accepted' };
                break;
            case 'reject':
                url = route('bids.update', bidId);
                method = 'patch';
                data = { status: 'rejected' };
                break;
            case 'withdraw':
                url = route('bids.destroy', bidId);
                method = 'delete';
                data = {};
                break;
            default:
                setProcessing(false);
                return;
        }

        router[method](url, data, {
            preserveScroll: false,
            onSuccess: (page) => {
                setProcessing(false);
                setConfirmModal({ ...confirmModal, isOpen: false });

                // Check if there's an error in the flash messages
                if (page.props?.flash?.error) {
                    console.error('Bid action failed:', page.props.flash.error);
                    return;
                }

                // Show success modal only if we have a success message
                if (page.props?.flash?.success) {
                    let successMessage = '';
                    switch (action) {
                        case 'accept':
                            successMessage = 'Proposal accepted successfully! Redirecting to contract signing...';
                            break;
                        case 'reject':
                            successMessage = 'Proposal declined successfully.';
                            break;
                        case 'withdraw':
                            successMessage = 'Bid withdrawn successfully.';
                            break;
                    }

                    setSuccessModal({
                        isOpen: true,
                        message: successMessage
                    });

                    // Handle redirect for accepted bids
                    if (action === 'accept' && page.props?.flash?.redirect) {
                        setTimeout(() => {
                            router.visit(page.props.flash.redirect);
                        }, 1500);
                    } else if (action === 'accept') {
                        setTimeout(() => {
                            // Refresh to show updated status
                            window.location.reload();
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            router.reload({ only: ['bids'] });
                        }, 1500);
                    }
                } else {
                    console.error('No success message received');
                }
            },
            onError: (errors) => {
                console.error('Bid action failed:', errors);
                setProcessing(false);
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    const handleCloseModal = () => {
        if (!processing) {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {isGigWorker ? 'My Bids' : 'Bids on My Jobs'}
                </h2>
            }
        >
            <Head title={isGigWorker ? 'My Bids' : 'Bids on My Jobs'} />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {bids.data.length > 0 ? (
                        <div className="space-y-6">
                            {bids.data.map((bid) => (
                                <div key={bid.id} className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    <Link 
                                                        href={route('jobs.show', bid.job.id)}
                                                        className="hover:text-blue-600"
                                                    >
                                                        {bid.job.title}
                                                    </Link>
                                                </h3>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    {isGigWorker ? (
                                                        <p>Posted by: {bid.job.employer?.first_name} {bid.job.employer?.last_name}</p>
                                                    ) : (
                                                        <p>Bid by: {bid.gig_worker?.first_name} {bid.gig_worker?.last_name}</p>
                                                    )}
                                                    <p>Submitted: {formatDate(bid.submitted_at)}</p>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-2 text-sm font-medium rounded-full shadow-md transition-all duration-300 ${getStatusColor(bid.status)}`}>
                                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                                <span className="text-sm font-medium text-blue-600">Bid Amount:</span>
                                                <p className="text-lg font-bold text-gray-900 mt-1">₱{formatAmount(bid.bid_amount)}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                                <span className="text-sm font-medium text-blue-600">Estimated Days:</span>
                                                <p className="text-lg font-bold text-gray-900 mt-1">{bid.estimated_days} days</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                                <span className="text-sm font-medium text-blue-600">Job Budget:</span>
                                                <p className="text-lg font-bold text-gray-900 mt-1">{bid.job.budget_display}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <span className="text-sm font-medium text-blue-600 mb-2 block">Proposal:</span>
                                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                                                <p className="text-gray-700 leading-relaxed">{bid.proposal_message}</p>
                                            </div>
                                        </div>

                                        {!isGigWorker && bid.status === 'pending' && (
                                            <div className="flex space-x-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleBidAction(bid.id, 'accept')}
                                                    disabled={processing}
                                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                >
                                                    {processing ? (
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Processing...
                                                        </span>
                                                    ) : 'Accept Bid'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleBidAction(bid.id, 'reject')}
                                                    disabled={processing}
                                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                >
                                                    {processing ? (
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Processing...
                                                        </span>
                                                    ) : 'Reject Bid'}
                                                </button>
                                            </div>
                                        )}

                                        {isGigWorker && bid.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => handleBidAction(bid.id, 'withdraw')}
                                                disabled={processing}
                                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </span>
                                                ) : 'Withdraw Bid'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-12 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {isGigWorker ? "No Bids Yet" : "No Bids Received"}
                                </h3>
                                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                    {isGigWorker
                                        ? "You haven't submitted any bids yet. Start exploring opportunities and submit your first proposal!"
                                        : "No bids have been submitted on your jobs yet. Your posted jobs will receive proposals here."
                                    }
                                </p>
                                {isGigWorker && (
                                    <Link
                                        href={route('jobs.index')}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Browse Jobs
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {bids.links && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex space-x-2">
                                {bids.links.map((link, index) => (
                                    link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                                            link.active
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                                                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="px-4 py-3 text-sm font-medium rounded-xl bg-gray-100/70 backdrop-blur-sm text-gray-400 cursor-not-allowed border border-gray-200"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                body {
                    background: white;
                    color: #333;
                    font-family: 'Inter', sans-serif;
                }
            `}</style>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                confirmColor={confirmModal.confirmColor}
                isLoading={processing}
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ isOpen: false, message: '' })}
                message={successModal.message}
                duration={1000}
            />
        </AuthenticatedLayout>
    );
}
