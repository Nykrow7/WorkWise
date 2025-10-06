import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    if (!user) {
        return <div>Loading...</div>; // Or some other placeholder
    }

    const isGigWorker = user.user_type === 'gig_worker';
    const isEmployer = user.user_type === 'employer';

    const formatAmount = (value) => {
        const number = Number(value ?? 0);
        return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Welcome to WorkWise, {user.name}!
                </h2>
            }
        >
            <Head title="Dashboard" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="overflow-hidden bg-white/70 backdrop-blur-sm shadow-lg sm:rounded-xl mb-8 border border-gray-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        {isGigWorker ? 'Find Your Next Gig' : 'Manage Your Projects'}
                                    </h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {isGigWorker
                                            ? 'Browse available jobs and submit bids to grow your gig work career.'
                                            : 'Post jobs and find talented gig workers for your projects.'
                                        }
                                    </p>
                                </div>
                                <div className="flex space-x-4">
                                    <Link
                                        href={route('jobs.index')}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        Browse Jobs
                                    </Link>
                                    {isEmployer && (
                                        <Link
                                            href={route('jobs.create')}
                                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                        >
                                            Post a Job
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-8">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <div className="text-sm font-medium text-blue-600 mb-1">
                                            {isGigWorker ? 'Active Bids' : 'Active Jobs'}
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900">0</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-700">
                            <div className="p-8">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <div className="text-sm font-medium text-blue-600 mb-1">Escrow Balance</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            ₱{user.escrow_balance ? formatAmount(user.escrow_balance) : '0.00'}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            <Link href={route('deposits.index')} className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300">
                                                View wallet →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-8">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <div className="text-sm font-medium text-blue-600 mb-1">Profile Type</div>
                                        <div className="text-3xl font-bold text-gray-900 capitalize">
                                            {user.user_type}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Link
                                    href={route('jobs.index')}
                                    className="p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Browse Jobs</h4>
                                        <p className="text-sm text-gray-600">Find new opportunities</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('bids.index')}
                                    className="p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {isGigWorker ? 'My Bids' : 'Manage Bids'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {isGigWorker ? 'Track your proposals' : 'Review proposals'}
                                        </p>
                                    </div>
                                </Link>

                                {isEmployer && (
                                    <Link
                                        href={route('jobs.create')}
                                        className="p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                    >
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                                                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                                                </svg>
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Post a Job</h4>
                                            <p className="text-sm text-gray-600">Find gig workers</p>
                                        </div>
                                    </Link>
                                )}

                                <Link
                                    href={route('profile.edit')}
                                    className="p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Edit Profile</h4>
                                        <p className="text-sm text-gray-600">Update your info</p>
                                    </div>
                                </Link>
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
