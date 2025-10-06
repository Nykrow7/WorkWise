import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BriefcaseIcon,
    UserGroupIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChartBarIcon,
    Squares2X2Icon,
    BellIcon,
    DocumentCheckIcon,
    ChatBubbleLeftIcon,
    ArrowTrendingUpIcon,
    ChevronDownIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function EmployerDashboard({
    jobsSummary,
    proposalsReceived,
    activeContracts,
    notifications,
    analytics,
    activities,
    activityStats,
    stats
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        // Intersection Observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-observer-target]').forEach(el => {
            observer.observe(el);
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    const formatAmount = (value) => {
        const number = Number(value ?? 0);
        return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => {
        const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            purple: 'bg-purple-500',
            teal: 'bg-teal-500'
        };

        return (
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200 h-full">
                <div className="p-4 lg:p-6">
                    <div className="flex items-start h-full">
                        <div className="flex-shrink-0">
                            <div className={`w-10 h-10 ${colorClasses[color]} rounded-full flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                            <div className="text-xs lg:text-sm font-medium text-gray-500 break-words leading-tight">{title}</div>
                            <div className="text-lg lg:text-xl font-bold text-gray-900 break-words leading-tight mt-1">{value}</div>
                            {subtitle && (
                                <div className="text-xs text-gray-500 mt-2 break-words leading-relaxed">{subtitle}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const JobCard = ({ job }) => (
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 break-words">{job.title}</h4>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <EyeIcon className="w-4 h-4 mr-1" />
                                {job.bids_count} bids
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                job.status === 'open' ? 'bg-green-100 text-green-800' :
                                job.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {job.status}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                            {job.budget_type === 'fixed' ?
                                `₱${formatAmount(job.budget_min)}` :
                                `₱${formatAmount(job.budget_min)} - ₱${formatAmount(job.budget_max)}`
                            }
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(job.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProposalCard = ({ proposal }) => (
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 break-words">{proposal.gig_worker_name}</h4>
                        <p className="text-sm text-gray-600 mt-1 break-words">for "{proposal.job_title}"</p>
                        <p className="text-sm text-gray-500 mt-2 break-words">{proposal.proposal_message}</p>
                        <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                ₱{formatAmount(proposal.bid_amount)}
                            </span>
                            <span className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {proposal.estimated_days} days
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                            {new Date(proposal.submitted_at).toLocaleDateString()}
                        </div>
                        <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {proposal.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ContractCard = ({ contract }) => (
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 break-words">{contract.job_title}</h4>
                        <p className="text-sm text-gray-600 mt-1 break-words">with {contract.gig_worker_name}</p>
                        <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                ₱{formatAmount(contract.agreed_amount)}
                            </span>
                            <span className="flex items-center">
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                {contract.progress_percentage}% complete
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${contract.progress_percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                            {new Date(contract.started_at).toLocaleDateString()}
                        </div>
                        <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                contract.status === 'active' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {contract.status}
                            </span>
                        </div>
                        <div className="mt-3 space-x-2">
                            <Link
                                href={`/contracts/${contract.id}`}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                                <DocumentCheckIcon className="w-3 h-3 mr-1" />
                                View
                            </Link>
                            <Link
                                href={`/messages/${contract.gig_worker_id}`}
                                className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                                <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                                Message
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const NotificationCard = ({ notification }) => (
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center">
                            <h4 className="font-medium text-gray-900 break-words">{notification.title}</h4>
                            {!notification.is_read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full ml-2 flex-shrink-0"></div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 break-words">{notification.message}</p>
                        <div className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="text-right">
                        <Link
                            href={notification.action_url}
                            className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            View
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const EscrowAlertCard = ({ alert }) => (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-yellow-800">{alert.title}</h4>
                    <p className="text-sm text-yellow-700 mt-1">{alert.message}</p>
                    <div className="mt-2">
                        <Link
                            href={alert.action_url}
                            className="text-xs text-yellow-800 underline hover:text-yellow-900"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const DeadlineCard = ({ deadline }) => (
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 break-words">{deadline.milestone_name}</h4>
                        <p className="text-sm text-gray-600 mt-1 break-words">Due: {new Date(deadline.due_date).toLocaleDateString()}</p>
                        <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                deadline.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                deadline.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {deadline.status}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <Link
                            href={`/projects/${deadline.contract_id}`}
                            className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            View
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const EnhancedStatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, trendValue }) => {
        const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            purple: 'bg-purple-500',
            teal: 'bg-teal-500',
            red: 'bg-red-500',
            indigo: 'bg-indigo-500'
        };

        const trendColors = {
            up: 'text-green-600',
            down: 'text-red-600',
            stable: 'text-gray-600'
        };

        const trendIcons = {
            up: ArrowTrendingUpIcon,
            down: '↓',
            stable: '→'
        };

        return (
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200 h-full">
                <div className="p-4 lg:p-6">
                    <div className="flex items-start h-full">
                        <div className="flex-shrink-0">
                            <div className={`w-10 h-10 ${colorClasses[color]} rounded-full flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                            <div className="text-xs lg:text-sm font-medium text-gray-500 break-words leading-tight">{title}</div>
                            <div className="text-lg lg:text-xl font-bold text-gray-900 break-words leading-tight mt-1">{value}</div>
                            <div className="flex items-start mt-2">
                                {subtitle && (
                                    <div className="text-xs text-gray-500 break-words flex-1 leading-relaxed">{subtitle}</div>
                                )}
                                {trend && trendValue && (
                                    <div className={`ml-2 flex items-center text-xs ${trendColors[trend]} flex-shrink-0`}>
                                        {trend === 'up' && <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />}
                                        {trend === 'down' && <span className="mr-1">↓</span>}
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

    const ActivityCard = ({ activity }) => (
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'job_posted' ? 'bg-blue-100' :
                            activity.type === 'proposal_received' ? 'bg-green-100' :
                            activity.type === 'contract_signed' ? 'bg-purple-100' :
                            activity.type === 'payment_made' ? 'bg-yellow-100' :
                            activity.type === 'deadline_met' ? 'bg-indigo-100' :
                            'bg-gray-100'
                        }`}>
                            {activity.type === 'job_posted' && <BriefcaseIcon className="w-4 h-4 text-blue-600" />}
                            {activity.type === 'proposal_received' && <DocumentTextIcon className="w-4 h-4 text-green-600" />}
                            {activity.type === 'contract_signed' && <CheckCircleIcon className="w-4 h-4 text-purple-600" />}
                            {activity.type === 'payment_made' && <CurrencyDollarIcon className="w-4 h-4 text-yellow-600" />}
                            {activity.type === 'deadline_met' && <ClockIcon className="w-4 h-4 text-indigo-600" />}
                            {activity.type === 'notification' && <BellIcon className="w-4 h-4 text-gray-600" />}
                        </div>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 break-words">{activity.title}</p>
                        <p className="text-sm text-gray-600 break-words">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1 break-words">{activity.time}</p>
                    </div>
                    {activity.action_url && (
                        <div className="ml-3">
                            <Link
                                href={activity.action_url}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                View
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const SearchAndFilterBar = ({ onSearch, onFilter, searchTerm, activeFilter }) => {
        const [isFilterOpen, setIsFilterOpen] = React.useState(false);
        const [isExportOpen, setIsExportOpen] = React.useState(false);

        const closeAllDropdowns = () => {
            setIsFilterOpen(false);
            setIsExportOpen(false);
        };

        const toggleFilter = () => {
            closeAllDropdowns();
            setIsFilterOpen(!isFilterOpen);
        };

        const toggleExport = () => {
            closeAllDropdowns();
            setIsExportOpen(!isExportOpen);
        };
        const [suggestions, setSuggestions] = React.useState([]);
        const [isLoading, setIsLoading] = React.useState(false);
        const [isExporting, setIsExporting] = React.useState(false);
        const [exportFormats, setExportFormats] = React.useState([]);
        const [exportTypes, setExportTypes] = React.useState([]);

        const filterOptions = [
            { value: 'all', label: 'All Items', icon: Squares2X2Icon },
            { value: 'jobs', label: 'Jobs Only', icon: BriefcaseIcon },
            { value: 'proposals', label: 'Proposals Only', icon: DocumentTextIcon },
            { value: 'contracts', label: 'Contracts Only', icon: CheckCircleIcon },
            { value: 'notifications', label: 'Notifications Only', icon: BellIcon },
        ];

        const exportOptions = [
            { value: 'all', label: 'All Data', icon: Squares2X2Icon },
            { value: 'jobs', label: 'Jobs Only', icon: BriefcaseIcon },
            { value: 'proposals', label: 'Proposals Only', icon: DocumentTextIcon },
            { value: 'contracts', label: 'Contracts Only', icon: CheckCircleIcon },
            { value: 'notifications', label: 'Notifications Only', icon: BellIcon },
            { value: 'deadlines', label: 'Deadlines Only', icon: ClockIcon },
            { value: 'analytics', label: 'Analytics Report', icon: ChartBarIcon },
        ];

        // Load export formats and types on component mount
        React.useEffect(() => {
            loadExportOptions();
        }, []);

        const loadExportOptions = async () => {
            try {
                const response = await fetch('/api/export/formats', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });
                const data = await response.json();
                setExportFormats(data.formats || []);
                setExportTypes(data.types || []);
            } catch (error) {
                console.error('Failed to load export options:', error);
            }
        };

        const handleSearch = async (query) => {
            onSearch(query);
            if (query.length > 2) {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Accept': 'application/json',
                        },
                    });
                    const data = await response.json();
                    setSuggestions(data.suggestions || []);
                } catch (error) {
                    console.error('Search error:', error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        };

        const handleExport = async (type, format = 'csv') => {
            setIsExporting(true);
            closeAllDropdowns();

            try {
                const response = await fetch('/api/export', {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Export failed');
                }

                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;

                // Set filename based on type and format
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                a.download = `export_${type}_${timestamp}.${format}`;

                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

            } catch (error) {
                console.error('Export error:', error);
                alert('Export failed. Please try again.');
            } finally {
                setIsExporting(false);
            }
        };

        const getExportPreview = async (type) => {
            try {
                const response = await fetch(`/api/export/preview?type=${type}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Preview error:', error);
                return null;
            }
        };

        // Close dropdowns when clicking outside
        React.useEffect(() => {
            const handleClickOutside = (event) => {
                if (!event.target.closest('.export-dropdown') && !event.target.closest('.filter-dropdown')) {
                    closeAllDropdowns();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="bg-white/70 backdrop-blur-sm shadow-lg border border-gray-200 rounded-lg p-4 mb-6 relative z-30 overflow-visible">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Search Input */}
                    <div className="flex-1 relative z-10" style={{ position: 'relative' }}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isLoading ? (
                                <div className="animate-spin h-5 w-5 text-gray-400">
                                    <svg fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                            ) : (
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Search jobs, proposals, contracts..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />

                        {/* Search Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="absolute z-[100] mt-1 w-full bg-white shadow-xl max-h-60 rounded-md py-1 text-sm overflow-auto focus:outline-none border border-gray-300" style={{ position: 'absolute' }}>
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            handleSearch(suggestion);
                                            setSuggestions([]);
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative filter-dropdown z-10" style={{ position: 'relative' }}>
                        <button
                            onClick={toggleFilter}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            {filterOptions.find(opt => opt.value === activeFilter)?.label || 'Filter'}
                            <ChevronDownIcon className="h-5 w-5 ml-2" />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 z-[100] mt-2 w-56 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5" style={{ position: 'absolute' }}>
                                <div className="py-1">
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onFilter(option.value);
                                                closeAllDropdowns();
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <option.icon className="h-4 w-4 mr-3" />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative export-dropdown z-10" style={{ position: 'relative' }}>
                        <button
                            onClick={toggleExport}
                            disabled={isExporting}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <div className="animate-spin h-5 w-5 mr-2">
                                    <svg fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                            ) : (
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            )}
                            Export
                            <ChevronDownIcon className="h-5 w-5 ml-2" />
                        </button>

                        {isExportOpen && (
                            <div className="absolute right-0 z-[100] mt-2 w-64 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5" style={{ position: 'absolute' }}>
                                <div className="py-1">
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Export Data
                                    </div>
                                    {exportOptions.map((option) => (
                                        <div key={option.value} className="px-2 py-1">
                                            <button
                                                onClick={() => {
                                                    handleExport(option.value, 'csv');
                                                    closeAllDropdowns();
                                                }}
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                            >
                                                <option.icon className="h-4 w-4 mr-3" />
                                                {option.label}
                                            </button>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Format Options
                                    </div>
                                    <div className="px-2 py-1">
                                        <button
                                            onClick={() => {
                                                handleExport('all', 'json');
                                                closeAllDropdowns();
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                        >
                                            <DocumentTextIcon className="h-4 w-4 mr-3" />
                                            Export as JSON
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleExport('analytics', 'pdf');
                                                closeAllDropdowns();
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                        >
                                            <DocumentTextIcon className="h-4 w-4 mr-3" />
                                            Export Report as PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                        <Link
                            href={route('jobs.create')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            New Job
                        </Link>
                        <Link
                            href={route('analytics.index')}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            <ChartBarIcon className="h-4 w-4 mr-1" />
                            Analytics
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Employer Dashboard
                    </h2>
                    <Link
                        href={route('jobs.create')}
                        className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Post a Job
                    </Link>
                </div>
            }
        >
            <Head title="Employer Dashboard" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-visible">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="relative z-20 mx-auto max-w-7xl sm:px-6 lg:px-8 overflow-visible">
                    {/* Search and Filter Bar */}
                    <SearchAndFilterBar
                        onSearch={(term) => console.log('Search:', term)}
                        onFilter={(filter) => console.log('Filter:', filter)}
                        searchTerm=""
                        activeFilter="all"
                    />

                    {/* Enhanced Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 mb-8 auto-rows-fr" data-observer-target>
                        <EnhancedStatCard
                            title="Total Jobs Posted"
                            value={stats.totalJobs}
                            subtitle="All time"
                            icon={BriefcaseIcon}
                            color="blue"
                            trend={analytics?.trends?.growth_rate?.direction}
                            trendValue={`${analytics?.trends?.growth_rate?.jobs || 0}%`}
                        />
                        <EnhancedStatCard
                            title="Active Job Postings"
                            value={stats.activeJobs}
                            subtitle="Currently open"
                            icon={ClockIcon}
                            color="green"
                        />
                        <EnhancedStatCard
                            title="Job Success Rate"
                            value={`${stats.successRate}%`}
                            subtitle="Jobs to contracts"
                            icon={CheckCircleIcon}
                            color="teal"
                        />
                        <EnhancedStatCard
                            title="Average Response Time"
                            value={`${stats.avgResponseTime}h`}
                            subtitle="Time to respond"
                            icon={ArrowTrendingUpIcon}
                            color="purple"
                        />
                        <EnhancedStatCard
                            title="Project Completion Rate"
                            value={`${stats.completionRate}%`}
                            subtitle="Projects finished"
                            icon={DocumentCheckIcon}
                            color="indigo"
                        />
                        <EnhancedStatCard
                            title="Monthly Spending"
                            value={`₱${formatAmount(stats.monthlySpent)}`}
                            subtitle="Current month"
                            icon={CurrencyDollarIcon}
                            color="yellow"
                            trend={analytics?.spending_analysis?.cost_trend}
                            trendValue="vs previous month"
                        />
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" data-observer-target>
                        {/* Proposals Quality */}
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Quality</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg Experience</span>
                                        <span className="text-sm font-medium">{analytics?.proposals_received?.quality_score || 0}/100</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg Rating</span>
                                        <span className="text-sm font-medium">{analytics?.proposals_received?.avg_per_job || 0} per job</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Response Rate</span>
                                        <span className="text-sm font-medium">{analytics?.response_times?.within_24h || 0} within 24h</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contract Performance */}
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Performance</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg Duration</span>
                                        <span className="text-sm font-medium">{analytics?.contracts_active?.avg_duration || 0} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Completion Rate</span>
                                        <span className="text-sm font-medium">{analytics?.contracts_active?.completion_rate || 0}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Active Contracts</span>
                                        <span className="text-sm font-medium">{stats.activeContracts}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spending Analysis */}
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Analysis</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Spent</span>
                                        <span className="text-sm font-medium">₱{formatAmount(analytics?.spending_analysis?.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg per Project</span>
                                        <span className="text-sm font-medium">₱{formatAmount(analytics?.spending_analysis?.avg_per_project)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Platform Fees</span>
                                        <span className="text-sm font-medium">₱{formatAmount(analytics?.spending_analysis?.platform_fees)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-observer-target>
                        {/* Left Column - Jobs Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Posted Jobs</h3>
                                        <Link
                                            href={route('jobs.index')}
                                            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {jobsSummary.jobs?.length > 0 ? (
                                            jobsSummary.jobs.map((job) => (
                                                <JobCard key={job.id} job={job} />
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No jobs posted yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column - Proposals */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Proposals</h3>
                                        <Link
                                            href={route('bids.index')}
                                            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {proposalsReceived?.length > 0 ? (
                                            proposalsReceived.map((proposal) => (
                                                <ProposalCard key={proposal.id} proposal={proposal} />
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No proposals received yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Notifications */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                        {notifications?.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                {notifications.unreadCount}
                                            </span>
                                        )}
                                        <Link
                                            href={route('notifications.index')}
                                            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {notifications?.recent?.length > 0 ? (
                                            notifications.recent.slice(0, 3).map((notification) => (
                                                <NotificationCard key={notification.id} notification={notification} />
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No notifications</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escrow Alerts */}
                    {notifications?.escrow?.length > 0 && (
                        <div className="mt-8">
                            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Alerts</h3>
                                    <div className="space-y-3">
                                        {notifications.escrow.map((alert) => (
                                            <EscrowAlertCard key={alert.id} alert={alert} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Deadlines */}
                    {notifications?.deadlines?.length > 0 && (
                        <div className="mt-8">
                            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
                                        <Link
                                            href={route('contracts.index')}
                                            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {notifications.deadlines.map((deadline) => (
                                            <DeadlineCard key={deadline.id} deadline={deadline} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Activity Feed */}
                    <div className="mt-8">
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                    <Link
                                        href={route('analytics.index')}
                                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                    >
                                        View Analytics
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {activities?.length > 0 ? (
                                        activities.map((activity, index) => (
                                            <ActivityCard key={index} activity={activity} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No recent activity</p>
                                            <p className="text-sm text-gray-400">Activity will appear here as you post jobs and manage contracts</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Contracts */}
                    <div className="mt-8">
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Active Contracts</h3>
                                    <Link
                                        href={route('contracts.index')}
                                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {activeContracts?.length > 0 ? (
                                        activeContracts.map((contract) => (
                                            <ContractCard key={contract.id} contract={contract} />
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No active contracts</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-lg border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Link
                                        href={route('jobs.create')}
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <BriefcaseIcon className="w-8 h-8 text-teal-500 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900">Post New Job</p>
                                            <p className="text-sm text-gray-600">Find gig workers</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('jobs.index')}
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <DocumentTextIcon className="w-8 h-8 text-blue-500 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900">Manage Jobs</p>
                                            <p className="text-sm text-gray-600">View all postings</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('contracts.index')}
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900">Active Projects</p>
                                            <p className="text-sm text-gray-600">Track progress</p>
                                        </div>
                                    </Link>
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

                [data-observer-target] {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }
                [data-observer-target].is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </AuthenticatedLayout>
    );
}