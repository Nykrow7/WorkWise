import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDistanceToNow } from 'date-fns';

export default function JobsIndex({ jobs, filters = {} }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [budgetRange, setBudgetRange] = useState(filters.budget_range || 'all');
    const [experienceLevel, setExperienceLevel] = useState(filters.experience_level || 'all');

    // Helper function to safely parse required_skills
    const parseSkills = (skills) => {
        if (!skills) return [];

        // If it's already an array, return it
        if (Array.isArray(skills)) return skills;

        // If it's a string, try to parse it as JSON
        if (typeof skills === 'string') {
            try {
                const parsed = JSON.parse(skills);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }

        return [];
    };
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        jobId: null,
        action: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'red'
    });

    const isEmployer = auth.user?.user_type === 'employer';
    const [processing, setProcessing] = useState(false);

    // Debounced search function
    const debouncedSearch = useCallback(() => {
        const timeoutId = setTimeout(() => {
            router.get('/jobs', {
                search: search || '',
                category: selectedCategory !== 'all' ? selectedCategory : '',
                budget_range: budgetRange !== 'all' ? budgetRange : '',
                experience_level: experienceLevel !== 'all' ? experienceLevel : '',
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500); // 500ms debounce delay

        return () => clearTimeout(timeoutId);
    }, [search, selectedCategory, budgetRange, experienceLevel]);

    // Trigger search when any filter changes
    useEffect(() => {
        const cleanup = debouncedSearch();
        return cleanup;
    }, [debouncedSearch]);

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setBudgetRange('all');
        setExperienceLevel('all');
        router.get('/jobs');
    };

    const formatAmount = (value) => {
        const number = Number(value ?? 0);
        return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getBudgetDisplay = (job) => {
        if (job.budget_type === 'fixed') {
            return `₱${formatAmount(job.budget_min)} - ₱${formatAmount(job.budget_max)}`;
        }
        return `₱${formatAmount(job.budget_min)} - ₱${formatAmount(job.budget_max)}/hr`;
    };

    const getExperienceBadge = (level) => {
        const badges = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-blue-100 text-blue-800',
            expert: 'bg-purple-100 text-purple-800'
        };
        return badges[level] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status) => {
        const badges = {
            open: 'bg-green-100 text-green-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const handleDeleteJob = (jobId) => {
        setConfirmModal({
            isOpen: true,
            jobId: jobId,
            action: 'delete',
            title: 'Delete Job',
            message: 'Are you sure you want to delete this job? This action cannot be undone and all proposals will be lost.',
            confirmText: 'Delete Job',
            confirmColor: 'red'
        });
    };

    const handleCloseJob = (jobId) => {
        setConfirmModal({
            isOpen: true,
            jobId: jobId,
            action: 'close',
            title: 'Close Job',
            message: 'Are you sure you want to close this job? This will prevent new proposals from being submitted.',
            confirmText: 'Close Job',
            confirmColor: 'yellow'
        });
    };

    const confirmAction = () => {
        setProcessing(true);
        if (confirmModal.action === 'delete') {
            router.delete(route('jobs.destroy', confirmModal.jobId), {
                onSuccess: () => {
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setProcessing(false);
                    router.reload();
                },
                onError: () => {
                    setProcessing(false);
                }
            });
        } else if (confirmModal.action === 'close') {
            router.patch(route('jobs.update', confirmModal.jobId),
                { status: 'closed' },
                {
                    onSuccess: () => {
                        setConfirmModal({ ...confirmModal, isOpen: false });
                        setProcessing(false);
                        router.reload();
                    },
                    onError: () => {
                        setProcessing(false);
                    }
                }
            );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {isEmployer ? 'My Posted Jobs' : 'Browse Jobs'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isEmployer
                                ? 'Manage your job postings and review proposals'
                                : 'Find your next gig work opportunity'
                            }
                        </p>
                    </div>
                    {isEmployer && (
                        <Link
                            href={route('jobs.create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            + Post New Job
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={isEmployer ? 'My Jobs' : 'Browse Jobs'} />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Search and Filters */}
                    {!isEmployer && (
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl mb-8 border border-gray-200">
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search jobs by title, skills, or description..."
                                            className="w-full border-gray-300 rounded-xl shadow-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-xl"
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={budgetRange}
                                            onChange={(e) => setBudgetRange(e.target.value)}
                                            className="w-full border-gray-300 rounded-xl shadow-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-xl"
                                        >
                                            <option value="all">All Budgets</option>
                                            <option value="0-25000">₱0 - ₱25,000</option>
                                            <option value="25000-50000">₱25,000 - ₱50,000</option>
                                            <option value="50000-250000">₱50,000 - ₱250,000</option>
                                            <option value="250000+">₱250,000+</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={experienceLevel}
                                            onChange={(e) => setExperienceLevel(e.target.value)}
                                            className="w-full border-gray-300 rounded-xl shadow-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-xl"
                                        >
                                            <option value="all">All Levels</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={clearFilters}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        Clear Filters
                                    </button>
                                    <Link
                                        href={route('ai.recommendations')}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        🤖 AI Recommendations
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Jobs List */}
                    {jobs.data && jobs.data.length === 0 ? (
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-16 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM16 10h.01M12 14h.01M8 14h.01M8 10h.01" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {isEmployer ? 'No Jobs Posted Yet' : 'No Jobs Found'}
                                </h3>
                                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                    {isEmployer
                                        ? "Start by posting your first job to find talented gig workers."
                                        : "Try adjusting your search criteria or check back later for new opportunities."
                                    }
                                </p>
                                {isEmployer && (
                                    <Link
                                        href={route('jobs.create')}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Post Your First Job
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {jobs.data && jobs.data.map((job) => (
                                <div key={job.id} className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                                    <div className="p-8">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        <Link
                                                            href={`/jobs/${job.id}`}
                                                            className="hover:text-blue-600 transition-colors duration-300"
                                                        >
                                                            {job.title}
                                                        </Link>
                                                    </h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold shadow-md ${getStatusBadge(job.status)}`}>
                                                        {job.status === 'open' ? 'Open' : job.status.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <p className="text-gray-700 text-lg mb-6 line-clamp-3 break-all leading-relaxed">
                                                    {job.description}
                                                </p>

                                                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 mb-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Budget</div>
                                                            <div className="font-bold text-green-600 text-lg">
                                                                {getBudgetDisplay(job)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Duration</div>
                                                            <div className="font-bold text-gray-900 text-lg">
                                                                {job.estimated_duration_days} days
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Experience</div>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold shadow-md ${getExperienceBadge(job.experience_level)}`}>
                                                                {job.experience_level}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-600 mb-1">Location</div>
                                                            <div className="font-bold text-gray-900 text-lg">
                                                                {job.is_remote ? '🌐 Remote' : `📍 ${job.location || 'Lapu-Lapu City'}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-6">
                                                    <div className="text-sm font-medium text-blue-600 mb-3">Required Skills</div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {parseSkills(job?.required_skills || []).map((skill, index) => (
                                                            <span key={index} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span>
                                                            Posted by:
                                                            <span className="font-medium ml-1">
                                                                {job.employer ? `${job.employer.first_name} ${job.employer.last_name}` : 'Employer'}
                                                            </span>
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatDistanceToNow(new Date(job.created_at))} ago</span>
                                                        {job.bids_count !== undefined && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{job.bids_count} proposal{job.bids_count !== 1 ? 's' : ''}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {isEmployer ? (
                                                            <>
                                                                <Link
                                                                    href={`/jobs/${job.id}/edit`}
                                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                {job.status === 'open' && (
                                                                    <button
                                                                        onClick={() => handleCloseJob(job.id)}
                                                                        className="text-sm text-yellow-600 hover:text-yellow-800"
                                                                    >
                                                                        Close
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteJob(job.id)}
                                                                    className="text-sm text-red-600 hover:text-red-800"
                                                                >
                                                                    Delete
                                                                </button>
                                                                <Link
                                                                    href={`/jobs/${job.id}`}
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                                >
                                                                    View Proposals ({job.bids_count || 0})
                                                                </Link>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Link
                                                                    href={`/jobs/${job.id}`}
                                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                                >
                                                                    View Details
                                                                </Link>
                                                                {job.status === 'open' && (
                                                                    <Link
                                                                        href={`/jobs/${job.id}`}
                                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                                    >
                                                                        Submit Proposal
                                                                    </Link>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {jobs.links && jobs.links.length > 3 && (
                                <div className="bg-white/70 backdrop-blur-sm px-6 py-4 flex items-center justify-between border border-gray-200 sm:px-8 rounded-xl shadow-lg">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {jobs.prev_page_url && (
                                            <Link
                                                href={jobs.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {jobs.next_page_url && (
                                            <Link
                                                href={jobs.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{jobs.from}</span> to{' '}
                                                <span className="font-medium">{jobs.to}</span> of{' '}
                                                <span className="font-medium">{jobs.total}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                {jobs.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                            index === jobs.links.length - 1 ? 'rounded-r-md' : ''
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Stats for Gig Workers */}
                    {!isEmployer && jobs.data && jobs.data.length > 0 && (
                        <div className="mt-12 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-blue-900 mb-6">Market Insights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-800">
                                <div className="text-center">
                                    <div className="font-semibold text-blue-700 mb-2">Total Jobs Available</div>
                                    <div className="text-3xl font-bold text-blue-600">{jobs.total || jobs.data.length}</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-700 mb-2">Average Budget</div>
                                    <div className="text-3xl font-bold text-green-600">
                                        ₱{formatAmount(Math.round(jobs.data.reduce((sum, job) => sum + ((job.budget_min + job.budget_max) / 2), 0) / jobs.data.length) || 0)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-700 mb-2">Remote Opportunities</div>
                                    <div className="text-3xl font-bold text-purple-600">
                                        {Math.round((jobs.data.filter(job => job.is_remote).length / jobs.data.length) * 100) || 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border border-gray-200 w-96 shadow-2xl rounded-xl bg-white/90 backdrop-blur-sm">
                        <div className="mt-3 text-center">
                            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                                confirmModal.confirmColor === 'red' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                                <svg className={`h-6 w-6 ${
                                    confirmModal.confirmColor === 'red' ? 'text-red-600' : 'text-yellow-600'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                                {confirmModal.title}
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    {confirmModal.message}
                                </p>
                            </div>
                            <div className="items-center px-6 py-4">
                                <button
                                    onClick={confirmAction}
                                    disabled={processing}
                                    className={`px-6 py-3 ${
                                        confirmModal.confirmColor === 'red'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                            : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                                    } text-white font-semibold rounded-xl w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none`}
                                >
                                    {processing ? 'Processing...' : confirmModal.confirmText}
                                </button>
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                    className="mt-4 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-xl w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
