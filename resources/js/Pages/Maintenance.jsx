import { Head } from '@inertiajs/react';
import { WrenchScrewdriverIcon, ClockIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Maintenance({ estimatedTime = '2 hours', message = null, lastUpdated = null }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title="Maintenance Mode - WorkWise" />
            
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative max-w-2xl w-full text-center">
                    {/* Maintenance Illustration */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6 shadow-2xl animate-pulse">
                            <WrenchScrewdriverIcon className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    {/* Main Message */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            We'll Be Right Back!
                        </h1>
                        <p className="text-lg text-gray-600 mb-2">
                            WorkWise is currently undergoing scheduled maintenance to improve your experience.
                        </p>
                        <p className="text-sm text-gray-500">
                            We apologize for any inconvenience and appreciate your patience.
                        </p>
                    </div>

                    {/* Custom Message */}
                    {message && (
                        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-blue-800 font-medium">{message}</p>
                        </div>
                    )}

                    {/* Status Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Estimated Time */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-center mb-3">
                                <ClockIcon className="w-8 h-8 text-indigo-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Estimated Time</h3>
                            </div>
                            <p className="text-2xl font-bold text-indigo-600 mb-2">{estimatedTime}</p>
                            <p className="text-sm text-gray-500">Until we're back online</p>
                        </div>

                        {/* Current Time */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-center mb-3">
                                <BellIcon className="w-8 h-8 text-purple-500 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Current Time</h3>
                            </div>
                            <p className="text-2xl font-bold text-purple-600 mb-2">
                                {currentTime.toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                {currentTime.toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* What's Being Updated */}
                    <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What We're Working On</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Performance Improvements</p>
                                    <p className="text-xs text-gray-500">Faster loading times</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Security Updates</p>
                                    <p className="text-xs text-gray-500">Enhanced protection</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New Features</p>
                                    <p className="text-xs text-gray-500">Exciting improvements</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Bug Fixes</p>
                                    <p className="text-xs text-gray-500">Smoother experience</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mb-8">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />
                            Check Again
                        </button>
                    </div>

                    {/* Stay Connected */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Stay Connected</h4>
                        <p className="text-gray-600 mb-4">
                            Follow us for real-time updates on our maintenance progress
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a
                                href="https://twitter.com/workwise"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                            >
                                Twitter Updates
                            </a>
                            <a
                                href="https://facebook.com/workwise"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                            >
                                Facebook
                            </a>
                            <a
                                href="mailto:support@workwise.com"
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                            >
                                Email Support
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    {lastUpdated && (
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">
                                Last updated: {new Date(lastUpdated).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}