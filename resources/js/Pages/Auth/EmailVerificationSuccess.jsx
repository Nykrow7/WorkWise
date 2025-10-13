import { Head, Link } from '@inertiajs/react';
import { CheckCircleIcon, ArrowRightIcon, UserCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { usePage } from '@inertiajs/react';

export default function EmailVerificationSuccess() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isFreelancer = user?.user_type === 'gig_worker';
    const isEmployer = user?.user_type === 'employer';

    return (
        <>
            <Head title="Email Verified Successfully - WorkWise" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative max-w-2xl w-full text-center">
                    {/* Success Icon */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-2xl">
                            <CheckCircleIcon className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Email Verified Successfully!
                        </h1>
                        <p className="text-lg text-gray-600 mb-2">
                            Welcome to WorkWise, {user?.first_name || 'there'}! Your email has been verified.
                        </p>
                        <p className="text-sm text-gray-500">
                            You now have full access to all WorkWise features and can start {isFreelancer ? 'finding great projects' : isEmployer ? 'posting jobs and finding talent' : 'exploring opportunities'}.
                        </p>
                    </div>

                    {/* Account Status */}
                    <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">Account Status: Verified</h3>
                                <p className="text-sm text-gray-500">
                                    {user?.email} • {isFreelancer ? 'Freelancer' : isEmployer ? 'Employer' : 'User'} Account
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div className="text-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Email Verified</p>
                            </div>
                            <div className="text-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <UserCircleIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Profile Active</p>
                            </div>
                            <div className="text-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <BriefcaseIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Ready to Start</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
                        
                        {isFreelancer && (
                            <div className="space-y-4">
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-blue-600 text-sm font-bold">1</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Complete Your Profile</p>
                                        <p className="text-xs text-gray-500">Add your skills, experience, and portfolio</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-green-600 text-sm font-bold">2</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Browse Available Jobs</p>
                                        <p className="text-xs text-gray-500">Find projects that match your skills</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-purple-600 text-sm font-bold">3</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Submit Your First Proposal</p>
                                        <p className="text-xs text-gray-500">Start building your reputation</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isEmployer && (
                            <div className="space-y-4">
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-blue-600 text-sm font-bold">1</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Set Up Your Company Profile</p>
                                        <p className="text-xs text-gray-500">Add company details and preferences</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-green-600 text-sm font-bold">2</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Post Your First Job</p>
                                        <p className="text-xs text-gray-500">Describe your project requirements</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-purple-600 text-sm font-bold">3</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Review Proposals</p>
                                        <p className="text-xs text-gray-500">Find the perfect freelancer for your project</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isFreelancer && !isEmployer && (
                            <div className="space-y-4">
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-blue-600 text-sm font-bold">1</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Complete Your Profile</p>
                                        <p className="text-xs text-gray-500">Add your information and preferences</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-left">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-green-600 text-sm font-bold">2</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Explore the Platform</p>
                                        <p className="text-xs text-gray-500">Discover all available features</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Go to Dashboard
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </Link>
                        
                        <Link
                            href="/profile/edit"
                            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <UserCircleIcon className="w-5 h-5 mr-2" />
                            Complete Profile
                        </Link>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Need Help Getting Started?</h4>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Link
                                href="/help"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                            >
                                Help Center
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}