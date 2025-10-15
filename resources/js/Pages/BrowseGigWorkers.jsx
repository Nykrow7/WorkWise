import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import useGigWorkers from '@/Hooks/useGigWorkers';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    StarIcon,
    EyeIcon,
    CalendarDaysIcon,
    BriefcaseIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ExclamationTriangleIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Enhanced filter validation utilities
const validateNumericInput = (value, min = 0, max = 999999) => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return Math.max(min, Math.min(max, numValue)).toString();
};

const sanitizeTextInput = (value, maxLength = 100) => {
    if (!value) return '';
    return value.toString().trim().slice(0, maxLength);
};

const validateRatingInput = (value) => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return Math.max(0, Math.min(5, numValue)).toString();
};

// Enhanced debouncing hook
const useEnhancedDebounce = (value, delay, validator = null) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const validatedValue = validator ? validator(value) : value;
        const handler = setTimeout(() => {
            setDebouncedValue(validatedValue);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay, validator]);

    return debouncedValue;
};

// Invitation Confirmation Modal Component
const InvitationModal = ({ isOpen, onClose, onConfirm, gigWorker, isLoading = false }) => {
    const [message, setMessage] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');
    const [employerJobs, setEmployerJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    
    // Fetch employer's jobs when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoadingJobs(true);
            fetch('/api/employer/jobs')
                .then(response => response.json())
                .then(data => {
                    setEmployerJobs(data.jobs || []);
                })
                .catch(error => {
                    console.error('Error fetching jobs:', error);
                    setEmployerJobs([]);
                })
                .finally(() => {
                    setLoadingJobs(false);
                });
        }
    }, [isOpen]);
    
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedJobId) {
            alert('Please select a job to invite the gig worker to.');
            return;
        }
        onConfirm({ jobId: selectedJobId, message });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white/95 backdrop-blur-sm rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
                    <div className="bg-gradient-to-br from-white to-blue-50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 sm:mx-0 sm:h-10 sm:w-10">
                                <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                    Invite {gigWorker?.first_name || 'Gig Worker'} to Your Job
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Send a personalized invitation to this gig worker for your job opportunity.
                                    </p>
                                    <form onSubmit={handleSubmit}>
                                        {/* Job Selection */}
                                        <div className="mb-4">
                                            <label htmlFor="job-selection" className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Job *
                                            </label>
                                            {loadingJobs ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                    <span className="ml-2 text-gray-600">Loading jobs...</span>
                                                </div>
                                            ) : (
                                                <select
                                                    id="job-selection"
                                                    value={selectedJobId}
                                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Choose a job...</option>
                                                    {employerJobs.map(job => (
                                                        <option key={job.id} value={job.id}>
                                                            {job.title} - {job.budget_type === 'fixed' 
                                                                ? `₱${job.budget_min?.toLocaleString()}` 
                                                                : `₱${job.budget_min?.toLocaleString()} - ₱${job.budget_max?.toLocaleString()}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {employerJobs.length === 0 && !loadingJobs && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    No active jobs available. Please create a job first.
                                                </p>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div className="mb-4">
                                            <label htmlFor="invitation-message" className="block text-sm font-medium text-gray-700 mb-2">
                                                Invitation Message (Optional)
                                            </label>
                                            <textarea
                                                id="invitation-message"
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                placeholder="Hi! I'd like to invite you to work on my project. Your skills seem like a perfect match..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                maxLength={500}
                                            />
                                            <div className="text-right text-xs text-gray-500 mt-1">
                                                {message.length}/500
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !selectedJobId}
                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-base font-semibold text-white hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </div>
                            ) : (
                                'Send Invitation'
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-lg px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-base font-semibold text-gray-700 hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function BrowseGigWorkers({ auth }) {
    // Enhanced state management with validation
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterBy, setFilterBy] = useState({
        experienceLevel: '',
        minHourlyRate: '',
        maxHourlyRate: '',
        location: '',
        skills: '',
        minRating: '',
        // New advanced filters
        availabilityStatus: '',
        joinedDateRange: '',
        projectsCompleted: '',
        responseTime: ''
    });

    // Invitation modal state
    const [invitationModal, setInvitationModal] = useState({
        isOpen: false,
        gigWorker: null
    });
    const [invitationLoading, setInvitationLoading] = useState(false);

    // API hook
    const { 
        gigWorkers, 
        loading, 
        error, 
        pagination, 
        availableSkills, 
        stats, 
        fetchGigWorkers 
    } = useGigWorkers();

    // Enhanced debounced values with validation
    const debouncedSearchTerm = useEnhancedDebounce(searchTerm, 300, (value) => sanitizeTextInput(value, 100));
    const debouncedMinRate = useEnhancedDebounce(filterBy.minHourlyRate, 500, (value) => validateNumericInput(value, 0, 10000));
    const debouncedMaxRate = useEnhancedDebounce(filterBy.maxHourlyRate, 500, (value) => validateNumericInput(value, 0, 10000));
    const debouncedLocation = useEnhancedDebounce(filterBy.location, 400, (value) => sanitizeTextInput(value, 50));
    const debouncedMinRating = useEnhancedDebounce(filterBy.minRating, 300, validateRatingInput);

    // Calculate active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (debouncedSearchTerm) count++;
        if (filterBy.experienceLevel) count++;
        if (debouncedMinRate) count++;
        if (debouncedMaxRate) count++;
        if (debouncedLocation) count++;
        if (filterBy.skills) count++;
        if (debouncedMinRating) count++;
        if (filterBy.availabilityStatus) count++;
        if (filterBy.joinedDateRange) count++;
        if (filterBy.projectsCompleted) count++;
        if (filterBy.responseTime) count++;
        return count;
    }, [debouncedSearchTerm, filterBy, debouncedMinRate, debouncedMaxRate, debouncedLocation, debouncedMinRating]);

    // Enhanced fetch effect with proper parameter mapping
    useEffect(() => {
        const params = {
            search: debouncedSearchTerm,
            experience_level: filterBy.experienceLevel,
            min_hourly_rate: debouncedMinRate, // Fixed parameter mapping
            max_hourly_rate: debouncedMaxRate, // Fixed parameter mapping
            location: debouncedLocation,
            skills: filterBy.skills,
            min_rating: debouncedMinRating,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: 1,
            // New advanced filter parameters
            availability_status: filterBy.availabilityStatus,
            joined_date_range: filterBy.joinedDateRange,
            projects_completed: filterBy.projectsCompleted,
            response_time: filterBy.responseTime
        };

        // Only include non-empty parameters
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        );

        fetchGigWorkers(cleanParams);
    }, [
        debouncedSearchTerm, 
        filterBy.experienceLevel,
        debouncedMinRate,
        debouncedMaxRate,
        debouncedLocation,
        filterBy.skills,
        debouncedMinRating,
        sortBy, 
        sortOrder,
        filterBy.availabilityStatus,
        filterBy.joinedDateRange,
        filterBy.projectsCompleted,
        filterBy.responseTime,
        fetchGigWorkers
    ]);

    // Enhanced filter persistence using localStorage
    useEffect(() => {
        // Load saved filters from localStorage
        const savedFilters = localStorage.getItem('browseGigWorkersFilters');
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                setFilterBy(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Error parsing saved filters:', error);
                localStorage.removeItem('browseGigWorkersFilters');
            }
        }
    }, []);

    // Save filters to localStorage when they change
    useEffect(() => {
        const filtersToSave = {
            experienceLevel: filterBy.experienceLevel,
            minHourlyRate: filterBy.minHourlyRate,
            maxHourlyRate: filterBy.maxHourlyRate,
            location: filterBy.location,
            skills: filterBy.skills,
            minRating: filterBy.minRating,
            availabilityStatus: filterBy.availabilityStatus,
            joinedDateRange: filterBy.joinedDateRange,
            projectsCompleted: filterBy.projectsCompleted,
            responseTime: filterBy.responseTime
        };
        
        localStorage.setItem('browseGigWorkersFilters', JSON.stringify(filtersToSave));
    }, [filterBy]);

    // Handle page changes
    const handlePageChange = useCallback((page) => {
        const params = {
            search: debouncedSearchTerm,
            experience_level: filterBy.experienceLevel,
            min_hourly_rate: debouncedMinRate,
            max_hourly_rate: debouncedMaxRate,
            location: debouncedLocation,
            skills: filterBy.skills,
            min_rating: debouncedMinRating,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page,
            availability_status: filterBy.availabilityStatus,
            joined_date_range: filterBy.joinedDateRange,
            projects_completed: filterBy.projectsCompleted,
            response_time: filterBy.responseTime
        };

        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        );

        fetchGigWorkers(cleanParams);
    }, [
        debouncedSearchTerm, 
        filterBy, 
        debouncedMinRate,
        debouncedMaxRate,
        debouncedLocation,
        debouncedMinRating,
        sortBy, 
        sortOrder, 
        fetchGigWorkers
    ]);

    // Enhanced filter handlers with validation
    const handleFilterChange = useCallback((filterName, value) => {
        let validatedValue = value;
        
        // Apply validation based on filter type
        switch (filterName) {
            case 'minHourlyRate':
            case 'maxHourlyRate':
                validatedValue = validateNumericInput(value, 0, 10000);
                break;
            case 'location':
                validatedValue = sanitizeTextInput(value, 50);
                break;
            case 'minRating':
                validatedValue = validateRatingInput(value);
                break;
            default:
                validatedValue = value;
        }

        setFilterBy(prev => ({ ...prev, [filterName]: validatedValue }));
    }, []);

    // Enhanced clear filters function
    const clearAllFilters = useCallback(() => {
        setSearchTerm('');
        setFilterBy({
            experienceLevel: '',
            minHourlyRate: '',
            maxHourlyRate: '',
            location: '',
            skills: '',
            minRating: '',
            availabilityStatus: '',
            joinedDateRange: '',
            projectsCompleted: '',
            responseTime: ''
        });
        setSortBy('name');
        setSortOrder('asc');
        localStorage.removeItem('browseGigWorkersFilters');
    }, []);

    // Handle invitation
    const handleInviteGigWorker = (gigWorker) => {
        setInvitationModal({
            isOpen: true,
            freelancer: gigWorker
        });
    };

    const handleSendInvitation = async (invitationData) => {
        setInvitationLoading(true);
        
        try {
            await router.post('/job-invitations/send', {
                gig_worker_id: invitationModal.freelancer.id,
                job_id: invitationData.jobId,
                message: invitationData.message || ''
            }, {
                onSuccess: () => {
                    setInvitationModal({ isOpen: false, freelancer: null });
                    // You could add a success notification here
                },
                onError: (errors) => {
                    console.error('Invitation error:', errors);
                    // You could add error handling here
                }
            });
        } catch (error) {
            console.error('Failed to send invitation:', error);
        } finally {
            setInvitationLoading(false);
        }
    };

    const handleInviteGigWorker = (gigWorker) => {
        setInvitationModal({
            isOpen: true,
            gigWorker: gigWorker
        });
    };

    const handleSendInvitation = async ({ jobId, message }) => {
        setInvitationLoading(true);
        try {
            const response = await fetch('/api/invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    gig_worker_id: invitationModal.gigWorker.id,
                    job_id: jobId,
                    message: message
                })
            });

            if (response.ok) {
                setInvitationModal({ isOpen: false, gigWorker: null });
                // Show success message
                alert('Invitation sent successfully!');
            } else {
                throw new Error('Failed to send invitation');
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            alert('Failed to send invitation. Please try again.');
        } finally {
            setInvitationLoading(false);
        }
    };

    // Gig Worker Profile Card Component
    const GigWorkerCard = ({ gigWorker, viewMode }) => {
        // Helper functions for data extraction
        const getFullName = (gigWorker) => {
            return `${gigWorker.first_name || ''} ${gigWorker.last_name || ''}`.trim() || gigWorker.name || 'Unknown User';
        };

        const getProfilePhoto = (gigWorker) => {
            return gigWorker.profile_photo || gigWorker.avatar || "/api/placeholder/80/80";
        };

        const getSkills = (gigWorker) => {
            if (Array.isArray(gigWorker.skills)) {
                return gigWorker.skills;
            }
            return gigWorker.skills ? gigWorker.skills.split(',').map(s => s.trim()) : [];
        };

        const getMemberSince = (gigWorker) => {
            const date = gigWorker.created_at || gigWorker.memberSince;
            if (!date) return 'Recently joined';
            
            try {
                return format(new Date(date), 'MMM yyyy');
            } catch (error) {
                return 'Recently joined';
            }
        };

        if (viewMode === 'list') {
            return (
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-start space-x-4">
                                <div className="relative">
                                    <img 
                                        src={getProfilePhoto(gigWorker)} 
                                        alt={getFullName(gigWorker)}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.src = "/api/placeholder/80/80";
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                                {getFullName(gigWorker)}
                                            </h3>
                                            <p className="text-gray-600 font-medium">{gigWorker.professional_title || gigWorker.title || 'Gig Worker'}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-sm font-medium">{gigWorker.average_rating || gigWorker.rating || '0.0'}</span>
                                            <span className="ml-1 text-sm text-gray-500">({gigWorker.reviews_count || gigWorker.reviewCount || 0})</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                        <span className="flex items-center">
                                            <BriefcaseIcon className="w-4 h-4 mr-1" />
                                            {gigWorker.completed_projects || gigWorker.completedProjects || 0} projects completed
                                        </span>
                                        <span className="flex items-center">
                                            <AcademicCapIcon className="w-4 h-4 mr-1" />
                                            {gigWorker.experience_level || gigWorker.experienceLevel || 'Entry Level'}
                                        </span>
                                        {gigWorker.hourly_rate && (
                                            <span className="flex items-center">
                                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                ₱{gigWorker.hourly_rate}/hr
                                            </span>
                                        )}
                                        <span className="flex items-center">
                                            <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                            Member since {getMemberSince(gigWorker)}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 mb-4 line-clamp-2">
                                        {gigWorker.bio || gigWorker.description || 'No description available.'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {getSkills(gigWorker).slice(0, 6).map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                        {getSkills(gigWorker).length > 6 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{getSkills(gigWorker).length - 6} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {gigWorker.location && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                {gigWorker.location}
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleInviteGigWorker(gigWorker)}
                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                            >
                                                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                                                Invite
                                            </button>
                                            <Link
                                                href={`/gig-worker/${gigWorker.id}`}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Grid view
        return (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                            <img 
                                src={getProfilePhoto(gigWorker)} 
                                alt={getFullName(gigWorker)}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                    e.target.src = "/api/placeholder/80/80";
                                }}
                            />
                        </div>
                        <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">{gigWorker.average_rating || gigWorker.rating || '0.0'}</span>
                            <span className="ml-1 text-sm text-gray-500">({gigWorker.reviews_count || gigWorker.reviewCount || 0})</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                {getFullName(gigWorker)}
                            </h3>
                            <p className="text-gray-600 text-sm font-medium">{gigWorker.professional_title || gigWorker.title || 'Gig Worker'}</p>
                        </div>

                        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                                <BriefcaseIcon className="w-4 h-4 mr-1" />
                                {gigWorker.completed_projects || gigWorker.completedProjects || 0} projects
                            </span>
                            <span className="flex items-center">
                                <AcademicCapIcon className="w-4 h-4 mr-1" />
                                {gigWorker.experience_level || gigWorker.experienceLevel || 'Entry Level'}
                            </span>
                        </div>

                        {gigWorker.hourly_rate && (
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                <span className="font-medium">₱{gigWorker.hourly_rate}/hr</span>
                            </div>
                        )}

                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                            {gigWorker.bio || gigWorker.description || 'No description available.'}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                            {getSkills(gigWorker).slice(0, 4).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {skill}
                                </span>
                            ))}
                            {getSkills(gigWorker).length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{getSkills(gigWorker).length - 4}
                                </span>
                            )}
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                    Member since {getMemberSince(gigWorker)}
                                </div>
                                {gigWorker.location && (
                                    <div className="flex items-center">
                                        <MapPinIcon className="w-4 h-4 mr-1" />
                                        {gigWorker.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-2">
                        <button
                            onClick={() => handleInviteGigWorker(gigWorker)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                            Invite
                        </button>
                        <Link
                            href={`/gig-worker/${gigWorker.id}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    // Alias for backward compatibility
    const FreelancerCard = GigWorkerCard;

    // Calculate current page statistics
    const currentPageGigWorkers = gigWorkers?.length || 0;
    const currentPageSkills = gigWorkers ? gigWorkers.reduce((total, worker) => {
        const getSkills = (gigWorker) => {
            if (Array.isArray(gigWorker.skills)) {
                return gigWorker.skills;
            }
            return gigWorker.skills ? gigWorker.skills.split(',').map(s => s.trim()) : [];
        };
        return total + getSkills(worker).length;
    }, 0) : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Browse Gig Workers</h2>}
        >
            <Head title="Browse Gig Workers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Find the Perfect Gig Worker</h1>
                                <p className="text-blue-100">
                                    {stats ? (
                                        `Discover talented professionals from our community of ${stats.total_gig_workers || 0} gig workers`
                                    ) : (
                                        'Discover talented professionals from our community'
                                    )}
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex space-x-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{currentPageGigWorkers}</div>
                                    <div className="text-sm text-blue-100">Displayed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{currentPageSkills}</div>
                                    <div className="text-sm text-blue-100">Total Skills</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search gig workers by name, skills, or title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <FunnelIcon className="w-5 h-5 mr-2" />
                                Filters
                                {showFilters ? (
                                    <ChevronUpIcon className="w-4 h-4 ml-2" />
                                ) : (
                                    <ChevronDownIcon className="w-4 h-4 ml-2" />
                                )}
                            </button>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">View:</span>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <ListBulletIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Experience Level Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                                        <select
                                            value={filterBy.experienceLevel}
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, experienceLevel: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Levels</option>
                                            <option value="Entry Level">Entry Level</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                    </div>

                                    {/* Location Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            placeholder="Enter location..."
                                            value={filterBy.location}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            maxLength={50}
                                        />
                                    </div>

                                    {/* Min Hourly Rate */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Min Hourly Rate (₱)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Min rate..."
                                            value={filterBy.minHourlyRate}
                                            onChange={(e) => handleFilterChange('minHourlyRate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            min="0"
                                            max="10000"
                                        />
                                    </div>

                                    {/* Max Hourly Rate */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Hourly Rate (₱)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Max rate..."
                                            value={filterBy.maxHourlyRate}
                                            onChange={(e) => handleFilterChange('maxHourlyRate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            min="0"
                                            max="10000"
                                        />
                                    </div>
                                </div>

                                {/* Advanced Filters Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Minimum Rating Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Rating
                                        </label>
                                        <select
                                            value={filterBy.minRating}
                                            onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Any Rating</option>
                                            <option value="1">1+ Stars</option>
                                            <option value="2">2+ Stars</option>
                                            <option value="3">3+ Stars</option>
                                            <option value="4">4+ Stars</option>
                                            <option value="4.5">4.5+ Stars</option>
                                        </select>
                                    </div>

                                    {/* Availability Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Availability Status
                                        </label>
                                        <select
                                            value={filterBy.availabilityStatus}
                                            onChange={(e) => handleFilterChange('availabilityStatus', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Any Status</option>
                                            <option value="available">Available Now</option>
                                            <option value="busy">Busy</option>
                                            <option value="partially_available">Partially Available</option>
                                        </select>
                                    </div>

                                    {/* Projects Completed */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Projects Completed
                                        </label>
                                        <select
                                            value={filterBy.projectsCompleted}
                                            onChange={(e) => handleFilterChange('projectsCompleted', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Any Amount</option>
                                            <option value="0">New Gig Workers (0 projects)</option>
                                            <option value="1-5">1-5 Projects</option>
                                            <option value="6-10">6-10 Projects</option>
                                            <option value="11-25">11-25 Projects</option>
                                            <option value="26+">26+ Projects</option>
                                        </select>
                                    </div>

                                    {/* Response Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Response Time
                                        </label>
                                        <select
                                            value={filterBy.responseTime}
                                            onChange={(e) => handleFilterChange('responseTime', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Any Response Time</option>
                                            <option value="within_1_hour">Within 1 Hour</option>
                                            <option value="within_6_hours">Within 6 Hours</option>
                                            <option value="within_24_hours">Within 24 Hours</option>
                                            <option value="within_3_days">Within 3 Days</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Skills Filter */}
                                {availableSkills && availableSkills.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Skills
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSkills.slice(0, 20).map((skill) => {
                                                const isSelected = filterBy.skills && filterBy.skills.split(',').includes(skill);
                                                return (
                                                    <button
                                                        key={skill}
                                                        onClick={() => {
                                                            const currentSkills = filterBy.skills ? filterBy.skills.split(',') : [];
                                                            const skillExists = currentSkills.includes(skill);
                                                            let newSkills;
                                                            if (skillExists) {
                                                                newSkills = currentSkills.filter(s => s !== skill);
                                                            } else {
                                                                newSkills = [...currentSkills, skill];
                                                            }
                                                            handleFilterChange('skills', newSkills.join(','));
                                                        }}
                                                        className={`px-3 py-2 text-sm rounded-full transition-all duration-200 transform hover:scale-105 ${
                                                            isSelected
                                                                ? 'bg-blue-600 text-white shadow-lg'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                                        }`}
                                                    >
                                                        {skill}
                                                        {isSelected && (
                                                            <XMarkIcon className="w-3 h-3 ml-1 inline" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                            {availableSkills.length > 20 && (
                                                <span className="px-3 py-2 bg-gray-500 text-gray-500 text-sm rounded-full">
                                                    +{availableSkills.length - 20} more available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Sort Controls and Actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort by
                                            </label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            >
                                                <option value="name">Name</option>
                                                <option value="rating">Rating</option>
                                                <option value="hourly_rate">Hourly Rate</option>
                                                <option value="experience_level">Experience</option>
                                                <option value="created_at">Newest</option>
                                                <option value="completed_projects">Projects Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Order
                                            </label>
                                            <select
                                                value={sortOrder}
                                                onChange={(e) => setSortOrder(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            >
                                                <option value="asc">Ascending</option>
                                                <option value="desc">Descending</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Filter Actions */}
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={clearAllFilters}
                                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md hover:shadow-lg"
                                        >
                                            <XMarkIcon className="w-4 h-4 mr-2" />
                                            Clear All
                                        </button>
                                        <div className="text-sm text-gray-500">
                                            {activeFiltersCount > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                    {activeFiltersCount} active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Loading State */}
                    {loading && (
                        <div className="flex flex-col justify-center items-center py-16">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                                <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
                            </div>
                            <div className="mt-4 text-center">
                                <span className="text-lg font-medium text-gray-700">Loading gig workers...</span>
                                <p className="text-sm text-gray-500 mt-1">Finding the best matches for you</p>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                            <div className="flex items-start">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mr-3 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-red-800 mb-2">
                                        Error Loading Gig Workers
                                    </h3>
                                    <p className="text-red-700 mb-4">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && !error && (
                        <>
                            {/* Enhanced Results Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="text-gray-700">
                                    {pagination && pagination.total > 0 ? (
                                        <div>
                                            <span className="font-semibold">
                                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1}-{Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                                            </span>
                                            {activeFiltersCount > 0 && (
                                                <span className="text-sm text-gray-500 ml-2">
                                                    (filtered from {stats?.total_gig_workers || 'all'} total)
                                                </span>
                                            )}
                                        </div>
                                    ) : gigWorkers && gigWorkers.length > 0 ? (
                                        `Showing ${gigWorkers.length} gig workers`
                                    ) : (
                                        'No results to display'
                                    )}
                                </div>
                                
                                {/* Results per page selector */}
                                {pagination && pagination.total > 0 && (
                                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                        <span className="text-sm text-gray-600">Results per page:</span>
                                        <select
                                            value={pagination.per_page}
                                            onChange={(e) => {
                                                // Handle per page change
                                                const params = {
                                                    search: debouncedSearchTerm,
                                                    experience_level: filterBy.experienceLevel,
                                                    min_hourly_rate: debouncedMinRate,
                                                    max_hourly_rate: debouncedMaxRate,
                                                    location: debouncedLocation,
                                                    skills: filterBy.skills,
                                                    min_rating: debouncedMinRating,
                                                    sort_by: sortBy,
                                                    sort_order: sortOrder,
                                                    page: 1,
                                                    per_page: e.target.value,
                                                    availability_status: filterBy.availabilityStatus,
                                                    joined_date_range: filterBy.joinedDateRange,
                                                    projects_completed: filterBy.projectsCompleted,
                                                    response_time: filterBy.responseTime
                                                };
                                                
                                                const cleanParams = Object.fromEntries(
                                                    Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
                                                );
                                                
                                                fetchGigWorkers(cleanParams);
                                            }}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="12">12</option>
                                            <option value="24">24</option>
                                            <option value="48">48</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Gig Workers Grid/List */}
                            {gigWorkers.length > 0 ? (
                                <div className={viewMode === 'grid' 
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                                    : "space-y-6 mb-8"
                                }>
                                    {gigWorkers.map((gigWorker) => (
                                        <FreelancerCard 
                                            key={gigWorker.id} 
                                            freelancer={gigWorker} 
                                            viewMode={viewMode} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No gig workers found</h3>
                                    <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="flex items-center justify-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    
                                    {[...Array(Math.min(5, pagination.last_page))].map((_, index) => {
                                        const pageNumber = Math.max(1, pagination.current_page - 2) + index;
                                        if (pageNumber > pagination.last_page) return null;
                                        
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                    pageNumber === pagination.current_page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Invitation Modal */}
            <InvitationModal
                isOpen={invitationModal.isOpen}
                onClose={() => setInvitationModal({ isOpen: false, freelancer: null })}
                onConfirm={handleSendInvitation}
                gigWorker={invitationModal.freelancer}
                isLoading={invitationLoading}
            />
        </AuthenticatedLayout>
    );