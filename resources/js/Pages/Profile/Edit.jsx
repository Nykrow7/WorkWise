import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Transition } from '@headlessui/react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('basic');
    const [skillInput, setSkillInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');

    const isGigWorker = user.user_type === 'gig_worker';
    const isEmployer = user.user_type === 'employer';

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        barangay: user.barangay || '',
        profile_photo: null,

        // Freelancer fields
        professional_title: user.professional_title || '',
        hourly_rate: user.hourly_rate || '',
        experience_level: user.experience_level || 'intermediate',
        skills: user.skills || [],
        languages: user.languages || [],
        portfolio_url: user.portfolio_url || '',

        // Client fields
        company_name: user.company_name || '',
        work_type_needed: user.work_type_needed || '',
        budget_range: user.budget_range || '',
        project_intent: user.project_intent || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'skills' || key === 'languages') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key === 'profile_photo' && data[key]) {
                formData.append(key, data[key]);
            } else {
                formData.append(key, data[key] || '');
            }
        });

        patch(route('profile.update'), formData, {
            preserveScroll: true,
            preserveState: true,
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    const addSkill = () => {
        if (skillInput.trim() && !data.skills.includes(skillInput.trim()) && data.skills.length < 15) {
            setData('skills', [...data.skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setData('skills', data.skills.filter(skill => skill !== skillToRemove));
    };

    const addLanguage = () => {
        if (languageInput.trim() && !data.languages.includes(languageInput.trim()) && data.languages.length < 10) {
            setData('languages', [...data.languages, languageInput.trim()]);
            setLanguageInput('');
        }
    };

    const removeLanguage = (languageToRemove) => {
        setData('languages', data.languages.filter(language => language !== languageToRemove));
    };

    const barangays = [
        'Agus', 'Babag', 'Bankal', 'Baring', 'Basak', 'Buaya', 'Calawisan', 'Canjulao',
        'Caw-oy', 'Gun-ob', 'Ibo', 'Looc', 'Mactan', 'Maribago', 'Marigondon', 'Pajac',
        'Pajo', 'Poblacion', 'Punta Engaño', 'Pusok', 'Sabang', 'Santa Rosa', 'Subabasbas',
        'Talima', 'Tingo', 'Tingub', 'Tugbongan'
    ];

    const getUserAvatar = () => {
        if (user.profile_photo) {
            return (
                <img
                    src={`/storage/${user.profile_photo}`}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-24 w-24 rounded-full object-cover"
                />
            );
        }

        const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        const colors = [
            'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
        ];
        const colorIndex = user.id % colors.length;

        return (
            <div className={`h-24 w-24 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-2xl font-semibold`}>
                {initials}
            </div>
        );
    };

    const tabs = [
        { id: 'basic', name: 'Basic Info', icon: '👤' },
        { id: 'professional', name: isGigWorker ? 'Professional' : 'Business', icon: isGigWorker ? '💼' : '🏢' },
        { id: 'security', name: 'Security', icon: '🔒' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Profile
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your account settings and profile information
                    </p>
                </div>
            }
        >
            <Head title="Edit Profile" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Profile Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                                <div className="p-8">
                                    {/* Profile Photo */}
                                    <div className="text-center mb-6">
                                        <div className="flex justify-center mb-4">
                                            {getUserAvatar()}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {user.first_name} {user.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {isGigWorker ? user.professional_title || 'Gig Worker' : user.company_name || 'Employer'}
                                        </p>
                                        <div className="mt-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold shadow-md ${
                                                user.user_type === 'employer'
                                                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                                            }`}>
                                                {user.user_type === 'employer' ? '🏢 Employer' : '💼 Gig Worker'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Profile Completion */}
                                    <div className="mb-8 bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                        <div className="flex justify-between text-sm font-medium text-blue-700 mb-3">
                                            <span>Profile Completion</span>
                                            <span>85%</span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-3 shadow-inner">
                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-lg" style={{ width: '85%' }}></div>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-3 font-medium">
                                            Complete your profile to attract more {isGigWorker ? 'employers' : 'gig workers'}
                                        </p>
                                    </div>

                                    {/* Navigation Tabs */}
                                    <nav className="space-y-2">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                                                    activeTab === tab.id
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50 hover:shadow-md'
                                                }`}
                                            >
                                                <span className="mr-3 text-lg">{tab.icon}</span>
                                                {tab.name}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <form onSubmit={handleSubmit}>
                                {/* Basic Information Tab */}
                                {activeTab === 'basic' && (
                                    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                                        <div className="p-8">
                                            <div className="mb-8">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Basic Information</h3>
                                                <p className="text-gray-600 text-lg">
                                                    Update your personal information and contact details
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Profile Photo Upload */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                                        Profile Photo
                                                    </label>
                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex-shrink-0">
                                                            {getUserAvatar()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => setData('profile_photo', e.target.files[0])}
                                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                            <p className="mt-2 text-xs text-gray-500">
                                                                JPG, PNG or GIF. Max size 2MB. Recommended: 400x400px
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {errors.profile_photo && <p className="mt-2 text-sm text-red-600">{errors.profile_photo}</p>}
                                                </div>

                                                {/* Name Fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                                            First Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="first_name"
                                                            value={data.first_name}
                                                            onChange={(e) => setData('first_name', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            required
                                                        />
                                                        {errors.first_name && <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Last Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="last_name"
                                                            value={data.last_name}
                                                            onChange={(e) => setData('last_name', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            required
                                                        />
                                                        {errors.last_name && <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>}
                                                    </div>
                                                </div>

                                                {/* Contact Information */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Email Address *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            value={data.email}
                                                            onChange={(e) => setData('email', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            required
                                                        />
                                                        {mustVerifyEmail && user.email_verified_at === null && (
                                                            <p className="mt-2 text-sm text-yellow-600">
                                                                Your email address is unverified. Please check your inbox.
                                                            </p>
                                                        )}
                                                        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Phone Number
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            id="phone"
                                                            value={data.phone}
                                                            onChange={(e) => setData('phone', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="+63 912 345 6789"
                                                        />
                                                        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                                                    </div>
                                                </div>

                                                {/* Location */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Barangay *
                                                        </label>
                                                        <select
                                                            id="barangay"
                                                            value={data.barangay}
                                                            onChange={(e) => setData('barangay', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            required
                                                        >
                                                            <option value="">Select Barangay</option>
                                                            {barangays.map((barangay) => (
                                                                <option key={barangay} value={barangay}>
                                                                    {barangay}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors.barangay && <p className="mt-2 text-sm text-red-600">{errors.barangay}</p>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Additional Location Info
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="location"
                                                            value={data.location}
                                                            onChange={(e) => setData('location', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="e.g., Near Mactan Airport"
                                                        />
                                                        {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                                                    </div>
                                                </div>

                                                {/* Bio */}
                                                <div>
                                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Professional Bio
                                                    </label>
                                                    <textarea
                                                        id="bio"
                                                        value={data.bio}
                                                        onChange={(e) => setData('bio', e.target.value)}
                                                        rows={4}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder={isGigWorker
                                                            ? "Tell employers about your experience, skills, and what makes you unique..."
                                                            : "Describe your company, the type of projects you work on, and what you're looking for..."
                                                        }
                                                    />
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        {data.bio.length}/1000 characters. This will be visible on your profile.
                                                    </p>
                                                    {errors.bio && <p className="mt-2 text-sm text-red-600">{errors.bio}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Professional/Business Tab */}
                                {activeTab === 'professional' && (
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-8">
                                            <div className="mb-8">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {isGigWorker ? 'Professional Information' : 'Business Information'}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {isGigWorker
                                                        ? 'Showcase your skills, experience, and professional details'
                                                        : 'Tell us about your business and project requirements'
                                                    }
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                {isGigWorker ? (
                                                    <>
                                                        {/* Professional Title */}
                                                        <div>
                                                            <label htmlFor="professional_title" className="block text-sm font-medium text-gray-700 mb-2">
                                                                Professional Title *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="professional_title"
                                                                value={data.professional_title}
                                                                onChange={(e) => setData('professional_title', e.target.value)}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="e.g., Full Stack Developer, UI/UX Designer"
                                                                required
                                                            />
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                This will be displayed prominently on your profile
                                                            </p>
                                                            {errors.professional_title && <p className="mt-2 text-sm text-red-600">{errors.professional_title}</p>}
                                                        </div>

                                                        {/* Hourly Rate */}
                                                        <div>
                                                            <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-2">
                                                                Hourly Rate (PHP) *
                                                            </label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                                                <input
                                                                    type="number"
                                                                    id="hourly_rate"
                                                                    value={data.hourly_rate}
                                                                    onChange={(e) => setData('hourly_rate', e.target.value)}
                                                                    className="w-full pl-8 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder="25.00"
                                                                    min="5"
                                                                    max="500"
                                                                    step="0.01"
                                                                    required
                                                                />
                                                            </div>
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                Set your standard hourly rate. You can adjust this for specific projects.
                                                            </p>
                                                            {errors.hourly_rate && <p className="mt-2 text-sm text-red-600">{errors.hourly_rate}</p>}
                                                        </div>

                                                        {/* Experience Level */}
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
                                                                <option value="beginner">Beginner (0-2 years)</option>
                                                                <option value="intermediate">Intermediate (2-5 years)</option>
                                                                <option value="expert">Expert (5+ years)</option>
                                                            </select>
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                This helps our AI match you with appropriate projects and affects your visibility in search results.
                                                            </p>
                                                            {errors.experience_level && <p className="mt-2 text-sm text-red-600">{errors.experience_level}</p>}
                                                        </div>

                                                        {/* Skills */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Skills *
                                                            </label>
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <input
                                                                    type="text"
                                                                    value={skillInput}
                                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder="Type a skill and press Enter"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={addSkill}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {data.skills.map((skill, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
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
                                                                Add up to 15 skills that best describe your expertise
                                                            </p>
                                                            {errors.skills && <p className="mt-2 text-sm text-red-600">{errors.skills}</p>}
                                                        </div>

                                                        {/* Languages */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Languages
                                                            </label>
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <input
                                                                    type="text"
                                                                    value={languageInput}
                                                                    onChange={(e) => setLanguageInput(e.target.value)}
                                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder="Type a language and press Enter"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={addLanguage}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {data.languages.map((language, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                                                    >
                                                                        {language}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeLanguage(language)}
                                                                            className="ml-2 text-green-600 hover:text-green-800"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                Add languages you can communicate in professionally
                                                            </p>
                                                            {errors.languages && <p className="mt-2 text-sm text-red-600">{errors.languages}</p>}
                                                        </div>

                                                        {/* Portfolio URL */}
                                                        <div>
                                                            <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-2">
                                                                Portfolio Website
                                                            </label>
                                                            <input
                                                                type="url"
                                                                id="portfolio_url"
                                                                value={data.portfolio_url}
                                                                onChange={(e) => setData('portfolio_url', e.target.value)}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="https://yourportfolio.com"
                                                            />
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                Link to your portfolio, GitHub, or professional website
                                                            </p>
                                                            {errors.portfolio_url && <p className="mt-2 text-sm text-red-600">{errors.portfolio_url}</p>}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Company Name */}
                                                        <div>
                                                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                                                                Company Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="company_name"
                                                                value={data.company_name}
                                                                onChange={(e) => setData('company_name', e.target.value)}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="Your Company Name"
                                                            />
                                                            {errors.company_name && <p className="mt-2 text-sm text-red-600">{errors.company_name}</p>}
                                                        </div>

                                                        {/* Work Type Needed */}
                                                        <div>
                                                            <label htmlFor="work_type_needed" className="block text-sm font-medium text-gray-700 mb-2">
                                                                Type of Work Needed
                                                            </label>
                                                            <select
                                                                id="work_type_needed"
                                                                value={data.work_type_needed}
                                                                onChange={(e) => setData('work_type_needed', e.target.value)}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Select work type</option>
                                                                <option value="Web Development">Web Development</option>
                                                                <option value="Mobile Development">Mobile Development</option>
                                                                <option value="Design">Design & Creative</option>
                                                                <option value="Marketing">Marketing & SEO</option>
                                                                <option value="Writing">Writing & Content</option>
                                                                <option value="Data">Data & Analytics</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                            {errors.work_type_needed && <p className="mt-2 text-sm text-red-600">{errors.work_type_needed}</p>}
                                                        </div>

                                                        {/* Budget Range */}
                                                        <div>
                                                            <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-2">
                                                                Typical Project Budget
                                                            </label>
                                                            <select
                                                                id="budget_range"
                                                                value={data.budget_range}
                                                                onChange={(e) => setData('budget_range', e.target.value)}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Select budget range</option>
                                                                <option value="$500 - $1,000">₱500 - ₱1,000</option>
                                                                <option value="$1,000 - $5,000">₱1,000 - ₱5,000</option>
                                                                <option value="$5,000 - $10,000">₱5,000 - ₱10,000</option>
                                                                <option value="$10,000 - $25,000">₱10,000 - ₱25,000</option>
                                                                <option value="$25,000+">₱25,000+</option>
                                                            </select>
                                                            {errors.budget_range && <p className="mt-2 text-sm text-red-600">{errors.budget_range}</p>}
                                                        </div>

                                                        {/* Project Intent */}
                                                        <div>
                                                            <label htmlFor="project_intent" className="block text-sm font-medium text-gray-700 mb-2">
                                                                Project Goals & Intent
                                                            </label>
                                                            <textarea
                                                                id="project_intent"
                                                                value={data.project_intent}
                                                                onChange={(e) => setData('project_intent', e.target.value)}
                                                                rows={4}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="Describe the types of projects you typically work on and your business goals..."
                                                            />
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                Help gig workers understand your business needs and project requirements
                                                            </p>
                                                            {errors.project_intent && <p className="mt-2 text-sm text-red-600">{errors.project_intent}</p>}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        {/* Change Password */}
                                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                            <div className="p-8">
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Ensure your account is using a long, random password to stay secure
                                                    </p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Current Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            id="current_password"
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter your current password"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                            New Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            id="new_password"
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter a new password"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Confirm New Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            id="confirm_password"
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Confirm your new password"
                                                        />
                                                    </div>
                                                    <div className="pt-4">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                        >
                                                            Update Password
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Security */}
                                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                            <div className="p-8">
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Security</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Manage your account security settings and preferences
                                                    </p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">Email Verification</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {user.email_verified_at ? 'Your email is verified' : 'Please verify your email address'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            {user.email_verified_at ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    ✓ Verified
                                                                </span>
                                                            ) : (
                                                                <button className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                                                    Verify Email
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">Profile Status</h4>
                                                            <p className="text-sm text-gray-600">
                                                                Your profile is currently {user.profile_status}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                user.profile_status === 'approved'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : user.profile_status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {user.profile_status === 'approved' ? '✓' : user.profile_status === 'pending' ? '⏳' : '❌'} {user.profile_status.charAt(0).toUpperCase() + user.profile_status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">Account Type</h4>
                                                            <p className="text-sm text-gray-600">
                                                                You are registered as a {user.user_type === 'employer' ? 'Employer' : 'Gig Worker'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                user.user_type === 'employer'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {user.user_type === 'employer' ? '🏢 Employer' : '💼 Gig Worker'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-red-200 border">
                                            <div className="p-8">
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                                                    <p className="text-sm text-red-600">
                                                        Irreversible and destructive actions
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                                                            <p className="text-sm text-red-600">
                                                                Permanently delete your account and all associated data
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <button className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                                                Delete Account
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button - Always visible */}
                                {(activeTab === 'basic' || activeTab === 'professional') && (
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mt-6">
                                        <div className="p-8">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Transition
                                                        show={recentlySuccessful}
                                                        enter="transition ease-in-out"
                                                        enterFrom="opacity-0"
                                                        leave="transition ease-in-out"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <p className="text-sm text-green-600">✓ Profile updated successfully!</p>
                                                    </Transition>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => window.location.reload()}
                                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {processing ? (
                                                            <div className="flex items-center">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                Saving...
                                                            </div>
                                                        ) : (
                                                            'Save Changes'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Profile Tips */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Profile Tips</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-blue-900 mb-3">
                                    {isGigWorker ? 'Stand Out to Employers:' : 'Attract Top Gig Workers:'}
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    {isGigWorker ? (
                                        <>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>Upload a professional profile photo</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>Write a compelling bio highlighting your expertise</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>List relevant skills and set competitive rates</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>Add your portfolio to showcase your work</span>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>Provide clear company information</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>Describe your typical project requirements</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>Set realistic budget expectations</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>Explain your business goals and vision</span>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 mb-3">Profile Completion Benefits:</h4>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        <span>Higher visibility in search results</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        <span>Better AI job recommendations</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        <span>Increased trust from {isGigWorker ? 'employers' : 'gig workers'}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        <span>Access to premium features</span>
                                    </li>
                                </ul>
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
