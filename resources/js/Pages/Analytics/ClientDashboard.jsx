import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ClipboardDocumentListIcon,
    UserGroupIcon,
    BriefcaseIcon,
    ArrowTrendingUpIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ClientDashboard({ overview, monthly_spending, recent_projects, hiring_insights }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
        const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            purple: 'bg-purple-500',
            indigo: 'bg-indigo-500'
        };

        return (
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                <div className="p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className={`w-8 h-8 ${colorClasses[color]} rounded-full flex items-center justify-center`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="ml-4 flex-1">
                            <div className="text-sm font-medium text-gray-500">{title}</div>
                            <div className="text-2xl font-bold text-gray-900">{value}</div>
                            {trend && (
                                <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {trend === 'up' ? (
                                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                                    ) : (
                                        <ArrowDownIcon className="w-4 h-4 mr-1" />
                                    )}
                                    {trendValue}
                                </div>
                            )}
                        </div>
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
                        Analytics Dashboard
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href="/analytics/projects"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                        >
                            Detailed Reports
                        </Link>
                        <a
                            href="/analytics/export?type=spending&period=12months&format=pdf"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                            download
                        >
                            Export PDF
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Analytics Dashboard" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <StatCard
                            title="Total Spent"
                            value={formatCurrency(overview.total_spent)}
                            icon={CurrencyDollarIcon}
                            color="blue"
                        />
                        <StatCard
                            title="Completed Projects"
                            value={overview.completed_projects}
                            icon={ClipboardDocumentListIcon}
                            color="green"
                        />
                        <StatCard
                            title="Active Jobs"
                            value={overview.active_jobs}
                            icon={BriefcaseIcon}
                            color="yellow"
                        />
                        <StatCard
                            title="Gig Workers Hired"
                            value={overview.freelancers_hired}
                            icon={UserGroupIcon}
                            color="purple"
                        />
                        <StatCard
                            title="Success Rate"
                            value={`${overview.project_success_rate}%`}
                            icon={ArrowTrendingUpIcon}
                            color="indigo"
                        />
                    </div>

                    {/* Spending Chart */}
                    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthly_spending}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value) => [formatCurrency(value), 'Spending']}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="spending" 
                                            stroke="#3B82F6" 
                                            strokeWidth={2}
                                            dot={{ fill: '#3B82F6' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Hiring Insights */}
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Hiring Insights</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-md">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Average Project Duration</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {hiring_insights.avg_project_duration} days
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 shadow-md">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Repeat Gig Workers</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {hiring_insights.repeat_freelancers}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <UserGroupIcon className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 shadow-md">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">Average Project Cost</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(hiring_insights.avg_project_cost)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Projects */}
                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
                                    <Link
                                        href="/analytics/projects"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {recent_projects.length > 0 ? (
                                        recent_projects.map((project) => (
                                            <div key={project.id} className="border-l-4 border-blue-500 pl-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            {project.job?.title || 'Untitled Project'}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            Gig Worker: {project.gig_worker?.first_name} {project.gig_worker?.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Status: <span className="capitalize">{project.status}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">
                                                            {formatCurrency(project.agreed_amount)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(project.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No recent projects</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                        <div className="p-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Link
                                    href="/analytics/projects"
                                    className="flex items-center p-6 border border-blue-200 rounded-xl hover:bg-blue-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50/50 to-white"
                                >
                                    <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Projects Report</p>
                                        <p className="text-sm text-gray-600">Detailed project analysis</p>
                                    </div>
                                </Link>
                                
                                <Link
                                    href="/analytics/performance"
                                    className="flex items-center p-6 border border-green-200 rounded-xl hover:bg-green-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50/50 to-white"
                                >
                                    <ChartBarIcon className="w-8 h-8 text-green-500 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Performance</p>
                                        <p className="text-sm text-gray-600">Hiring success metrics</p>
                                    </div>
                                </Link>
                                
                                <Link
                                    href="/jobs/create"
                                    className="flex items-center p-6 border border-purple-200 rounded-xl hover:bg-purple-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-white"
                                >
                                    <BriefcaseIcon className="w-8 h-8 text-purple-500 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Post New Job</p>
                                        <p className="text-sm text-gray-600">Create a new project</p>
                                    </div>
                                </Link>
                                
                                <a
                                    href="/analytics/export?type=projects&period=12months&format=pdf"
                                    className="flex items-center p-6 border border-indigo-200 rounded-xl hover:bg-indigo-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-indigo-50/50 to-white"
                                    download
                                >
                                    <ArrowTrendingUpIcon className="w-8 h-8 text-indigo-500 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Export PDF</p>
                                        <p className="text-sm text-gray-600">Download reports</p>
                                    </div>
                                </a>
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
            `}</style>
        </AuthenticatedLayout>
    );
}
