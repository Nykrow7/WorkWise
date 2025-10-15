import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectsIndex({ projects }) {
    const { auth } = usePage().props;
    const isEmployer = auth.user.user_type === 'employer';

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            disputed: 'bg-yellow-100 text-yellow-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            active: '🔄',
            completed: '✅',
            cancelled: '❌',
            disputed: '⚠️'
        };
        return icons[status] || '📋';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        My Projects
                    </h2>
                    <div className="text-sm text-gray-600">
                        {projects.data.length} project{projects.data.length !== 1 ? 's' : ''}
                    </div>
                </div>
            }
        >
            <Head title="My Projects" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Page Banner */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="px-8 py-6 text-white relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                                        <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {isEmployer ? 'Project Management' : 'My Active Projects'}
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        {isEmployer 
                                            ? 'Track and manage your ongoing projects with talented gig workers'
                                            : 'Monitor your project progress and collaborate with employers'
                                        }
                                    </p>
                                    <div className="flex items-center mt-4 space-x-6">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm">
                                                Total Projects: {projects.data.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">
                                                Active: {projects.data.filter(p => p.status === 'active').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                        </div>
                    </div>

                    {projects.data.length === 0 ? (
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-6 text-center">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No projects yet
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {isEmployer
                                        ? "Start by posting a job to find talented gig workers."
                                        : "Browse available jobs and submit proposals to get started."
                                    }
                                </p>
                                <Link
                                    href={isEmployer ? "/jobs/create" : "/jobs"}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    {isEmployer ? "Post a Job" : "Browse Jobs"}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {projects.data.map((project) => (
                                <div key={project.id} className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <span className="text-2xl">{getStatusIcon(project.status)}</span>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            <Link 
                                                                href={`/projects/${project.id}`}
                                                                className="hover:text-blue-600 transition-colors"
                                                            >
                                                                {project.job.title}
                                                            </Link>
                                                        </h3>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span>
                                                                {isEmployer ? 'Gig Worker:' : 'Employer:'}
                                                                <span className="font-medium ml-1">
                                                                    {isEmployer
                                                                        ? `${project.gig_worker.first_name} ${project.gig_worker.last_name}`
                                                                        : `${project.employer.first_name} ${project.employer.last_name}`
                                                                    }
                                                                </span>
                                                            </span>
                                                            <span>•</span>
                                                            <span>Started {formatDistanceToNow(new Date(project.started_at))} ago</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                                        <div className="text-sm text-blue-600 font-medium">Project Value</div>
                                                        <div className="text-lg font-semibold text-green-600">
                                                            ₱{project.agreed_amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                                        <div className="text-sm text-blue-600 font-medium">Duration</div>
                                                        <div className="text-lg font-semibold">
                                                            {project.agreed_duration_days} days
                                                        </div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                                        <div className="text-sm text-blue-600 font-medium">Deadline</div>
                                                        <div className="text-lg font-semibold">
                                                            {project.deadline 
                                                                ? new Date(project.deadline).toLocaleDateString()
                                                                : 'Not set'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                {project.job.description && (
                                                    <p className="text-gray-700 mb-4 line-clamp-2 break-all">
                                                        {project.job.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold shadow-md ${getStatusBadge(project.status)}`}>
                                                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                        </span>
                                                        {project.payment_released && (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold shadow-md bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                                                                 Payment Released
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {project.transactions && project.transactions.length > 0 && (
                                                            <Link
                                                                href="/payment/history"
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                💳 View Payments
                                                            </Link>
                                                        )}
                                                        <Link
                                                            href={`/projects/${project.id}`}
                                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {projects.links && projects.links.length > 3 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {projects.prev_page_url && (
                                            <Link
                                                href={projects.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {projects.next_page_url && (
                                            <Link
                                                href={projects.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{projects.from}</span> to{' '}
                                                <span className="font-medium">{projects.to}</span> of{' '}
                                                <span className="font-medium">{projects.total}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                {projects.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                            index === projects.links.length - 1 ? 'rounded-r-md' : ''
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
            </div>

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
