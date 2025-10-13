import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BriefcaseIcon,
    CurrencyDollarIcon,
    UserIcon,
    ChartBarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    EyeIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    BanknotesIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard({ auth, stats, activeContracts, jobInvites, earningsSummary, aiRecommendations, recentActivity }) {
    const { user } = auth;
    const isGigWorker = user.user_type === 'gig_worker';
    const isEmployer = user.user_type === 'employer';

    // Enhanced StatCard component with better styling and trends
    const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, trendValue, subtitle, onClick }) => {
        const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            yellow: 'from-yellow-500 to-yellow-600',
            purple: 'from-purple-500 to-purple-600',
            indigo: 'from-indigo-500 to-indigo-600',
            red: 'from-red-500 to-red-600',
            orange: 'from-orange-500 to-orange-600'
        };

        return (
            <div 
                className={`bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
                onClick={onClick}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
                                <div className="text-2xl font-bold text-gray-900">{value}</div>
                                {subtitle && (
                                    <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
                                )}
                            </div>
                        </div>
                        {trend && (
                            <div className={`flex items-center text-sm font-medium ${
                                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                                {trend === 'up' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
                                {trend === 'down' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
                                {trendValue}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Format currency for Philippine Peso
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Enhanced Gig Worker Stats Overview
    const renderGigWorkerStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Active Bids"
                value={stats?.activeBids || 0}
                icon={ClipboardDocumentListIcon}
                color="blue"
                trend={stats?.bidsTrend}
                trendValue={stats?.bidsTrendValue}
                subtitle="Pending proposals"
            />
            <StatCard
                title="Active Contracts"
                value={stats?.activeContracts || 0}
                icon={BriefcaseIcon}
                color="green"
                trend={stats?.contractsTrend}
                trendValue={stats?.contractsTrendValue}
                subtitle="Ongoing projects"
            />
            <StatCard
                title="Total Earnings"
                value={formatCurrency(stats?.totalEarnings)}
                icon={CurrencyDollarIcon}
                color="yellow"
                trend={stats?.earningsTrend}
                trendValue={stats?.earningsTrendValue}
                subtitle="All-time income"
            />
            <StatCard
                title="Success Rate"
                value={`${stats?.successRate || 0}%`}
                icon={TrophyIcon}
                color="purple"
                trend={stats?.successRateTrend}
                trendValue={stats?.successRateTrendValue}
                subtitle="Bid acceptance rate"
            />
        </div>
    );

    // Active Contracts Section for Gig Workers
    const renderActiveContracts = () => (
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Active Contracts
                    </h3>
                    <Link 
                        href="/projects" 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View All
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {activeContracts && activeContracts.length > 0 ? (
                    <div className="space-y-4">
                        {activeContracts.slice(0, 3).map((contract, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{contract.jobTitle}</h4>
                                    <p className="text-sm text-gray-600">Client: {contract.clientName}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm text-green-600 font-medium">
                                            {formatCurrency(contract.agreedAmount)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Progress: {contract.progressPercentage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                                        contract.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {contract.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Started {formatDistanceToNow(new Date(contract.startedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No active contracts at the moment</p>
                        <Link 
                            href="/jobs" 
                            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    // Job Invites Section for Gig Workers
    const renderJobInvites = () => (
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-500" />
                        Job Invitations
                    </h3>
                    <Link 
                        href="/invitations" 
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                        View All
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {jobInvites && jobInvites.length > 0 ? (
                    <div className="space-y-4">
                        {jobInvites.slice(0, 3).map((invite, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{invite.jobTitle}</h4>
                                    <p className="text-sm text-gray-600">From: {invite.employerName}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm text-purple-600 font-medium">
                                            Budget: {formatCurrency(invite.budgetMin)} - {formatCurrency(invite.budgetMax)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {invite.estimatedDuration} days
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex space-x-2">
                                        <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                                            Accept
                                        </button>
                                        <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                                            Decline
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Received {formatDistanceToNow(new Date(invite.receivedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending job invitations</p>
                        <p className="text-sm text-gray-400 mt-2">Complete your profile to receive more invitations</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Earnings Summary Section for Gig Workers
    const renderEarningsSummary = () => (
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BanknotesIcon className="w-5 h-5 mr-2 text-green-500" />
                        Earnings Summary
                    </h3>
                    <Link 
                        href="/earnings" 
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                        View Details
                    </Link>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(earningsSummary?.thisMonth)}</div>
                        <div className="text-sm text-gray-500">This Month</div>
                        <div className={`text-xs mt-1 ${earningsSummary?.monthlyTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {earningsSummary?.monthlyTrend === 'up' ? '↗' : '↘'} {earningsSummary?.monthlyChange}%
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(earningsSummary?.lastMonth)}</div>
                        <div className="text-sm text-gray-500">Last Month</div>
                        <div className="text-xs text-gray-400 mt-1">Previous period</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(earningsSummary?.pending)}</div>
                        <div className="text-sm text-gray-500">Pending</div>
                        <div className="text-xs text-orange-600 mt-1">In escrow</div>
                    </div>
                </div>
                
                {earningsSummary?.recentPayments && earningsSummary.recentPayments.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Payments</h4>
                        <div className="space-y-2">
                            {earningsSummary.recentPayments.slice(0, 3).map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{payment.projectTitle}</p>
                                        <p className="text-xs text-gray-500">{payment.clientName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(payment.paidAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // AI Job Recommendations Section for Gig Workers
    const renderAIRecommendations = () => (
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-indigo-500" />
                        AI Job Recommendations
                    </h3>
                    <Link 
                        href="/ai/recommendations" 
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        View All
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {aiRecommendations && aiRecommendations.length > 0 ? (
                    <div className="space-y-4">
                        {aiRecommendations.slice(0, 3).map((job, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                                        <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                            {job.matchScore}% match
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{job.description.substring(0, 100)}...</p>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-indigo-600 font-medium">
                                            {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {job.estimatedDuration} days
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {job.requiredSkills.slice(0, 2).map((skill, skillIndex) => (
                                                <span key={skillIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Link 
                                        href={`/jobs/${job.id}`}
                                        className="inline-flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                    >
                                        View Job
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No AI recommendations available</p>
                        <p className="text-sm text-gray-400 mt-2">Complete your profile and skills to get personalized job recommendations</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Dashboard
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Welcome back, {user.name}!
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="px-8 py-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">
                                        {isGigWorker ? 'Welcome back, Freelancer!' : 'Welcome back, Employer!'}
                                    </h1>
                                    <p className="text-blue-100">
                                        {isGigWorker 
                                            ? 'Ready to take on new challenges and grow your career?' 
                                            : 'Ready to find the perfect talent for your projects?'
                                        }
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                        {isGigWorker ? (
                                            <UserGroupIcon className="w-10 h-10 text-white" />
                                        ) : (
                                            <BriefcaseIcon className="w-10 h-10 text-white" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Stats Section for Gig Workers */}
                    {isGigWorker && (
                        <>
                            {renderGigWorkerStats()}
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {renderActiveContracts()}
                                {renderJobInvites()}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {renderEarningsSummary()}
                                {renderAIRecommendations()}
                            </div>
                        </>
                    )}

                    {/* Employer Stats Section */}
                    {isEmployer && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Active Jobs"
                                value={stats?.activeJobs || 0}
                                icon={BriefcaseIcon}
                                color="blue"
                                trend={stats?.jobsTrend}
                                trendValue={stats?.jobsTrendValue}
                                subtitle="Currently hiring"
                            />
                            <StatCard
                                title="Total Hired"
                                value={stats?.totalHired || 0}
                                icon={UserGroupIcon}
                                color="green"
                                trend={stats?.hiredTrend}
                                trendValue={stats?.hiredTrendValue}
                                subtitle="Freelancers hired"
                            />
                            <StatCard
                                title="Total Spent"
                                value={formatCurrency(stats?.totalSpent)}
                                icon={CurrencyDollarIcon}
                                color="yellow"
                                trend={stats?.spentTrend}
                                trendValue={stats?.spentTrendValue}
                                subtitle="Project investments"
                            />
                            <StatCard
                                title="Satisfaction Rate"
                                value={`${stats?.satisfactionRate || 0}%`}
                                icon={StarIcon}
                                color="purple"
                                trend={stats?.satisfactionTrend}
                                trendValue={stats?.satisfactionTrendValue}
                                subtitle="Client satisfaction"
                            />
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {isGigWorker ? (
                                    <>
                                        <Link
                                            href="/jobs"
                                            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                                        >
                                            <BriefcaseIcon className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">Browse Jobs</span>
                                        </Link>
                                        <Link
                                            href="/ai/recommendations"
                                            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                                        >
                                            <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">AI Recommendations</span>
                                        </Link>
                                        <Link
                                            href="/proposals"
                                            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                                        >
                                            <ClipboardDocumentListIcon className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">My Proposals</span>
                                        </Link>
                                        <Link
                                            href="/wallet"
                                            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
                                        >
                                            <CurrencyDollarIcon className="w-8 h-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">Wallet</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/jobs/create"
                                            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                                        >
                                            <BriefcaseIcon className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">Post Job</span>
                                        </Link>
                                        <Link
                                            href="/freelancers"
                                            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                                        >
                                            <UserGroupIcon className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">Find Talent</span>
                                        </Link>
                                        <Link
                                            href="/projects"
                                            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                                        >
                                            <ClipboardDocumentListIcon className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">Manage Projects</span>
                                        </Link>
                                        <Link
                                            href="/analytics"
                                            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
                                        >
                                            <ChartBarIcon className="w-8 h-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">Analytics</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="p-6">
                            {recentActivity && recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivity.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                activity.type === 'bid_submitted' ? 'bg-blue-100' :
                                                activity.type === 'project_completed' ? 'bg-green-100' :
                                                activity.type === 'payment_received' ? 'bg-yellow-100' :
                                                activity.type === 'job_posted' ? 'bg-purple-100' :
                                                'bg-gray-100'
                                            }`}>
                                                {activity.type === 'bid_submitted' && <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />}
                                                {activity.type === 'project_completed' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                                                {activity.type === 'payment_received' && <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />}
                                                {activity.type === 'job_posted' && <BriefcaseIcon className="w-5 h-5 text-purple-600" />}
                                                {!['bid_submitted', 'project_completed', 'payment_received', 'job_posted'].includes(activity.type) && 
                                                    <ClockIcon className="w-5 h-5 text-gray-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                <p className="text-xs text-gray-500">{activity.time}</p>
                                            </div>
                                            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                activity.status === 'success' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {activity.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No recent activity</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {isGigWorker ? 'Start bidding on projects to see activity here' : 'Post your first job to see activity here'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
