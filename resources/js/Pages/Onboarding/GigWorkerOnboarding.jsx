import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function GigWorkerOnboarding({ user }) {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const { data, setData, post, processing, errors } = useForm({
        professional_title: '',
        hourly_rate: '',
        experience_level: 'intermediate',
        bio: '',
        skills: [],
        languages: [],
        portfolio_url: '',
        profile_photo: null,
    });

    const [skillInput, setSkillInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');

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
        if (languageInput.trim() && !data.languages.includes(languageInput.trim())) {
            setData('languages', [...data.languages, languageInput.trim()]);
            setLanguageInput('');
        }
    };

    const removeLanguage = (languageToRemove) => {
        setData('languages', data.languages.filter(language => language !== languageToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('gig-worker.onboarding'));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Complete Your Gig Worker Profile
                </h2>
            }
        >
            <Head title="Gig Worker Onboarding" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">
                                        Step {currentStep} of {totalSteps}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {Math.round((currentStep / totalSteps) * 100)}% Complete
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Step 1: Basic Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                Tell us about yourself
                                            </h3>
                                            <p className="text-gray-600">
                                                This information will help employers understand your expertise
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="professional_title" value="Professional Title" />
                                            <TextInput
                                                id="professional_title"
                                                type="text"
                                                name="professional_title"
                                                value={data.professional_title}
                                                className="mt-1 block w-full"
                                                placeholder="e.g., Full Stack Developer, UI/UX Designer"
                                                onChange={(e) => setData('professional_title', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.professional_title} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="hourly_rate" value="Hourly Rate (PHP)" />
                                            <TextInput
                                                id="hourly_rate"
                                                type="number"
                                                name="hourly_rate"
                                                value={data.hourly_rate}
                                                className="mt-1 block w-full"
                                                placeholder="25"
                                                min="5"
                                                max="1000"
                                                onChange={(e) => setData('hourly_rate', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.hourly_rate} className="mt-2" />
                                            <p className="text-sm text-gray-500 mt-1">
                                                You can always change this later
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="experience_level" value="Experience Level" />
                                            <select
                                                id="experience_level"
                                                name="experience_level"
                                                value={data.experience_level}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={(e) => setData('experience_level', e.target.value)}
                                                required
                                            >
                                                <option value="beginner">Beginner (0-2 years)</option>
                                                <option value="intermediate">Intermediate (2-5 years)</option>
                                                <option value="expert">Expert (5+ years)</option>
                                            </select>
                                            <InputError message={errors.experience_level} className="mt-2" />
                                            <p className="text-sm text-gray-500 mt-1">
                                                This helps our AI match you with appropriate projects
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="bio" value="Professional Overview" />
                                            <textarea
                                                id="bio"
                                                name="bio"
                                                value={data.bio}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                rows="4"
                                                placeholder="Describe your experience, skills, and what makes you unique..."
                                                onChange={(e) => setData('bio', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.bio} className="mt-2" />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Minimum 50 characters ({data.bio.length}/50)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Skills and Languages */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                Your Skills & Languages
                                            </h3>
                                            <p className="text-gray-600">
                                                Add your top skills and languages to help employers find you
                                            </p>
                                        </div>

                                        {/* Skills Section */}
                                        <div>
                                            <InputLabel value="Skills (minimum 3, maximum 15)" />
                                            <div className="flex gap-2 mt-1">
                                                <TextInput
                                                    type="text"
                                                    value={skillInput}
                                                    className="flex-1"
                                                    placeholder="Add a skill..."
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addSkill}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {data.skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
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
                                            <InputError message={errors.skills} className="mt-2" />
                                        </div>

                                        {/* Languages Section */}
                                        <div>
                                            <InputLabel value="Languages" />
                                            <div className="flex gap-2 mt-1">
                                                <TextInput
                                                    type="text"
                                                    value={languageInput}
                                                    className="flex-1"
                                                    placeholder="Add a language..."
                                                    onChange={(e) => setLanguageInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addLanguage}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {data.languages.map((language, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
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
                                            <InputError message={errors.languages} className="mt-2" />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Portfolio and Photo */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                Complete Your Profile
                                            </h3>
                                            <p className="text-gray-600">
                                                Add your portfolio and profile photo to stand out
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="portfolio_url" value="Portfolio URL (Optional)" />
                                            <TextInput
                                                id="portfolio_url"
                                                type="url"
                                                name="portfolio_url"
                                                value={data.portfolio_url}
                                                className="mt-1 block w-full"
                                                placeholder="https://yourportfolio.com"
                                                onChange={(e) => setData('portfolio_url', e.target.value)}
                                            />
                                            <InputError message={errors.portfolio_url} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="profile_photo" value="Profile Photo (Optional)" />
                                            <input
                                                id="profile_photo"
                                                type="file"
                                                name="profile_photo"
                                                accept="image/*"
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                onChange={(e) => setData('profile_photo', e.target.files[0])}
                                            />
                                            <InputError message={errors.profile_photo} className="mt-2" />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Maximum file size: 2MB. Supported formats: JPG, PNG, GIF
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                        className={`px-6 py-2 rounded-md ${
                                            currentStep === 1
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                    >
                                        Previous
                                    </button>

                                    {currentStep < totalSteps ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <PrimaryButton disabled={processing}>
                                            {processing ? 'Submitting...' : 'Complete Profile'}
                                        </PrimaryButton>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
