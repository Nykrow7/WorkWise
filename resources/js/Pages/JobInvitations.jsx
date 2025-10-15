import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
    DocumentTextIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    ClockIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    StarIcon,
    BookmarkIcon,
    ShareIcon,
    XMarkIcon,
    CheckIcon,
    EyeIcon,
    CalendarDaysIcon,
    BriefcaseIcon,
    TagIcon,
    FireIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    AdjustmentsHorizontalIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    GlobeAltIcon,
    HomeIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';

export default function JobInvitations({ auth, jobInvitations = [] }) {
    const { user } = auth;

    // State management
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('received_date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterBy, setFilterBy] = useState({
        workType: 'all',
        location: 'all',
        compensationRange: 'all',
        deadline: 'all',
        skills: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [realJobInvitations, setRealJobInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock enhanced job invitations data for demonstration
    const mockJobInvitations = [
        {
            id: 1,
            title: "Senior Full-Stack Developer for E-commerce Platform",
            company: {
                name: "TechCorp Solutions",
                logo: "/api/placeholder/60/60",
                size: "50-200 employees",
                industry: "Technology"
            },
            description: "We're looking for an experienced full-stack developer to join our team and help build the next generation of our e-commerce platform. You'll work with React, Node.js, and PostgreSQL to create scalable solutions.",
            location: {
                type: "remote",
                city: "Manila",
                country: "Philippines"
            },
            workType: "full-time",
            compensation: {
                min: 80000,
                max: 120000,
                currency: "PHP",
                period: "monthly",
                benefits: ["Health Insurance", "13th Month Pay", "Flexible Hours"]
            },
            requiredSkills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS"],
            experienceLevel: "Senior",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: "pending",
            urgency: "high",
            matchScore: 95,
            estimatedDuration: "6 months",
            employerName: "Sarah Johnson",
            employerRating: 4.8,
            projectsCompleted: 23
        },
        {
            id: 2,
            title: "UI/UX Designer for Mobile App",
            company: {
                name: "Creative Studio Inc",
                logo: "/api/placeholder/60/60",
                size: "10-50 employees",
                industry: "Design"
            },
            description: "Join our creative team to design intuitive and beautiful mobile applications. We're working on several exciting projects in fintech and healthcare sectors.",
            location: {
                type: "hybrid",
                city: "Makati",
                country: "Philippines"
            },
            workType: "contract",
            compensation: {
                min: 60000,
                max: 90000,
                currency: "PHP",
                period: "monthly",
                benefits: ["Performance Bonus", "Creative Freedom"]
            },
            requiredSkills: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research"],
            experienceLevel: "Mid-level",
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            status: "pending",
            urgency: "medium",
            matchScore: 88,
            estimatedDuration: "3 months",
            employerName: "Michael Chen",
            employerRating: 4.6,
            projectsCompleted: 15
        },
        {
            id: 3,
            title: "DevOps Engineer - Cloud Infrastructure",
            company: {
                name: "CloudTech Innovations",
                logo: "/api/placeholder/60/60",
                size: "200+ employees",
                industry: "Cloud Services"
            },
            description: "We need a skilled DevOps engineer to help us scale our cloud infrastructure. Experience with Kubernetes, Docker, and AWS is essential.",
            location: {
                type: "onsite",
                city: "BGC, Taguig",
                country: "Philippines"
            },
            workType: "full-time",
            compensation: {
                min: 100000,
                max: 150000,
                currency: "PHP",
                period: "monthly",
                benefits: ["Stock Options", "Health Insurance", "Learning Budget"]
            },
            requiredSkills: ["Kubernetes", "Docker", "AWS", "Terraform", "Python"],
            experienceLevel: "Senior",
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            status: "pending",
            urgency: "high",
            matchScore: 92,
            estimatedDuration: "Permanent",
            employerName: "Lisa Rodriguez",
            employerRating: 4.9,
            projectsCompleted: 31
        }
    ];

    // Fetch job invitations from API
     useEffect(() => {
         const fetchJobInvitations = async () => {
             try {
                 setLoading(true);
                 setError(null);
                 const response = await axios.get('/api/gig-worker/job-invitations');
                 
                 if (response.data.success) {
                     const invitations = response.data.data || [];
                     
                     // Transform API data to match our component structure
                     const transformedInvitations = invitations.map(invitation => ({
                         id: invitation.id,
                         title: invitation.job?.title || 'Untitled Job',
                         company: {
                             name: invitation.job?.employer?.company_name || invitation.job?.employer?.name || 'Unknown Company',
                             logo: invitation.job?.employer?.avatar || '/api/placeholder/60/60',
                             size: invitation.job?.employer?.company_size || 'Unknown',
                             industry: invitation.job?.category?.name || 'General'
                         },
                         description: invitation.job?.description || 'No description available',
                         location: {
                             type: invitation.job?.location_type || 'remote',
                             city: invitation.job?.location || 'Remote',
                             country: 'Philippines'
                         },
                         workType: invitation.job?.job_type || 'contract',
                         compensation: {
                             min: invitation.job?.budget_min || 0,
                             max: invitation.job?.budget_max || invitation.job?.budget_min || 0,
                             currency: 'PHP',
                             period: invitation.job?.payment_type || 'project',
                             benefits: []
                         },
                         requiredSkills: invitation.job?.required_skills ? invitation.job.required_skills.split(',').map(s => s.trim()) : [],
                         experienceLevel: invitation.job?.experience_level || 'Mid-level',
                         deadline: invitation.job?.deadline ? new Date(invitation.job.deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                         receivedAt: new Date(invitation.sent_at),
                         status: invitation.status || 'pending',
                         urgency: invitation.job?.urgency || 'medium',
                         matchScore: invitation.match_score || 85,
                         estimatedDuration: invitation.job?.duration || 'To be discussed',
                         employerName: invitation.employer?.name || 'Unknown Employer',
                         employerRating: invitation.employer?.rating || 4.5,
                         projectsCompleted: invitation.employer?.completed_projects || 0,
                         message: invitation.message
                     }));
                     
                     setRealJobInvitations(transformedInvitations);
                 } else {
                     throw new Error(response.data.message || 'Failed to fetch job invitations');
                 }
             } catch (err) {
                 console.error('Error fetching job invitations:', err);
                 const errorMessage = err.response?.data?.message || 'Failed to load job invitations. Please refresh the page.';
                 setError(errorMessage);
                 // Fallback to mock data on error for development
                 if (process.env.NODE_ENV === 'development') {
                     setRealJobInvitations(mockJobInvitations);
                 }
             } finally {
                 setLoading(false);
             }
         };

         fetchJobInvitations();
     }, []);

    // Use real data or fallback to mock data
    const enhancedJobInvites = useMemo(() => {
        if (realJobInvitations.length > 0) {
            return realJobInvitations;
        }
        return jobInvitations.length > 0 ? jobInvitations : mockJobInvitations;
    }, [realJobInvitations, jobInvitations]);

    // Filtering and sorting logic
    const filteredAndSortedInvitations = useMemo(() => {
        let filtered = enhancedJobInvites.filter(invitation => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = 
                    invitation.title.toLowerCase().includes(searchLower) ||
                    invitation.company.name.toLowerCase().includes(searchLower) ||
                    invitation.description.toLowerCase().includes(searchLower) ||
                    invitation.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower));
                
                if (!matchesSearch) return false;
            }

            // Work type filter
            if (filterBy.workType !== 'all' && invitation.workType !== filterBy.workType) {
                return false;
            }

            // Location filter
            if (filterBy.location !== 'all' && invitation.location.type !== filterBy.location) {
                return false;
            }

            // Compensation range filter
            if (filterBy.compensationRange !== 'all') {
                const minComp = invitation.compensation.min;
                switch (filterBy.compensationRange) {
                    case 'under-50k':
                        if (minComp >= 50000) return false;
                        break;
                    case '50k-100k':
                        if (minComp < 50000 || minComp >= 100000) return false;
                        break;
                    case '100k-150k':
                        if (minComp < 100000 || minComp >= 150000) return false;
                        break;
                    case 'over-150k':
                        if (minComp < 150000) return false;
                        break;
                }
            }

            // Deadline filter
            if (filterBy.deadline !== 'all') {
                const daysUntilDeadline = differenceInDays(invitation.deadline, new Date());
                switch (filterBy.deadline) {
                    case 'urgent':
                        if (daysUntilDeadline > 3) return false;
                        break;
                    case 'this-week':
                        if (daysUntilDeadline > 7) return false;
                        break;
                    case 'this-month':
                        if (daysUntilDeadline > 30) return false;
                        break;
                }
            }

            return true;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'received_date':
                    aValue = new Date(a.receivedAt);
                    bValue = new Date(b.receivedAt);
                    break;
                case 'deadline':
                    aValue = new Date(a.deadline);
                    bValue = new Date(b.deadline);
                    break;
                case 'compensation':
                    aValue = a.compensation.max;
                    bValue = b.compensation.max;
                    break;
                case 'match_score':
                    aValue = a.matchScore;
                    bValue = b.matchScore;
                    break;
                case 'company':
                    aValue = a.company.name.toLowerCase();
                    bValue = b.company.name.toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [enhancedJobInvites, searchTerm, filterBy, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedInvitations.length / itemsPerPage);
    const paginatedInvitations = filteredAndSortedInvitations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Get urgency color
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Get location icon
    const getLocationIcon = (type) => {
        switch (type) {
            case 'remote': return GlobeAltIcon;
            case 'onsite': return BuildingOfficeIcon;
            case 'hybrid': return ComputerDesktopIcon;
            default: return MapPinIcon;
        }
    };

    // Countdown timer component
    const CountdownTimer = ({ deadline }) => {
        const [timeLeft, setTimeLeft] = useState('');

        useEffect(() => {
            const timer = setInterval(() => {
                const now = new Date();
                const difference = deadline - now;

                if (difference > 0) {
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

                    if (days > 0) {
                        setTimeLeft(`${days}d ${hours}h`);
                    } else if (hours > 0) {
                        setTimeLeft(`${hours}h ${minutes}m`);
                    } else {
                        setTimeLeft(`${minutes}m`);
                    }
                } else {
                    setTimeLeft('Expired');
                }
            }, 1000);

            return () => clearInterval(timer);
        }, [deadline]);

        const isUrgent = differenceInDays(deadline, new Date()) <= 3;

        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                isUrgent ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'
            }`}>
                <ClockIcon className="w-3 h-3 mr-1" />
                {timeLeft}
            </span>
        );
    };

    // Job Invitation Card Component
    const JobInvitationCard = ({ invitation, viewMode }) => {
        const LocationIcon = getLocationIcon(invitation.location.type);

        if (viewMode === 'list') {
            return (
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-start space-x-4">
                                <img 
                                    src={invitation.company.logo} 
                                    alt={invitation.company.name}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                            {invitation.title}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(invitation.urgency)}`}>
                                                {invitation.urgency.toUpperCase()}
                                            </span>
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {invitation.matchScore}% Match
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                        <span className="flex items-center">
                                            <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                                            {invitation.company.name}
                                        </span>
                                        <span className="flex items-center">
                                            <LocationIcon className="w-4 h-4 mr-1" />
                                            {invitation.location.city} • {invitation.location.type}
                                        </span>
                                        <span className="flex items-center">
                                            <BriefcaseIcon className="w-4 h-4 mr-1" />
                                            {invitation.workType}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 mb-4 line-clamp-2">
                                        {invitation.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-lg font-semibold text-green-600">
                                                {formatCurrency(invitation.compensation.min)} - {formatCurrency(invitation.compensation.max)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                per {invitation.compensation.period}
                                            </span>
                                        </div>
                                        <CountdownTimer deadline={invitation.deadline} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-6">
                            <div className="flex space-x-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <BookmarkIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {invitation.status === 'pending' ? (
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                                        className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Decline
                                    </button>
                                    <button 
                                        onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Accept
                                    </button>
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-sm text-center rounded-lg bg-gray-100 text-gray-600">
                                    {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
                                </div>
                            )}
                            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Grid view
        return (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                    <img 
                        src={invitation.company.logo} 
                        alt={invitation.company.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(invitation.urgency)}`}>
                            {invitation.urgency.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {invitation.matchScore}% Match
                        </span>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
                    {invitation.title}
                </h3>

                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{invitation.company.name}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <LocationIcon className="w-4 h-4" />
                    <span>{invitation.location.city} • {invitation.location.type}</span>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {invitation.description}
                </p>

                <div className="mb-4">
                    <div className="text-lg font-semibold text-green-600 mb-1">
                        {formatCurrency(invitation.compensation.min)} - {formatCurrency(invitation.compensation.max)}
                    </div>
                    <div className="text-sm text-gray-500">
                        per {invitation.compensation.period}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-1">
                        {invitation.requiredSkills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                {skill}
                            </span>
                        ))}
                        {invitation.requiredSkills.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                +{invitation.requiredSkills.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <CountdownTimer deadline={invitation.deadline} />
                    <div className="flex space-x-1">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <BookmarkIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <ShareIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {invitation.status === 'pending' ? (
                    <>
                        <div className="flex space-x-2 mb-2">
                            <button 
                                onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                                className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Accept
                            </button>
                        </div>
                        <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Details
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mb-2 px-3 py-2 text-sm text-center rounded-lg bg-gray-100 text-gray-600">
                            {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
                        </div>
                        <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Details
                        </button>
                    </>
                )}
            </div>
        );
    };

    // Handle invitation response
     const handleInvitationResponse = async (invitationId, response) => {
         try {
             setLoading(true);
             const apiResponse = await axios.patch(`/api/gig-worker/job-invitations/${invitationId}/respond`, {
                 response: response === 'accepted' ? 'accept' : 'decline'
             });
             
             if (apiResponse.data.success) {
                 // Update local state
                 setRealJobInvitations(prev => 
                     prev.map(inv => 
                         inv.id === invitationId 
                             ? { ...inv, status: response === 'accepted' ? 'accepted' : 'declined' }
                             : inv
                     )
                 );
                 
                 // Show success feedback
                 const successMessage = response === 'accepted' 
                     ? 'Job invitation accepted successfully!' 
                     : 'Job invitation declined successfully!';
                 
                 // You could add a toast notification here
                 console.log(successMessage);
                 setError(null);
             } else {
                 throw new Error(apiResponse.data.message || 'Failed to respond to invitation');
             }
         } catch (err) {
             console.error('Error responding to invitation:', err);
             const errorMessage = err.response?.data?.message || 'Failed to respond to invitation. Please try again.';
             setError(errorMessage);
         } finally {
             setLoading(false);
         }
     };

    // Clear all filters
    const clearAllFilters = () => {
        setFilterBy({
            workType: 'all',
            location: 'all',
            compensationRange: 'all',
            deadline: 'all',
            skills: []
        });
        setSearchTerm('');
        setCurrentPage(1);
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Job Invitations
                    </h2>
                    <Link
                        href="/gig-worker/dashboard"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Job Invitations" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 mb-8">
                        <div className="px-6 py-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <DocumentTextIcon className="w-8 h-8 mr-3 text-purple-500" />
                                        Job Invitations
                                        <span className="ml-3 px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                                            {filteredAndSortedInvitations.length} invitations
                                        </span>
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        Review and respond to job invitations from employers
                                    </p>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    {/* View Mode Toggle */}
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md transition-colors ${
                                                viewMode === 'grid' 
                                                    ? 'bg-white text-blue-600 shadow-sm' 
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <Squares2X2Icon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md transition-colors ${
                                                viewMode === 'list' 
                                                    ? 'bg-white text-blue-600 shadow-sm' 
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <ListBulletIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Controls */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                                {/* Search Bar */}
                                <div className="relative flex-1 max-w-md">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search invitations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center space-x-4">
                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                                setSortBy(newSortBy);
                                                setSortOrder(newSortOrder);
                                            }}
                                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="received_date-desc">Newest First</option>
                                            <option value="received_date-asc">Oldest First</option>
                                            <option value="deadline-asc">Deadline (Urgent First)</option>
                                            <option value="deadline-desc">Deadline (Latest First)</option>
                                            <option value="compensation-desc">Highest Pay</option>
                                            <option value="compensation-asc">Lowest Pay</option>
                                            <option value="match_score-desc">Best Match</option>
                                            <option value="company-asc">Company A-Z</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Filter Toggle */}
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                                            showFilters 
                                                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <FunnelIcon className="w-5 h-5 mr-2" />
                                        Filters
                                    </button>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            {showFilters && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Work Type Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Work Type
                                            </label>
                                            <select
                                                value={filterBy.workType}
                                                onChange={(e) => setFilterBy({...filterBy, workType: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="full-time">Full-time</option>
                                                <option value="part-time">Part-time</option>
                                                <option value="contract">Contract</option>
                                                <option value="freelance">Freelance</option>
                                            </select>
                                        </div>

                                        {/* Location Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location
                                            </label>
                                            <select
                                                value={filterBy.location}
                                                onChange={(e) => setFilterBy({...filterBy, location: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All Locations</option>
                                                <option value="remote">Remote</option>
                                                <option value="onsite">On-site</option>
                                                <option value="hybrid">Hybrid</option>
                                            </select>
                                        </div>

                                        {/* Compensation Range Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Compensation Range
                                            </label>
                                            <select
                                                value={filterBy.compensationRange}
                                                onChange={(e) => setFilterBy({...filterBy, compensationRange: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All Ranges</option>
                                                <option value="under-50k">Under ₱50,000</option>
                                                <option value="50k-100k">₱50,000 - ₱100,000</option>
                                                <option value="100k-150k">₱100,000 - ₱150,000</option>
                                                <option value="over-150k">Over ₱150,000</option>
                                            </select>
                                        </div>

                                        {/* Deadline Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Deadline
                                            </label>
                                            <select
                                                value={filterBy.deadline}
                                                onChange={(e) => setFilterBy({...filterBy, deadline: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All Deadlines</option>
                                                <option value="urgent">Urgent (3 days)</option>
                                                <option value="this-week">This Week</option>
                                                <option value="this-month">This Month</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                                        >
                                            <XMarkIcon className="w-4 h-4 mr-1" />
                                            Clear All Filters
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            {filteredAndSortedInvitations.length} of {enhancedJobInvites.length} invitations
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 mb-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading job invitations...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Summary */}
                    {!loading && (
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Showing {paginatedInvitations.length} of {filteredAndSortedInvitations.length} invitations
                                {searchTerm && ` for "${searchTerm}"`}
                            </p>
                        </div>
                    )}

                    {/* Job Invitations Grid/List */}
                    {!loading && paginatedInvitations.length > 0 ? (
                        <div className={`${
                            viewMode === 'grid' 
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                                : 'space-y-6'
                        } mb-8`}>
                            {paginatedInvitations.map((invitation) => (
                                <JobInvitationCard 
                                    key={invitation.id} 
                                    invitation={invitation} 
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    ) : filteredAndSortedInvitations.length === 0 && enhancedJobInvites.length > 0 ? (
                        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                            <FunnelIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium">No invitations match your filters</p>
                            <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
                            <button
                                onClick={clearAllFilters}
                                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium">No pending job invitations</p>
                            <p className="text-gray-400 text-sm mt-2">Complete your profile to receive more invitations</p>
                            <Link 
                                href="/profile" 
                                className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Complete Profile
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 border rounded-lg ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}