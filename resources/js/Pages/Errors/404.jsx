import { Head, Link } from '@inertiajs/react';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <>
            <Head title="Page Not Found - WorkWise" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative max-w-lg w-full text-center">
                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-6 shadow-2xl">
                            <span className="text-4xl font-bold text-white">404</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Oops! Page Not Found
                        </h1>
                        <p className="text-lg text-gray-600 mb-2">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                        <p className="text-sm text-gray-500">
                            Don't worry, it happens to the best of us. Let's get you back on track.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <HomeIcon className="w-5 h-5 mr-2" />
                            Go Home
                        </Link>
                        
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            Go Back
                        </button>
                    </div>

                    {/* Search Suggestion */}
                    <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-3">
                            <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Looking for something specific?</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Try these popular sections:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Link
                                href="/jobs"
                                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                            >
                                Browse Jobs
                            </Link>
                            <Link
                                href="/freelancers"
                                className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                            >
                                Find Freelancers
                            </Link>
                            <Link
                                href="/help"
                                className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm font-medium"
                            >
                                Help Center
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm font-medium"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">Contact our support team</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}