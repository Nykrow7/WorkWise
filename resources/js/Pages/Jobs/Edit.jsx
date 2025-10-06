import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function JobEdit({ job }) {
    const [skillInput, setSkillInput] = useState('');

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

    const { data, setData, processing, errors } = useForm({
        title: job.title || '',
        description: job.description || '',
        required_skills: parseSkills(job.required_skills),
        budget_type: job.budget_type || 'fixed',
        budget_min: job.budget_min || '',
        budget_max: job.budget_max || '',
        experience_level: job.experience_level || 'intermediate',
        estimated_duration_days: job.estimated_duration_days || '',
        deadline: job.deadline ? job.deadline.split('T')[0] : '',
        location: job.location || 'Lapu-Lapu City',
        is_remote: job.is_remote || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('=== FORM SUBMISSION DEBUG ===');
        console.log('Job object:', job);
        console.log('Job ID:', job.id);
        console.log('Target URL:', `/jobs/${job.id}`);
        console.log('Form data:', data);
        console.log('Current URL:', window.location.href);

        // Ensure we're not submitting to edit route
        const targetUrl = `/jobs/${job.id}`;
        if (targetUrl.includes('/edit')) {
            console.error('ERROR: Target URL contains /edit!', targetUrl);
            return;
        }

        // Try using router directly instead of useForm patch
        router.patch(targetUrl, data, {
            preserveScroll: true,
            onStart: () => {
                console.log('Router request started');
            },
            onSuccess: (page) => {
                console.log('Router update successful', page);
                // Success handled by redirect in controller
            },
            onError: (errors) => {
                console.error('Router update errors:', errors);
            },
            onFinish: () => {
                console.log('Router request finished');
            }
        });
    };

    const addSkill = () => {
        if (skillInput.trim() && !data.required_skills.includes(skillInput.trim())) {
            setData('required_skills', [...data.required_skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setData('required_skills', data.required_skills.filter(skill => skill !== skillToRemove));
    };

    const handleSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const barangays = [
        'Agus', 'Babag', 'Bankal', 'Baring', 'Basak', 'Buaya', 'Calawisan', 'Canjulao',
        'Caw-oy', 'Gun-ob', 'Ibo', 'Looc', 'Mactan', 'Maribago', 'Marigondon', 'Pajac',
        'Pajo', 'Poblacion', 'Punta Engaño', 'Pusok', 'Sabang', 'Santa Rosa', 'Subabasbas',
        'Talima', 'Tingo', 'Tingub', 'Tugbongan'
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Job: {job.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Update your job posting details
                    </p>
                </div>
            }
        >
            <Head title={`Edit Job: ${job.title}`} />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Warning Notice */}
                    {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-yellow-400 text-xl">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Important: Editing Active Job
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>Changes to this job will be visible to all gig workers. Existing proposals will remain unchanged.</p>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Job Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border-gray-300 rounded-xl shadow-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Build a React.js E-commerce Website"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Write a clear, descriptive title that explains what you need done
                                    </p>
                                    {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={6}
                                        className="w-full border-gray-300 rounded-xl shadow-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Describe your project in detail. Include specific requirements, deliverables, and any important information gig workers should know..."
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Minimum 100 characters. Be specific about what you need.
                                    </p>
                                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                {/* Required Skills */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Required Skills *
                                    </label>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={handleSkillKeyPress}
                                            className="flex-1 border-gray-300 rounded-xl shadow-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Type a skill and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {data.required_skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Add skills that are essential for this job (e.g., React.js, PHP, Graphic Design)
                                    </p>
                                    {errors.required_skills && <p className="mt-2 text-sm text-red-600">{errors.required_skills}</p>}
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Budget *
                                    </label>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="budget_type"
                                                    value="fixed"
                                                    checked={data.budget_type === 'fixed'}
                                                    onChange={(e) => setData('budget_type', e.target.value)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">Fixed Price</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="budget_type"
                                                    value="hourly"
                                                    checked={data.budget_type === 'hourly'}
                                                    onChange={(e) => setData('budget_type', e.target.value)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">Hourly Rate</span>
                                            </label>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    {data.budget_type === 'fixed' ? 'Minimum Budget' : 'Minimum Rate/Hour'}
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                                    <input
                                                        type="number"
                                                        value={data.budget_min}
                                                        onChange={(e) => setData('budget_min', e.target.value)}
                                                        className="w-full pl-8 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="0"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    {data.budget_type === 'fixed' ? 'Maximum Budget' : 'Maximum Rate/Hour'}
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                                    <input
                                                        type="number"
                                                        value={data.budget_max}
                                                        onChange={(e) => setData('budget_max', e.target.value)}
                                                        className="w-full pl-8 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="0"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.budget_min && <p className="mt-2 text-sm text-red-600">{errors.budget_min}</p>}
                                    {errors.budget_max && <p className="mt-2 text-sm text-red-600">{errors.budget_max}</p>}
                                </div>

                                {/* Experience Level & Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-2">
                                            Experience Level *
                                        </label>
                                        <select
                                            id="experience_level"
                                            value={data.experience_level}
                                            onChange={(e) => setData('experience_level', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="beginner">Beginner (0-1 years)</option>
                                            <option value="intermediate">Intermediate (2-5 years)</option>
                                            <option value="expert">Expert (5+ years)</option>
                                        </select>
                                        {errors.experience_level && <p className="mt-2 text-sm text-red-600">{errors.experience_level}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="estimated_duration_days" className="block text-sm font-medium text-gray-700 mb-2">
                                            Estimated Duration (Days) *
                                        </label>
                                        <input
                                            type="number"
                                            id="estimated_duration_days"
                                            value={data.estimated_duration_days}
                                            onChange={(e) => setData('estimated_duration_days', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 30"
                                            min="1"
                                            required
                                        />
                                        {errors.estimated_duration_days && <p className="mt-2 text-sm text-red-600">{errors.estimated_duration_days}</p>}
                                    </div>
                                </div>

                                {/* Location & Remote
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Work Location
                                    </label>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="work_location"
                                                    checked={!data.is_remote}
                                                    onChange={() => setData('is_remote', false)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">On-site in Lapu-Lapu City</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="work_location"
                                                    checked={data.is_remote}
                                                    onChange={() => setData('is_remote', true)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">Remote Work</span>
                                            </label>
                                        </div>
                                        
                                        {!data.is_remote && (
                                            <div>
                                                <label htmlFor="location" className="block text-sm text-gray-600 mb-1">
                                                    Specific Barangay (Optional)
                                                </label>
                                                <select
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="Lapu-Lapu City">Any Barangay in Lapu-Lapu City</option>
                                                    {barangays.map((barangay) => (
                                                        <option key={barangay} value={barangay}>
                                                            {barangay}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div> */}

                                {/* Deadline */}
                                <div>
                                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        id="deadline"
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        When do you need this project completed?
                                    </p>
                                    {errors.deadline && <p className="mt-2 text-sm text-red-600">{errors.deadline}</p>}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <div className="flex space-x-3">
                                        <Link
                                            href={`/jobs/${job.id}`}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Cancel
                                        </Link>
                                        <Link
                                            href="/jobs"
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Back to Jobs
                                        </Link>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Updating Job...
                                            </div>
                                        ) : (
                                            'Update Job'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Job Stats */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Job Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                            <div>
                                <div className="font-medium">Total Proposals</div>
                                <div className="text-2xl font-bold text-blue-600">{job.bids_count || 0}</div>
                            </div>
                            <div>
                                <div className="font-medium">Views</div>
                                <div className="text-2xl font-bold text-green-600">{job.views_count || 0}</div>
                            </div>
                            <div>
                                <div className="font-medium">Days Active</div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {Math.ceil((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24))}
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
            `}</style>
        </AuthenticatedLayout>
    );
}
