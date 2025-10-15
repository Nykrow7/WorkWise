import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    StarIcon, 
    MapPinIcon, 
    ClockIcon, 
    CurrencyDollarIcon,
    BriefcaseIcon,
    UserIcon,
    GlobeAltIcon,
    CheckBadgeIcon,
    CalendarIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function Profile({ auth, gigWorker }) {
    // Helper function to render star ratings
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <div key={i} className="relative">
                        <StarIcon className="w-5 h-5 text-gray-300" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                            <StarIconSolid className="w-5 h-5 text-yellow-400" />
                        </div>
                    </div>
                );
            } else {
                stars.push(
                    <StarIcon key={i} className="w-5 h-5 text-gray-300" />
                );
            }
        }
        return stars;
    };

    // Helper function to format experience level
    const formatExperienceLevel = (level) => {
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gig Worker Profile
                    </h2>
                    <Link
                        href="/ai/recommendations"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        ← Back to Recommendations
                    </Link>
                </div>
            }
        >
            <Head title={`${gigWorker.name} - Profile`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg mb-8">
                        <div className="relative">
                            {/* Cover Background */}
                            <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            
                            {/* Profile Content */}
                            <div className="relative px-6 pb-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 sm:-mt-12">
                                    {/* Profile Photo */}
                                    <div className="relative">
                                        {gigWorker.avatar ? (
                                            <img
                                                src={gigWorker.avatar}
                                                alt={gigWorker.name}
                                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                                                <UserIcon className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                                            <CheckBadgeIcon className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h1 className="text-3xl font-bold text-gray-900">{gigWorker.name}</h1>
                                                <p className="text-xl text-gray-600 mt-1">{gigWorker.professional_title}</p>
                                                
                                                {/* Rating and Reviews */}
                                                <div className="flex items-center mt-2">
                                                    <div className="flex items-center">
                                                        {renderStars(gigWorker.rating)}
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {gigWorker.rating} ({gigWorker.review_count} reviews)
                                                    </span>
                                                </div>

                                                {/* Location */}
                                                <div className="flex items-center mt-2 text-gray-600">
                                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                                    <span className="text-sm">{gigWorker.location}</span>
                                                </div>
                                            </div>

                                            {/* Hourly Rate */}
                                            <div className="mt-4 sm:mt-0 text-right">
                                                <div className="text-3xl font-bold text-green-600">
                                                    {formatCurrency(gigWorker.hourly_rate)}
                                                </div>
                                                <div className="text-sm text-gray-600">per hour</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About Section */}
                            <div className="bg-white shadow-xl rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
                                <p className="text-gray-700 leading-relaxed">{gigWorker.bio}</p>
                            </div>

                            {/* Skills Section */}
                            <div className="bg-white shadow-xl rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {gigWorker.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            {gigWorker.reviews && gigWorker.reviews.length > 0 && (
                                <div className="bg-white shadow-xl rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                                    <div className="space-y-4">
                                        {gigWorker.reviews.map((review) => (
                                            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {review.reviewer.avatar ? (
                                                            <img
                                                                src={review.reviewer.avatar}
                                                                alt={review.reviewer.name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <UserIcon className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-gray-900">{review.reviewer.name}</h4>
                                                            <div className="flex items-center">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 mt-1">{review.comment}</p>
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white shadow-xl rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">Experience</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatExperienceLevel(gigWorker.experience_level)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CheckBadgeIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">Completed Projects</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {gigWorker.completed_projects}
                                        </span>
                                    </div>

                                    {gigWorker.completion_rate && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <ChartBarIcon className="w-5 h-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-600">Success Rate</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {Math.round(gigWorker.completion_rate)}%
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">Member Since</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(gigWorker.member_since).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Languages */}
                            {gigWorker.languages && gigWorker.languages.length > 0 && (
                                <div className="bg-white shadow-xl rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <GlobeAltIcon className="w-5 h-5 mr-2" />
                                        Languages
                                    </h3>
                                    <div className="space-y-2">
                                        {gigWorker.languages.map((language, index) => (
                                            <div key={index} className="text-sm text-gray-700">
                                                {language}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Portfolio Link */}
                            {gigWorker.portfolio_url && (
                                <div className="bg-white shadow-xl rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                                    <a
                                        href={gigWorker.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full justify-center"
                                    >
                                        <GlobeAltIcon className="w-4 h-4 mr-2" />
                                        View Portfolio
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}