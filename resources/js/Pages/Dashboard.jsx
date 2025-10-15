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
    SparklesIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard({ auth, stats, activeContracts, jobInvites, earningsSummary, aiRecommendations, recentActivity }) {
    const { user } = auth;
    const isGigWorker = user.user_type === 'gig_worker';
    const isEmployer = user.user_type === 'employer';

    // Enhanced StatCard component with precise hover effects and visual enhancements
    const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, trendValue, subtitle, onClick }) => {
        const colorClasses = {
            blue: 'bg-blue-500 hover:bg-blue-600',
            green: 'bg-green-500 hover:bg-green-600',
            yellow: 'bg-yellow-500 hover:bg-yellow-600',
            purple: 'bg-purple-500 hover:bg-purple-600',
            indigo: 'bg-indigo-500 hover:bg-indigo-600',
            red: 'bg-red-500 hover:bg-red-600',
            orange: 'bg-orange-500 hover:bg-orange-600',
            teal: 'bg-teal-500 hover:bg-teal-600'
        };

        const hoverEffects = {
            blue: 'hover:shadow-blue-200/50',
            green: 'hover:shadow-green-200/50',
            yellow: 'hover:shadow-yellow-200/50',
            purple: 'hover:shadow-purple-200/50',
            indigo: 'hover:shadow-indigo-200/50',
            red: 'hover:shadow-red-200/50',
            orange: 'hover:shadow-orange-200/50',
            teal: 'hover:shadow-teal-200/50'
        };

        return (
            <div 
                className={`bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200/60 h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${hoverEffects[color]} hover:border-gray-300/80 ${onClick ? 'cursor-pointer' : ''} group`}
                onClick={onClick}
            >
                <div className="p-4 lg:p-6 relative">
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    
                    <div className="flex items-start h-full relative z-10">
                        <div className="flex-shrink-0">
                            <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                <Icon className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        </div>
                        <div className="ml-4 lg:ml-5 flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-600 break-words leading-tight tracking-wide uppercase">{title}</div>
                            <div className="text-2xl lg:text-3xl font-bold text-gray-900 break-words leading-tight mt-2 transition-colors duration-300 group-hover:text-gray-800">{value}</div>
                            <div className="flex items-start mt-3">
                                {subtitle && (
                                    <div className="text-sm text-gray-500 break-words flex-1 leading-relaxed font-medium">{subtitle}</div>
                                )}
                                {trend && trendValue && (
                                    <div className={`ml-2 flex items-center text-sm font-semibold px-2 py-1 rounded-full transition-all duration-300 ${
                                        trend === 'up' ? 'text-green-700 bg-green-100 hover:bg-green-200' : 
                                        trend === 'down' ? 'text-red-700 bg-red-100 hover:bg-red-200' : 
                                        'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                    } flex-shrink-0`}>
                                        {trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />}
                                        {trend === 'down' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
                                        {trend === 'stable' && <span className="mr-1">→</span>}
                                        {trendValue}
                                    </div>
                                )}
                            </div>
                        </div>
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

    // Enhanced Gig Worker Stats Overview with improved layout
    const renderGigWorkerStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8" data-observer-target>
            <StatCard
                title="Active Bids"
                value={stats?.activeBids || 0}
                icon={DocumentTextIcon}
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

    // Active Contracts Section for Gig Workers with enhanced styling and hover effects
    const renderActiveContracts = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200/60 mb-6 lg:mb-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-200/30 hover:border-blue-300/50 group" data-observer-target>
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center tracking-wide transition-colors duration-300 group-hover:text-blue-900">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <BriefcaseIcon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        Active Contracts
                    </h3>
                    <Link 
                        href="/projects" 
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300 hover:scale-105"
                    >
                        View All
                    </Link>
                </div>
            </div>
            <div className="p-4 lg:p-6 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg"></div>
                
                {activeContracts && activeContracts.length > 0 ? (
                    <div className="space-y-4 relative z-10">
                        {activeContracts.slice(0, 3).map((contract, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl hover:bg-blue-50/80 transition-all duration-300 border border-gray-200/60 hover:border-blue-200/80 hover:shadow-md hover:scale-[1.01] cursor-pointer group/item">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 break-words transition-colors duration-300 group-hover/item:text-blue-900">{contract.jobTitle}</h4>
                                    <p className="text-sm text-gray-600 break-words font-medium transition-colors duration-300 group-hover/item:text-blue-600">Client: {contract.clientName}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm text-green-600 font-bold transition-colors duration-300 group-hover/item:text-green-700">
                                            {formatCurrency(contract.agreedAmount)}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium transition-colors duration-300 group-hover/item:text-gray-600">
                                            Progress: {contract.progressPercentage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                                        contract.status === 'active' ? 'bg-green-100 text-green-800 group-hover/item:bg-green-200' :
                                        contract.status === 'in_progress' ? 'bg-blue-100 text-blue-800 group-hover/item:bg-blue-200' :
                                        'bg-gray-100 text-gray-800 group-hover/item:bg-gray-200'
                                    }`}>
                                        {contract.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1 font-medium transition-colors duration-300 group-hover/item:text-gray-600">
                                        Started {formatDistanceToNow(new Date(contract.startedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 relative z-10">
                        <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 transition-all duration-300 group-hover:text-blue-400 group-hover:scale-110" />
                        <p className="text-gray-500 font-medium transition-colors duration-300 group-hover:text-blue-600">No active contracts at the moment</p>
                        <p className="text-sm text-gray-400 mt-2 transition-colors duration-300 group-hover:text-blue-500">Check back later for new opportunities</p>
                        <Link 
                            href="/jobs" 
                            className="inline-flex items-center mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    // Job Invites Section for Gig Workers with enhanced styling and hover effects
    const renderJobInvites = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200/60 mb-6 lg:mb-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-200/30 hover:border-purple-300/50 group" data-observer-target>
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center tracking-wide transition-colors duration-300 group-hover:text-purple-900">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <DocumentTextIcon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        Job Invitations
                    </h3>
                    <Link 
                        href="/invitations" 
                        className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition-all duration-300 hover:scale-105"
                    >
                        View All
                    </Link>
                </div>
            </div>
            <div className="p-4 lg:p-6 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg"></div>
                
                {jobInvites && jobInvites.length > 0 ? (
                    <div className="space-y-4 relative z-10">
                        {jobInvites.slice(0, 3).map((invite, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl hover:bg-purple-50/80 transition-all duration-300 border border-gray-200/60 hover:border-purple-200/80 hover:shadow-md hover:scale-[1.01] cursor-pointer group/item">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 break-words transition-colors duration-300 group-hover/item:text-purple-900">{invite.jobTitle}</h4>
                                    <p className="text-sm text-gray-600 break-words font-medium transition-colors duration-300 group-hover/item:text-purple-600">From: {invite.employerName}</p>
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm text-green-600 font-bold transition-colors duration-300 group-hover/item:text-green-700">
                                            Budget: {formatCurrency(invite.budgetMin)} - {formatCurrency(invite.budgetMax)}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium transition-colors duration-300 group-hover/item:text-gray-600">
                                            {invite.estimatedDuration} days
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex space-x-2 mb-2">
                                        <button className="px-3 py-1 text-xs bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                            Accept
                                        </button>
                                        <button className="px-3 py-1 text-xs bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                            Decline
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium transition-colors duration-300 group-hover/item:text-gray-600">
                                        Received {formatDistanceToNow(new Date(invite.receivedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 relative z-10">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 transition-all duration-300 group-hover:text-purple-400 group-hover:scale-110" />
                        <p className="text-gray-500 font-medium transition-colors duration-300 group-hover:text-purple-600">No pending job invitations</p>
                        <p className="text-sm text-gray-400 mt-2 transition-colors duration-300 group-hover:text-purple-500">Complete your profile to receive more invitations</p>
                        <Link 
                            href="/profile" 
                            className="inline-flex items-center mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Update Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    // Earnings Summary Section for Gig Workers with enhanced styling and hover effects
    const renderEarningsSummary = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200/60 mb-6 lg:mb-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-green-200/30 hover:border-green-300/50 group" data-observer-target>
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center tracking-wide transition-colors duration-300 group-hover:text-green-900">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <BanknotesIcon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        Earnings Summary
                    </h3>
                    <Link 
                        href="/earnings" 
                        className="text-sm text-green-600 hover:text-green-800 font-semibold transition-all duration-300 hover:scale-105"
                    >
                        View Details
                    </Link>
                </div>
            </div>
            <div className="p-4 lg:p-6 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 relative z-10">
                    <div className="text-center bg-gradient-to-br from-green-50/80 to-green-100/60 p-4 rounded-xl border border-green-200/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-green-300/80 group/card">
                        <div className="text-2xl lg:text-3xl font-bold text-green-900 transition-colors duration-300 group-hover/card:text-green-800">{formatCurrency(earningsSummary?.thisMonth)}</div>
                        <div className="text-sm font-semibold text-green-700 uppercase tracking-wide transition-colors duration-300 group-hover/card:text-green-800">This Month</div>
                        <div className={`text-xs mt-2 font-semibold px-2 py-1 rounded-full transition-all duration-300 ${
                            earningsSummary?.monthlyTrend === 'up' ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-red-700 bg-red-100 hover:bg-red-200'
                        }`}>
                            {earningsSummary?.monthlyTrend === 'up' ? '↗' : '↘'} {earningsSummary?.monthlyChange}%
                        </div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-blue-50/80 to-blue-100/60 p-4 rounded-xl border border-blue-200/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300/80 group/card">
                        <div className="text-2xl lg:text-3xl font-bold text-blue-900 transition-colors duration-300 group-hover/card:text-blue-800">{formatCurrency(earningsSummary?.lastMonth)}</div>
                        <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide transition-colors duration-300 group-hover/card:text-blue-800">Last Month</div>
                        <div className="text-xs text-blue-600 mt-2 font-medium transition-colors duration-300 group-hover/card:text-blue-700">Previous period</div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-orange-50/80 to-orange-100/60 p-4 rounded-xl border border-orange-200/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-orange-300/80 group/card">
                        <div className="text-2xl lg:text-3xl font-bold text-orange-900 transition-colors duration-300 group-hover/card:text-orange-800">{formatCurrency(earningsSummary?.pending)}</div>
                        <div className="text-sm font-semibold text-orange-700 uppercase tracking-wide transition-colors duration-300 group-hover/card:text-orange-800">Pending</div>
                        <div className="text-xs text-orange-600 mt-2 font-semibold px-2 py-1 bg-orange-100 rounded-full transition-all duration-300 group-hover/card:bg-orange-200">In escrow</div>
                    </div>
                </div>
                
                {earningsSummary?.recentPayments && earningsSummary.recentPayments.length > 0 && (
                    <div className="relative z-10">
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Recent Payments</h4>
                        <div className="space-y-3">
                            {earningsSummary.recentPayments.slice(0, 3).map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/60 hover:bg-green-50/80 hover:border-green-200/80 hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer group/item">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 break-words transition-colors duration-300 group-hover/item:text-green-900">{payment.projectTitle}</p>
                                        <p className="text-xs text-gray-600 break-words font-medium transition-colors duration-300 group-hover/item:text-green-600">{payment.clientName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600 transition-colors duration-300 group-hover/item:text-green-700">{formatCurrency(payment.amount)}</p>
                                        <p className="text-xs text-gray-500 font-medium transition-colors duration-300 group-hover/item:text-gray-600">{formatDistanceToNow(new Date(payment.paidAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // AI Job Recommendations Section for Gig Workers with enhanced styling and hover effects
    const renderAIRecommendations = () => (
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200/60 mb-6 lg:mb-8 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-200/30 hover:border-indigo-300/50 group" data-observer-target>
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center tracking-wide transition-colors duration-300 group-hover:text-indigo-900">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <ArrowTrendingUpIcon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        AI Job Recommendations
                    </h3>
                    <Link 
                        href="/ai/recommendations" 
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-all duration-300 hover:scale-105"
                    >
                        View All
                    </Link>
                </div>
            </div>
            <div className="p-4 lg:p-6 relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg"></div>
                
                {aiRecommendations && aiRecommendations.length > 0 ? (
                    <div className="space-y-4 relative z-10">
                        {aiRecommendations.slice(0, 3).map((job, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl hover:bg-indigo-50/80 transition-all duration-300 border border-gray-200/60 hover:border-indigo-200/80 hover:shadow-md hover:scale-[1.01] cursor-pointer group/item">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="font-bold text-gray-900 break-words transition-colors duration-300 group-hover/item:text-indigo-900">{job.title}</h4>
                                        <span className="ml-2 px-3 py-1 text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full font-semibold border border-indigo-200 transition-all duration-300 group-hover/item:from-indigo-200 group-hover/item:to-purple-200">
                                            {job.matchScore}% match
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 break-words font-medium transition-colors duration-300 group-hover/item:text-indigo-600">{job.description.substring(0, 100)}...</p>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-green-600 font-bold transition-colors duration-300 group-hover/item:text-green-700">
                                            {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium transition-colors duration-300 group-hover/item:text-gray-600">
                                            {job.estimatedDuration} days
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {job.requiredSkills.slice(0, 2).map((skill, skillIndex) => (
                                                <span key={skillIndex} className="px-2 py-1 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-semibold border border-gray-200 transition-all duration-300 hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Link 
                                        href={`/jobs/${job.id}`}
                                        className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105 transform hover:-translate-y-0.5 group/btn"
                                    >
                                        <EyeIcon className="w-4 h-4 mr-1 transition-transform duration-300 group-hover/btn:scale-110" />
                                        View Job
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-1 font-medium transition-colors duration-300 group-hover/item:text-gray-600">
                                        Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 relative z-10">
                        <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 transition-all duration-300 group-hover:text-indigo-400 group-hover:scale-110" />
                        <p className="text-gray-500 font-medium transition-colors duration-300 group-hover:text-indigo-600">No AI recommendations available</p>
                        <p className="text-sm text-gray-400 mt-2 transition-colors duration-300 group-hover:text-indigo-500">Complete your profile and skills to get personalized job recommendations</p>
                        <Link 
                            href="/profile" 
                            className="inline-flex items-center mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform hover:-translate-y-0.5 group/btn"
                        >
                            <UserIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover/btn:scale-110" />
                            Update Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold leading-tight">
                                    Welcome back, {auth.user.name}!
                                </h2>
                                <p className="text-indigo-100 mt-1">
                                    Here's what's happening with your gig work today
                                </p>
                            </div>
                            <div className="hidden sm:flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-indigo-100">Profile Completion</p>
                                    <div className="flex items-center mt-1">
                                        <div className="w-24 bg-indigo-200 rounded-full h-2 mr-2">
                                            <div 
                                                className="bg-white h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${profileCompletion}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-white">{profileCompletion}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="px-8 py-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">
                                        {isGigWorker ? 'Welcome back, Gig Worker!' : 'Welcome back, Employer!'}
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
                            <UserIcon className="w-10 h-10 text-white" />
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
                                icon={UserIcon}
                                color="green"
                                trend={stats?.hiredTrend}
                                trendValue={stats?.hiredTrendValue}
                                subtitle="Gig Workers hired"
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
                                icon={TrophyIcon}
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
                                            <DocumentTextIcon className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
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
                                            href="/gig-workers"
                                            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                                        >
                                            <UserIcon className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-gray-900">Find Talent</span>
                                        </Link>
                                        <Link
                                            href="/projects"
                                            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                                        >
                                            <BriefcaseIcon className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
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

                    {/* Recent Activity with enhanced styling and hover effects */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200/60 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-200/30 hover:border-blue-300/50 group" data-observer-target>
                        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 relative">
                            {/* Subtle gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
                            
                            <h3 className="text-lg font-bold text-gray-900 flex items-center tracking-wide transition-colors duration-300 group-hover:text-blue-900 relative z-10">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    <ClockIcon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                Recent Activity
                                <div className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200 transition-all duration-300 group-hover:from-blue-200 group-hover:to-cyan-200">
                                    LIVE
                                </div>
                            </h3>
                        </div>
                        <div className="p-4 lg:p-6 relative">
                            {/* Subtle gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg"></div>
                            
                            {recentActivity && recentActivity.length > 0 ? (
                                <div className="space-y-4 relative z-10">
                                    {recentActivity.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-br from-gray-50/80 to-blue-50/40 backdrop-blur-sm rounded-xl border border-gray-200/60 hover:from-blue-100/80 hover:to-cyan-100/60 hover:border-blue-300/80 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer group/item">
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3 ${
                                                    activity.type === 'bid_submitted' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 border border-blue-300' :
                                                    activity.type === 'project_completed' ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600 border border-green-300' :
                                                    activity.type === 'payment_received' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600 border border-yellow-300' :
                                                    activity.type === 'job_posted' ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 border border-purple-300' :
                                                    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-gray-300'
                                                }`}>
                                                    {activity.type === 'bid_submitted' && <DocumentTextIcon className="w-5 h-5 transition-transform duration-300 group-hover/item:scale-110" />}
                                                    {activity.type === 'project_completed' && <CheckCircleIcon className="w-5 h-5 transition-transform duration-300 group-hover/item:scale-110" />}
                                                    {activity.type === 'payment_received' && <CurrencyDollarIcon className="w-5 h-5 transition-transform duration-300 group-hover/item:scale-110" />}
                                                    {activity.type === 'job_posted' && <BriefcaseIcon className="w-5 h-5 transition-transform duration-300 group-hover/item:scale-110" />}
                                                    {!['bid_submitted', 'project_completed', 'payment_received', 'job_posted'].includes(activity.type) && 
                                                        <ClockIcon className="w-5 h-5 transition-transform duration-300 group-hover/item:scale-110" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 break-words transition-colors duration-300 group-hover/item:text-blue-900 mb-1">{activity.title}</p>
                                                <p className="text-xs text-gray-500 font-medium transition-colors duration-300 group-hover/item:text-blue-600">{activity.time}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-300 hover:scale-105 ${
                                                    activity.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                                                    activity.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300' :
                                                    activity.status === 'success' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                                                    'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
                                                }`}>
                                                    {activity.status}
                                                </div>
                                                <button className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform hover:-translate-y-0.5 group/btn">
                                                    <EyeIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 relative z-10">
                                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 transition-all duration-300 group-hover:text-blue-400 group-hover:scale-110" />
                                    <p className="text-gray-500 font-medium transition-colors duration-300 group-hover:text-blue-600">No recent activity</p>
                                    <p className="text-sm text-gray-400 mt-2 transition-colors duration-300 group-hover:text-blue-500">
                                        {isGigWorker ? 'Start bidding on projects to see activity here' : 'Post your first job to see activity here'}
                                    </p>
                                    <Link 
                                        href={isGigWorker ? "/jobs" : "/jobs/create"} 
                                        className="inline-flex items-center mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform hover:-translate-y-0.5 group/btn"
                                    >
                                        <BriefcaseIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-3" />
                                        {isGigWorker ? 'Browse Jobs' : 'Post a Job'}
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
