import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDistanceToNow } from 'date-fns';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';

export default function JobsIndex({ jobs, availableSkills = [] }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        experience: 'all',
        budgetMin: '',
        budgetMax: '',
        skills: [],
    });
    const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);

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

    const experienceOptions = [
        { label: 'All experience levels', value: 'all' },
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Expert', value: 'expert' },
    ];

    const normalizedSelectedSkills = useMemo(
        () => filters.skills.map((skill) => skill.toLowerCase()),
        [filters.skills]
    );

    const budgetFilter = useMemo(() => {
        const parseBudgetValue = (value) => {
            if (value === '' || value === null || value === undefined) {
                return null;
            }
            if (typeof value === 'number') {
                return Number.isFinite(value) ? value : null;
            }
            const numeric = parseFloat(value);
            return Number.isFinite(numeric) ? numeric : null;
        };
        return {
            min: parseBudgetValue(filters.budgetMin),
            max: parseBudgetValue(filters.budgetMax),
        };
    }, [filters.budgetMin, filters.budgetMax]);

    const [processing, setProcessing] = useState(false);

    // Client-side filtering functions (fast, no API calls)
    const matchesSearch = (job) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(searchLower);
        const descMatch = job.description?.toLowerCase().includes(searchLower);
        const skillsMatch = parseSkills(job.required_skills).some(skill => 
            skill.toLowerCase().includes(searchLower)
        );
        return titleMatch || descMatch || skillsMatch;
    };

    const matchesExperience = (value) => {
        if (filters.experience === 'all') return true;
        if (!value) return false;
        return value.toLowerCase() === filters.experience;
    };

    const matchesSkillFilter = (skillSet) => {
        if (!normalizedSelectedSkills.length) return true;
        const jobSkills = parseSkills(skillSet);
        if (!Array.isArray(jobSkills) || jobSkills.length === 0) return false;
        
        const normalizedJobSkills = jobSkills
            .map((skill) => typeof skill === 'string' ? skill.toLowerCase() : '')
            .filter((skill) => skill.length > 0);
        
        if (normalizedJobSkills.length === 0) return false;
        
        return normalizedSelectedSkills.every((skill) =>
            normalizedJobSkills.includes(skill)
        );
    };

    const jobBudgetMatches = (minValue, maxValue) => {
        if (budgetFilter.min === null && budgetFilter.max === null) return true;
        
        const jobMin = minValue !== undefined ? minValue : null;
        const jobMax = maxValue !== undefined ? maxValue : null;
        
        const normalizedMin = jobMin === null || jobMin === '' || jobMin === undefined
            ? null
            : Number.isFinite(jobMin) ? jobMin : Number.isFinite(parseFloat(jobMin)) ? parseFloat(jobMin) : null;
        
        const normalizedMax = jobMax === null || jobMax === '' || jobMax === undefined
            ? null
            : Number.isFinite(jobMax) ? jobMax : Number.isFinite(parseFloat(jobMax)) ? parseFloat(jobMax) : null;
        
        if (normalizedMin === null && normalizedMax === null) return true;
        
        const rangeMin = normalizedMin ?? normalizedMax;
        const rangeMax = normalizedMax ?? normalizedMin;
        
        if (rangeMin === null && rangeMax === null) return true;
        
        if (budgetFilter.min !== null && rangeMax !== null && rangeMax < budgetFilter.min) {
            return false;
        }
        
        if (budgetFilter.max !== null && rangeMin !== null && rangeMin > budgetFilter.max) {
            return false;
        }
        
        return true;
    };

    const handleBudgetChange = (key) => (event) => {
        const { value } = event.target;
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const toggleSkillSelection = (skill) => {
        setFilters((current) => {
            const alreadySelected = current.skills.some(
                (selectedSkill) => selectedSkill.toLowerCase() === skill.toLowerCase()
            );
            return {
                ...current,
                skills: alreadySelected
                    ? current.skills.filter((selectedSkill) => selectedSkill.toLowerCase() !== skill.toLowerCase())
                    : [...current.skills, skill],
            };
        });
    };

    const clearFilters = () => {
        setSearch('');
        setFilters({
            experience: 'all',
            budgetMin: '',
            budgetMax: '',
            skills: [],
        });
        setIsSkillDropdownOpen(false);
    };

    const hasActiveFilters = useMemo(
        () =>
            search !== '' ||
            filters.experience !== 'all' ||
            filters.budgetMin !== '' ||
            filters.budgetMax !== '' ||
            filters.skills.length > 0,
        [search, filters]
    );

    // Fast client-side filtering with useMemo
    const filteredJobs = useMemo(() => {
        if (!jobs.data) return [];
        
        return jobs.data.filter((job) => {
            if (!matchesSearch(job)) return false;
            if (!matchesExperience(job.experience_level)) return false;
            if (!jobBudgetMatches(job.budget_min, job.budget_max)) return false;
            if (!matchesSkillFilter(job.required_skills)) return false;
            return true;
        });
    }, [jobs.data, search, filters, normalizedSelectedSkills, budgetFilter]);

    // Pagination for filtered jobs (5 items per page)
    const {
        currentPage,
        totalPages,
        currentItems: paginatedJobs,
        goToPage,
        shouldShowPagination,
        totalItems,
        itemsPerPage,
    } = usePagination(filteredJobs, 5);

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
                    {/* Search and Filters with Sidebar Layout for Gig Workers */}
                    {!isEmployer ? (
                        <div className="grid gap-6 lg:grid-cols-[320px_1fr] mb-8">
                            {/* Sidebar Filters - Enhanced Elevation */}
                            <aside className="bg-white/90 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl p-6 lg:sticky h-max ring-1 ring-blue-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Filter Jobs
                                    </h3>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Search Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Title, skills, description..."
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Experience Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Experience Level
                                        </label>
                                        <select
                                            value={filters.experience}
                                            onChange={(e) => setFilters(current => ({ ...current, experience: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {experienceOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Budget Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Budget Range (₱)
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Min"
                                                value={filters.budgetMin}
                                                onChange={handleBudgetChange('budgetMin')}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-500">-</span>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Max"
                                                value={filters.budgetMax}
                                                onChange={handleBudgetChange('budgetMax')}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Set either value to narrow results by budget.
                                        </p>
                                    </div>

                                    {/* Skills Filter - Dynamic from Job Posts */}
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Required Skills
                                            </label>
                                            {availableSkills.length > 0 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {availableSkills.length} available
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsSkillDropdownOpen((open) => !open)}
                                            className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                        >
                                            <span>
                                                {filters.skills.length
                                                    ? `${filters.skills.length} skill${filters.skills.length > 1 ? 's' : ''} selected`
                                                    : 'Select skills'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {isSkillDropdownOpen ? '▲' : '▼'}
                                            </span>
                                        </button>

                                        {isSkillDropdownOpen && (
                                            <div className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-y-auto rounded-xl border-2 border-blue-200 bg-white p-3 shadow-2xl ring-1 ring-blue-100">
                                                {availableSkills.length > 0 ? (
                                                    <>
                                                        <div className="mb-2 pb-2 border-b border-gray-200">
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Skills from posted jobs
                                                            </p>
                                                        </div>
                                                        {availableSkills.map((skill) => {
                                                            const isSelected = filters.skills.some(
                                                                (selectedSkill) => selectedSkill.toLowerCase() === skill.toLowerCase()
                                                            );
                                                            return (
                                                                <label
                                                                    key={skill}
                                                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleSkillSelection(skill)}
                                                                    />
                                                                    <span className="flex-1">{skill}</span>
                                                                    {isSelected && (
                                                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </label>
                                                            );
                                                        })}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            No skills available yet
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Skills will appear when employers post jobs
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Auto-updated from employer job posts
                                        </p>

                                        {filters.skills.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {filters.skills.map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                                    >
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSkillSelection(skill)}
                                                            className="text-blue-500 hover:text-blue-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Recommendations Link */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('ai.recommendations')}
                                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        <span>🤖</span>
                                        <span>AI Recommendations</span>
                                    </Link>
                                </div>
                            </aside>

                            {/* Main Content Area */}
                            <div>
                                {/* Jobs List */}
                                {filteredJobs.length === 0 ? (
                                    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                                        <div className="p-16 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM16 10h.01M12 14h.01M8 14h.01M8 10h.01" />
                                                </svg>
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                No Jobs Found
                                            </h3>
                                            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                                Try adjusting your search criteria or check back later for new opportunities.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {paginatedJobs.map((job) => (
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
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination */}
                                        {shouldShowPagination && (
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={goToPage}
                                                itemsPerPage={itemsPerPage}
                                                totalItems={totalItems}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Employer View - No Sidebar, just jobs list */
                        <div className="mb-8">
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
                                            No Jobs Posted Yet
                                        </h3>
                                        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                            Start by posting your first job to find talented gig workers.
                                        </p>
                                        <Link
                                            href={route('jobs.create')}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Post Your First Job
                                        </Link>
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
                        </div>
                    )}

                    {/* Quick Stats for Gig Workers */}
                    {!isEmployer && filteredJobs.length > 0 && (
                        <div className="mt-12 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-blue-900 mb-6">Market Insights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-800">
                                <div className="text-center">
                                    <div className="font-semibold text-blue-700 mb-2">Filtered Jobs</div>
                                    <div className="text-3xl font-bold text-blue-600">{filteredJobs.length}</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-700 mb-2">Average Budget</div>
                                    <div className="text-3xl font-bold text-green-600">
                                        ₱{formatAmount(Math.round(filteredJobs.reduce((sum, job) => sum + ((job.budget_min + job.budget_max) / 2), 0) / filteredJobs.length) || 0)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-700 mb-2">Remote Opportunities</div>
                                    <div className="text-3xl font-bold text-purple-600">
                                        {Math.round((filteredJobs.filter(job => job.is_remote).length / filteredJobs.length) * 100) || 0}%
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
