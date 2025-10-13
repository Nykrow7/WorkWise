import { Head, Link } from '@inertiajs/react';
import { HomeIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ServerError() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title="Server Error - WorkWise" />
            
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative max-w-lg w-full text-center">
                    {/* 500 Illustration */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-6 shadow-2xl">
                            <ExclamationTriangleIcon className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Something Went Wrong
                        </h1>
                        <p className="text-lg text-gray-600 mb-2">
                            We're experiencing some technical difficulties on our end.
                        </p>
                        <p className="text-sm text-gray-500">
                            Our team has been notified and is working to fix this issue. Please try again in a few moments.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />
                            Try Again
                        </button>
                        
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <HomeIcon className="w-5 h-5 mr-2" />
                            Go Home
                        </Link>
                    </div>

                    {/* Error Details */}
                    <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-3">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-400 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">What can you do?</h3>
                        </div>
                        <div className="space-y-3 text-left">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-blue-600 text-sm font-bold">1</span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    <strong>Wait a moment</strong> and try refreshing the page
                                </p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-green-600 text-sm font-bold">2</span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    <strong>Check your internet connection</strong> and try again
                                </p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-purple-600 text-sm font-bold">3</span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    <strong>Contact support</strong> if the problem persists
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Support Information */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Need immediate assistance?</h4>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                            >
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                                Contact Support
                            </Link>
                            <a
                                href="mailto:support@workwise.com"
                                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                            >
                                Email Us
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • 
                            Time: {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}