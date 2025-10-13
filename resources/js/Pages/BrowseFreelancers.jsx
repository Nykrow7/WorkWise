import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
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
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function BrowseFreelancers({ auth }) {
    // State management
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
        minRating: ''
    });

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

    // Debounced fetch effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchGigWorkers({
                search: searchTerm,
                experience_level: filterBy.experienceLevel,
                min_hourly_rate: filterBy.minHourlyRate,
                max_hourly_rate: filterBy.maxHourlyRate,
                location: filterBy.location,
                skills: filterBy.skills,
                min_rating: filterBy.minRating,
                sort_by: sortBy,
                sort_order: sortOrder,
                page: 1
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterBy, sortBy, sortOrder, fetchGigWorkers]);

    // Handle page changes
    const handlePageChange = useCallback((page) => {
        fetchGigWorkers({
            search: searchTerm,
            experience_level: filterBy.experienceLevel,
            min_hourly_rate: filterBy.minHourlyRate,
            max_hourly_rate: filterBy.maxHourlyRate,
            location: filterBy.location,
            skills: filterBy.skills,
            min_rating: filterBy.minRating,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page
        });
    }, [searchTerm, filterBy, sortBy, sortOrder, fetchGigWorkers]);

    // Gig Worker Profile Card Component
    const FreelancerCard = ({ freelancer, viewMode }) => {
        // Helper function to get full name
        const getFullName = (freelancer) => {
            return `${freelancer.first_name || ''} ${freelancer.last_name || ''}`.trim() || freelancer.name || 'Unknown User';
        };

        // Helper function to get profile photo
        const getProfilePhoto = (freelancer) => {
            return freelancer.profile_photo || freelancer.avatar || "/api/placeholder/80/80";
        };

        // Helper function to get skills array
        const getSkills = (freelancer) => {
            if (Array.isArray(freelancer.skills)) {
                return freelancer.skills;
            }
            return freelancer.skills ? freelancer.skills.split(',').map(s => s.trim()) : [];
        };

        // Helper function to format member since date
        const getMemberSince = (freelancer) => {
            const date = freelancer.created_at || freelancer.memberSince;
            if (!date) return 'Recently joined';
            try {
                return format(new Date(date), 'MMM yyyy');
            } catch {
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
                                        src={getProfilePhoto(freelancer)} 
                                        alt={getFullName(freelancer)}
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
                                                {getFullName(freelancer)}
                                            </h3>
                                            <p className="text-gray-600 font-medium">{freelancer.professional_title || freelancer.title || 'Gig Worker'}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-sm font-medium">{freelancer.average_rating || freelancer.rating || '0.0'}</span>
                                            <span className="ml-1 text-sm text-gray-500">({freelancer.reviews_count || freelancer.reviewCount || 0})</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                        <span className="flex items-center">
                                            <BriefcaseIcon className="w-4 h-4 mr-1" />
                                            {freelancer.completed_projects || freelancer.completedProjects || 0} projects completed
                                        </span>
                                        <span className="flex items-center">
                                            <AcademicCapIcon className="w-4 h-4 mr-1" />
                                            {freelancer.experience_level || freelancer.experienceLevel || 'Entry Level'}
                                        </span>
                                        {freelancer.hourly_rate && (
                                            <span className="flex items-center">
                                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                ₱{freelancer.hourly_rate}/hr
                                            </span>
                                        )}
                                        <span className="flex items-center">
                                            <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                            Member since {getMemberSince(freelancer)}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 mb-4 line-clamp-2">
                                        {freelancer.bio || freelancer.description || 'No description available.'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {getSkills(freelancer).slice(0, 6).map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                        {getSkills(freelancer).length > 6 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{getSkills(freelancer).length - 6} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {freelancer.location && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                {freelancer.location}
                                            </div>
                                        )}
                                        <Link
                                            href={`/freelancer/${freelancer.id}`}
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
            );
        }

        // Grid view
        return (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                            <img 
                                src={getProfilePhoto(freelancer)} 
                                alt={getFullName(freelancer)}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                    e.target.src = "/api/placeholder/80/80";
                                }}
                            />
                        </div>
                        <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">{freelancer.average_rating || freelancer.rating || '0.0'}</span>
                            <span className="ml-1 text-sm text-gray-500">({freelancer.reviews_count || freelancer.reviewCount || 0})</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                {getFullName(freelancer)}
                            </h3>
                            <p className="text-gray-600 text-sm font-medium">{freelancer.professional_title || freelancer.title || 'Gig Worker'}</p>
                        </div>

                        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                                <BriefcaseIcon className="w-4 h-4 mr-1" />
                                {freelancer.completed_projects || freelancer.completedProjects || 0} projects
                            </span>
                            <span className="flex items-center">
                                <AcademicCapIcon className="w-4 h-4 mr-1" />
                                {freelancer.experience_level || freelancer.experienceLevel || 'Entry Level'}
                            </span>
                        </div>

                        {freelancer.hourly_rate && (
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                <span className="font-medium">₱{freelancer.hourly_rate}/hr</span>
                            </div>
                        )}

                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                            {freelancer.bio || freelancer.description || 'No description available.'}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                            {getSkills(freelancer).slice(0, 4).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {skill}
                                </span>
                            ))}
                            {getSkills(freelancer).length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{getSkills(freelancer).length - 4}
                                </span>
                            )}
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                    Member since {getMemberSince(freelancer)}
                                </div>
                                {freelancer.location && (
                                    <div className="flex items-center">
                                        <MapPinIcon className="w-4 h-4 mr-1" />
                                        {freelancer.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <Link
                            href={`/freelancer/${freelancer.id}`}
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

    // Calculate current page statistics
    const currentPageGigWorkers = gigWorkers?.length || 0;
    const currentPageSkills = gigWorkers ? gigWorkers.reduce((total, worker) => {
        const getSkills = (freelancer) => {
            if (Array.isArray(freelancer.skills)) {
                return freelancer.skills;
            }
            return freelancer.skills ? freelancer.skills.split(',').map(s => s.trim()) : [];
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
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Hourly Rate Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Hourly Rate (₱)</label>
                                        <input
                                            type="number"
                                            placeholder="Min rate..."
                                            value={filterBy.minHourlyRate}
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, minHourlyRate: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Hourly Rate (₱)</label>
                                        <input
                                            type="number"
                                            placeholder="Max rate..."
                                            value={filterBy.maxHourlyRate}
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, maxHourlyRate: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Second row for additional filters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {/* Minimum Rating Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                                        <select
                                            value={filterBy.minRating}
                                            onChange={(e) => setFilterBy(prev => ({ ...prev, minRating: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Any Rating</option>
                                            <option value="1">1+ Stars</option>
                                            <option value="2">2+ Stars</option>
                                            <option value="3">3+ Stars</option>
                                            <option value="4">4+ Stars</option>
                                            <option value="4.5">4.5+ Stars</option>
                                        </select>
                                    </div>

                                    {/* Clear Filters Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => {
                                                setFilterBy({
                                                    experienceLevel: '',
                                                    minHourlyRate: '',
                                                    maxHourlyRate: '',
                                                    location: '',
                                                    skills: '',
                                                    minRating: ''
                                                });
                                                setSearchTerm('');
                                            }}
                                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                </div>

                                {/* Skills Filter */}
                                {availableSkills && availableSkills.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSkills.slice(0, 20).map((skill) => (
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
                                                        setFilterBy(prev => ({ ...prev, skills: newSkills.join(',') }));
                                                    }}
                                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                        filterBy.skills && filterBy.skills.split(',').includes(skill)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sort Controls */}
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="name">Name</option>
                                            <option value="rating">Rating</option>
                                            <option value="hourly_rate">Hourly Rate</option>
                                            <option value="experience_level">Experience</option>
                                            <option value="created_at">Newest</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="asc">Ascending</option>
                                            <option value="desc">Descending</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading gig workers...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                                <span className="text-red-800">Error loading gig workers: {error}</span>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && !error && (
                        <>
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-gray-600">
                                    {pagination && pagination.total > 0 ? (
                                        `Showing ${((pagination.current_page - 1) * pagination.per_page) + 1}-${Math.min(pagination.current_page * pagination.per_page, pagination.total)} of ${pagination.total} results`
                                    ) : gigWorkers && gigWorkers.length > 0 ? (
                                        `Showing ${gigWorkers.length} gig workers`
                                    ) : (
                                        'No results to display'
                                    )}
                                </div>
                            </div>

                            {/* Gig Workers Grid/List */}
                            {gigWorkers.length > 0 ? (
                                <div className={viewMode === 'grid' 
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                                    : "space-y-6 mb-8"
                                }>
                                    {gigWorkers.map((freelancer) => (
                                        <FreelancerCard 
                                            key={freelancer.id} 
                                            freelancer={freelancer} 
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
        </AuthenticatedLayout>
    );
}