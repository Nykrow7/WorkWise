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
    TrophyIcon,
    ClipboardDocumentListIcon,
    UserGroupIcon,
    StarIcon,
    PlusIcon,
    FireIcon,
    LightBulbIcon,
    GiftIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function GigWorkerDashboard({ auth, stats, activeContracts, jobInvites, earningsSummary, aiRecommendations, recentActivity, skillsProgress, upcomingDeadlines }) {
    const { user } = auth;

    // Enhanced StatCard component with better styling and trends
    const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, trendValue, subtitle, onClick }) => {
        const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            yellow: 'from-yellow-500 to-yellow-600',
            purple: 'from-purple-500 to-purple-600',
            indigo: 'from-indigo-500 to-indigo-600',
            red: 'from-red-500 to-red-600',
            orange: 'from-orange-500 to-orange-600',
            emerald: 'from-emerald-500 to-emerald-600',
            pink: 'from-pink-500 to-pink-600'
        };

        return (
            <div 
                className={`bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
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
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Active Contracts
                    </h3>
                    <Link 
                        href="/projects" 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                        View All
                        <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {activeContracts && activeContracts.length > 0 ? (
                    <div className="space-y-4">
                        {activeContracts.slice(0, 3).map((contract, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-gray-100 hover:to-blue-100 transition-all duration-300 border border-gray-100">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{contract.title || contract.jobTitle}</h4>
                                    <p className="text-sm text-gray-600">Client: {contract.client || contract.clientName}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm text-green-600 font-medium">
                                            {formatCurrency((contract?.agreedAmount ?? contract?.amount ?? 0))}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Progress: {(contract?.progressPercentage ?? contract?.progress ?? 0)}%
                                        </span>
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${contract?.progressPercentage ?? contract?.progress ?? 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                                        contract.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {contract.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Started {formatDistanceToNow(new Date(contract?.startedAt ?? contract?.started_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No active contracts at the moment</p>
                        <p className="text-gray-400 text-sm mt-2">Start bidding on projects to build your portfolio</p>
                        <Link 
                            href="/jobs" 
                            className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    // Job Invites Section for Gig Workers
    const renderJobInvites = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-500" />
                        Job Invitations
                        {jobInvites && jobInvites.length > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                {jobInvites.length}
                            </span>
                        )}
                    </h3>
                    <Link 
                        href="/invitations" 
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                    >
                        View All
                        <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {jobInvites && jobInvites.length > 0 ? (
                    <div className="space-y-4">
                        {jobInvites.slice(0, 3).map((invite, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-100">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="font-medium text-gray-900">{invite.title || invite.jobTitle}</h4>
                                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                            Invited
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">From: {invite.employerName}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm text-purple-600 font-medium">
                                            Budget: {invite?.budget ?? `${formatCurrency(invite?.budgetMin ?? 0)} - ${formatCurrency(invite?.budgetMax ?? 0)}`}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {invite?.estimatedDuration ? `${invite.estimatedDuration} days` : 'Duration N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex space-x-2 mb-2">
                                        <button className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                            Accept
                                        </button>
                                        <button className="px-4 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm">
                                            Decline
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Received {formatDistanceToNow(new Date(invite?.receivedAt ?? invite?.posted_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No pending job invitations</p>
                        <p className="text-gray-400 text-sm mt-2">Complete your profile to receive more invitations</p>
                        <Link 
                            href="/profile" 
                            className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <UserIcon className="w-5 h-5 mr-2" />
                            Complete Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    // Earnings Summary Section for Gig Workers
    const renderEarningsSummary = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BanknotesIcon className="w-5 h-5 mr-2 text-green-500" />
                        Earnings Summary
                    </h3>
                    <Link 
                        href="/earnings" 
                        className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
                    >
                        View Details
                        <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
                    </Link>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="text-3xl font-bold text-gray-900">{formatCurrency(earningsSummary?.thisMonth)}</div>
                        <div className="text-sm text-gray-500 mt-1">This Month</div>
                        <div className={`text-xs mt-2 flex items-center justify-center ${earningsSummary?.monthlyTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {earningsSummary?.monthlyTrend === 'up' ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                            {earningsSummary?.monthlyChange}%
                        </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="text-3xl font-bold text-gray-900">{formatCurrency(earningsSummary?.lastMonth)}</div>
                        <div className="text-sm text-gray-500 mt-1">Last Month</div>
                        <div className="text-xs text-gray-400 mt-2">Previous period</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                        <div className="text-3xl font-bold text-gray-900">{formatCurrency(earningsSummary?.pending)}</div>
                        <div className="text-sm text-gray-500 mt-1">Pending</div>
                        <div className="text-xs text-orange-600 mt-2 flex items-center justify-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            In escrow
                        </div>
                    </div>
                </div>
                
                {earningsSummary?.recentPayments && earningsSummary.recentPayments.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                            Recent Payments
                        </h4>
                        <div className="space-y-3">
                            {earningsSummary.recentPayments.slice(0, 3).map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-gray-100">
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
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-indigo-500" />
                        AI Job Recommendations
                        <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                            Smart Match
                        </span>
                    </h3>
                    <Link 
                        href="/ai/recommendations" 
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                    >
                        View All
                        <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {aiRecommendations && aiRecommendations.length > 0 ? (
                    <div className="space-y-4">
                        {aiRecommendations.slice(0, 3).map((job, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 border border-indigo-100">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                                        <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full flex items-center">
                                            <FireIcon className="w-3 h-3 mr-1" />
                                            {job.matchScore}% match
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{job.description.substring(0, 100)}...</p>
                                    <div className="flex items-center space-x-4 mb-2">
                                        <span className="text-sm text-indigo-600 font-medium">
                                            {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center">
                                            <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                            {job.estimatedDuration} days
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {job.requiredSkills.slice(0, 3).map((skill, skillIndex) => (
                                            <span key={skillIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                        {job.requiredSkills.length > 3 && (
                                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                                                +{job.requiredSkills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Link 
                                        href={`/jobs/${job.id}`}
                                        className="inline-flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm mb-2"
                                    >
                                        <EyeIcon className="w-4 h-4 mr-1" />
                                        View Job
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                        Posted {formatDistanceToNow(new Date(job?.postedAt ?? job?.posted_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <ArrowTrendingUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No AI recommendations available</p>
                        <p className="text-gray-400 text-sm mt-2">Complete your profile and skills to get personalized job recommendations</p>
                        <Link 
                            href="/profile/skills" 
                            className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <LightBulbIcon className="w-5 h-5 mr-2" />
                            Add Skills
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    // Skills Progress Section
    const renderSkillsProgress = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
                        Skills & Progress
                    </h3>
                    <Link 
                        href="/profile/skills" 
                        className="text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center"
                    >
                        Manage Skills
                        <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {skillsProgress && skillsProgress.length > 0 ? (
                    <div className="space-y-4">
                        {skillsProgress.slice(0, 4).map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                                        <span className="text-sm text-gray-600">{skill.level}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${skill.level}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{skill.projectsCompleted} projects completed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No skills added yet</p>
                        <Link 
                            href="/profile/skills" 
                            className="inline-flex items-center mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Add Skills
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    // Upcoming Deadlines Section
    const renderUpcomingDeadlines = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2 text-red-500" />
                        Upcoming Deadlines
                        {upcomingDeadlines && upcomingDeadlines.length > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                {upcomingDeadlines.length}
                            </span>
                        )}
                    </h3>
                    <Link 
                        href="/projects" 
                        className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                    >
                        View All
                        <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
                    </Link>
                </div>
            </div>
            <div className="p-6">
                {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{deadline.projectTitle}</h4>
                                    <p className="text-sm text-gray-600">Client: {deadline.clientName}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm text-red-600 font-medium flex items-center">
                                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                            Due in {deadline.daysLeft} days
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {deadline.completionPercentage}% complete
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Link 
                                        href={`/projects/${deadline.id}`}
                                        className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                        Work Now
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-gray-500">No upcoming deadlines</p>
                        <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
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
                        Gig Worker Dashboard
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Welcome back, {auth?.user?.name || 'Freelancer'}!
                        </span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Gig Worker Dashboard" />

            <div className="py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Enhanced Welcome Banner */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="px-8 py-6 text-white relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                                        <GiftIcon className="w-8 h-8 mr-3" />
                                        Welcome back, Freelancer!
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        Ready to take on new challenges and grow your career?
                                    </p>
                                    <div className="flex items-center mt-4 space-x-6">
                                        <div className="flex items-center">
                                            <StarIcon className="w-5 h-5 mr-2 text-yellow-300" />
                                            <span className="text-sm">Rating: {stats?.rating || '5.0'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <TrophyIcon className="w-5 h-5 mr-2 text-yellow-300" />
                                            <span className="text-sm">Level: {stats?.level || 'Professional'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <UserGroupIcon className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                        </div>
                    </div>

                    {/* Enhanced Stats Section */}
                    {renderGigWorkerStats()}
                    
                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {renderActiveContracts()}
                        {renderJobInvites()}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {renderEarningsSummary()}
                        {renderAIRecommendations()}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {renderSkillsProgress()}
                        {renderUpcomingDeadlines()}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                                Quick Actions
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link
                                    href="/jobs"
                                    className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group border border-blue-200"
                                >
                                    <BriefcaseIcon className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">Browse Jobs</span>
                                    <span className="text-xs text-gray-500 mt-1">Find new opportunities</span>
                                </Link>
                                <Link
                                    href="/ai/recommendations"
                                    className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group border border-purple-200"
                                >
                                    <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">AI Recommendations</span>
                                    <span className="text-xs text-gray-500 mt-1">Smart job matches</span>
                                </Link>
                                <Link
                                    href="/proposals"
                                    className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 group border border-green-200"
                                >
                                    <ClipboardDocumentListIcon className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">My Proposals</span>
                                    <span className="text-xs text-gray-500 mt-1">Track submissions</span>
                                </Link>
                                <Link
                                    href="/wallet"
                                    className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 group border border-yellow-200"
                                >
                                    <CurrencyDollarIcon className="w-8 h-8 text-yellow-600 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">Wallet</span>
                                    <span className="text-xs text-gray-500 mt-1">Manage earnings</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="p-6">
                            {recentActivity && recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivity.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-gray-100 hover:to-blue-100 transition-all duration-300 border border-gray-100">
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
                                            <div className={`px-3 py-1 text-xs font-medium rounded-full ${
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
                                <div className="text-center py-12">
                                    <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-medium">No recent activity</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Start bidding on projects to see activity here
                                    </p>
                                    <Link 
                                        href="/jobs" 
                                        className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        Start Browsing
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}