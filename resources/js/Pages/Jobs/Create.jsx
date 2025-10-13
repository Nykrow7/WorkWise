import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import taxonomy from '../../../../full_freelance_services_taxonomy.json';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function JobCreate() {
    const [skillInput, setSkillInput] = useState('');
    // AI-suggested skills state
    const [suggestedSkills, setSuggestedSkills] = useState([]);
    const [skillSuggestLoading, setSkillSuggestLoading] = useState(false);
    // Emerging skills and innovative roles
    const [emergingSkills, setEmergingSkills] = useState([]);
    const [innovativeRoles, setInnovativeRoles] = useState([]);

    // Flatten taxonomy into skills and category index (memoized for performance)
    const { skills: ALL_SKILLS, categories: CATEGORY_INDEX } = useMemo(() => {
        const skillsSet = new Set();
        const categories = [];
        (taxonomy.services || []).forEach(service => {
            (service.categories || []).forEach(cat => {
                categories.push({ name: cat.name, skills: cat.skills || [] });
                (cat.skills || []).forEach(s => skillsSet.add(s));
            });
        });
        return { skills: Array.from(skillsSet), categories };
    }, []);

    // Common synonym mappings to improve matching quality
    const SYNONYMS = useMemo(() => ({
        'react js': 'react',
        'react.js': 'react',
        'js': 'javascript',
        'node': 'node.js',
        'adobe premiere': 'adobe premiere pro',
        'davinci': 'davinci resolve',
        'ux': 'ui/ux',
        'ui': 'ui/ux',
        'ml': 'machine learning',
        'ai': 'machine learning',
        'ppc': 'ppc',
        'google ads': 'google ads',
        'facebook ads': 'facebook ads',
        'unity3d': 'unity',
        'c sharp': 'c#',
        'c plus plus': 'c++',
        'web dev': 'web development',
        'frontend': 'web development',
        'backend': 'web development',
        'laravel php': 'laravel'
    }), []);

    // Additional category/title synonyms to map common job titles to taxonomy categories
    const CATEGORY_SYNONYMS = useMemo(() => ({
        // Design
        'graphic designer': 'Graphic Design',
        'graphics designer': 'Graphic Design',
        'graphics design': 'Graphic Design',
        'logo designer': 'Logo Design & Branding',
        'branding expert': 'Logo Design & Branding',
        'brand designer': 'Logo Design & Branding',
        'ui designer': 'UI/UX Design',
        'ux designer': 'UI/UX Design',
        'ui/ux designer': 'UI/UX Design',
        'web designer': 'Web Design',
        'illustrator artist': 'Illustration',
        '2d animator': 'Animation',
        '3d animator': 'Animation',
        'motion designer': 'Animation',
        'video editor': 'Video Editing',
        '3d modeler': '3D Modeling',
        // Programming & Tech
        'frontend developer': 'Web Development',
        'front end developer': 'Web Development',
        'backend developer': 'Web Development',
        'back end developer': 'Web Development',
        'fullstack developer': 'Web Development',
        'full stack developer': 'Web Development',
        'react developer': 'Web Development',
        'vue developer': 'Web Development',
        'nextjs developer': 'Web Development',
        'wordpress developer': 'Web Development',
        'php developer': 'Web Development',
        'laravel developer': 'Web Development',
        'mobile developer': 'Mobile App Development',
        'react native developer': 'Mobile App Development',
        'flutter developer': 'Mobile App Development',
        'unity developer': 'Game Development',
        'unreal developer': 'Game Development',
        'software developer': 'Software Development',
        'api developer': 'API Integration & Automation',
        'integration engineer': 'API Integration & Automation',
        'database administrator': 'Database Management',
        'cybersecurity analyst': 'Cybersecurity',
        'ml engineer': 'Machine Learning',
        'ai engineer': 'AI & Machine Learning',
        'blockchain developer': 'Blockchain Development',
        // Marketing
        'seo specialist': 'SEO',
        'social media manager': 'Social Media Marketing',
        'content marketer': 'Content Marketing',
        'email marketer': 'Email Marketing',
        'affiliate marketer': 'Affiliate Marketing',
        'media buyer': 'Paid Advertising',
        'marketing analyst': 'Marketing Analytics',
        // Writing & Translation
        'content writer': 'Article & Blog Writing',
        'blog writer': 'Article & Blog Writing',
        'copywriter': 'Copywriting',
        'technical writer': 'Technical Writing',
        'ghostwriter': 'Ghostwriting',
        'proofreader': 'Proofreading & Editing',
        'translator': 'Translation',
        'transcriber': 'Transcription',
        // Music & Audio
        'voice over artist': 'Voice Over',
        'podcast editor': 'Podcast Editing',
        'sound designer': 'Sound Design',
        'songwriter': 'Songwriting',
        // Photo & Video
        'photographer': 'Photography',
        'photo editor': 'Photo Retouching',
        'videographer': 'Videography',
        'drone operator': 'Drone Videography',
        // Business & Consulting
        'business plan writer': 'Business Plan Writing',
        'startup consultant': 'Startup Consulting',
        'virtual assistant': 'Virtual Assistant',
        'project manager': 'Project Management',
        'accountant': 'Accounting & Bookkeeping',
        'legal consultant': 'Legal Consulting',
        // Data & Analytics
        'data entry specialist': 'Data Entry',
        'data visualization specialist': 'Data Visualization',
        'data analyst': 'Data Analysis',
        'data scientist': 'Machine Learning',
        'web scraper': 'Web Scraping',
        // E-Commerce & Product
        'shopify developer': 'E-commerce Development',
        'woocommerce developer': 'E-commerce Development',
        'magento developer': 'E-commerce Development',
        'product researcher': 'Product Research',
        'dropshipping specialist': 'Dropshipping',
        'amazon fba specialist': 'Amazon FBA',
        'store setup specialist': 'Store Setup',
        // Engineering & Architecture
        'cad designer': 'CAD Design',
        'mechanical engineer': 'Mechanical Engineering',
        'electrical engineer': 'Electrical Engineering',
        'civil engineer': 'Civil Engineering'
    }), []);

    const normalize = (str) => (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9+.# ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const tokenize = (str) => normalize(str).split(' ');

    // Simple morphological root reducer to better match roles to categories (e.g., designer -> design)
    const rootify = (word) => {
        let w = word || '';
        if (w.length <= 3) return w;
        const rules = [
            { end: 'ers', cut: 3 },
            { end: 'er', cut: 2 },
            { end: 'ors', cut: 3 },
            { end: 'or', cut: 2 },
            { end: 'ing', cut: 3 },
            { end: 'ments', cut: 5 },
            { end: 'ment', cut: 4 },
            { end: 'ions', cut: 4 },
            { end: 'ion', cut: 3 },
            { end: 'ists', cut: 4 },
            { end: 'ist', cut: 3 },
            { end: 'als', cut: 3 },
            { end: 'al', cut: 2 },
            { end: 's', cut: 1 },
        ];
        for (const r of rules) {
            if (w.endsWith(r.end) && w.length > r.cut) {
                w = w.slice(0, -r.cut);
                break;
            }
        }
        return w;
    };

    const matchCategoriesFromText = (text) => {
        const textNorm = normalize(text || '');
        const tokens = tokenize(text || '');
        const tokensRoot = tokens.map(rootify);
        const matched = new Set();

        // Direct category name inclusion or token overlap
        CATEGORY_INDEX.forEach(cat => {
            const catNorm = normalize(cat.name);
            const catTokens = catNorm.split(' ');
            const catTokensRoot = catTokens.map(rootify);
            if (textNorm.includes(catNorm)) {
                matched.add(cat.name);
                return;
            }
            const overlap = catTokensRoot.filter(t => tokensRoot.includes(t)).length;
            const threshold = Math.min(2, catTokensRoot.length);
            if (overlap >= threshold) matched.add(cat.name);
        });

        // Category synonyms mapping (job titles -> categories)
        Object.entries(CATEGORY_SYNONYMS).forEach(([alias, catName]) => {
            if (textNorm.includes(normalize(alias))) matched.add(catName);
        });

        return Array.from(matched);
    };

    const scoreSkillMatch = (textNorm, tokens, skill) => {
        const sNorm = normalize(skill);
        let score = 0;
        if (textNorm.includes(sNorm)) score += 3; // exact phrase match
        const sTokens = sNorm.split(' ');
        const tokenHits = sTokens.filter(t => tokens.includes(t)).length;
        if (tokenHits >= Math.min(2, sTokens.length)) score += 2; // token overlap
        // synonym mapping
        Object.entries(SYNONYMS).forEach(([key, val]) => {
            const k = normalize(key);
            const v = normalize(val);
            if (textNorm.includes(k) && (v === sNorm || sNorm.includes(v))) {
                score += 2;
            }
        });
        return score;
    };

    const suggestSkills = (text, exclude = []) => {
        const textNorm = normalize(text || '');
        const tokens = tokenize(text || '');
        const excludeSet = new Set(exclude.map(normalize));
        const scored = [];
        // Enhanced category-based suggestions via direct names, token overlap, and synonyms
        const matchedCategories = matchCategoriesFromText(text);
        matchedCategories.forEach(catName => {
            const cat = CATEGORY_INDEX.find(c => normalize(c.name) === normalize(catName) || c.name === catName);
            if (!cat) return;
            (cat.skills || []).forEach(s => {
                if (!excludeSet.has(normalize(s))) {
                    // High score to ensure category skills rank at the top
                    scored.push({ skill: s, score: 5 });
                }
            });
        });
        // direct skill matching
        ALL_SKILLS.forEach(s => {
            if (excludeSet.has(normalize(s))) return;
            const score = scoreSkillMatch(textNorm, tokens, s);
            if (score > 0) scored.push({ skill: s, score });
        });
        // aggregate by highest score per skill
        const bySkill = new Map();
        scored.forEach(({ skill, score }) => {
            const prev = bySkill.get(skill) || 0;
            if (score > prev) bySkill.set(skill, score);
        });
        // sort and return top suggestions
        return Array.from(bySkill.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([skill]) => skill)
            .slice(0, 12);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        required_skills: [],
        budget_type: 'fixed',
        budget_min: '',
        budget_max: '',
        experience_level: 'intermediate',
        estimated_duration_days: '',
        deadline: '',
        location: 'Lapu-Lapu City',
        is_remote: false,
    });

    // Debounced suggestion update when title/description change
    useEffect(() => {
        const t = setTimeout(() => {
            const text = `${data.title ?? ''} ${data.description ?? ''}`;
            const suggestions = suggestSkills(text, data.required_skills);
            setSuggestedSkills(suggestions);
            setSkillSuggestLoading(false);
        }, 300);
        setSkillSuggestLoading(true);
        return () => {
            clearTimeout(t);
        };
    }, [data.title, data.description, data.required_skills]);

    // Server-backed recommendations: taxonomy, emerging skills, innovative roles
    useEffect(() => {
        const ctrl = new AbortController();
        const run = async () => {
            const payload = {
                title: data.title,
                description: data.description,
                exclude: data.required_skills,
            };
            try {
                const res = await fetch('/api/recommendations/skills', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: ctrl.signal,
                });
                if (!res.ok) return;
                const json = await res.json();
                // Merge: prefer server taxonomy suggestions when present
                if (Array.isArray(json.taxonomy_skills) && json.taxonomy_skills.length) {
                    setSuggestedSkills(json.taxonomy_skills);
                }
                setEmergingSkills(Array.isArray(json.emerging_skills) ? json.emerging_skills : []);
                setInnovativeRoles(Array.isArray(json.innovative_roles) ? json.innovative_roles : []);
            } catch (err) {
                // silently ignore network errors
            }
        };
        // Only call when there's some text
        if ((data.title && data.title.length > 0) || (data.description && data.description.length > 0)) {
            run();
        }
        return () => ctrl.abort();
    }, [data.title, data.description, data.required_skills]);

    const addSkillFromSuggestion = async (skill) => {
        if (skill && !data.required_skills.includes(skill)) {
            setData('required_skills', [...data.required_skills, skill]);
            // log acceptance for learning
            try {
                await fetch('/api/recommendations/skills/accept', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'skill', value: skill, context: { source: 'taxonomy' } }),
                });
            } catch {}
        }
    };

    const addEmergingSkill = async (skill) => {
        if (skill && !data.required_skills.includes(skill)) {
            setData('required_skills', [...data.required_skills, skill]);
            try {
                await fetch('/api/recommendations/skills/accept', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'skill', value: skill, context: { source: 'emerging' } }),
                });
            } catch {}
        }
    };

    const applyInnovativeRole = async (role) => {
        const nextTitle = data.title && data.title.length ? `${role} — ${data.title}` : role;
        setData('title', nextTitle);
        try {
            await fetch('/api/recommendations/skills/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'role', value: role, context: { page: 'jobs.create' } }),
            });
        } catch {}
    };

    const addAllSuggestedSkills = () => {
        const toAdd = suggestedSkills.filter((s) => !data.required_skills.includes(s));
        if (toAdd.length > 0) {
            setData('required_skills', [...data.required_skills, ...toAdd]);
        }
    };

    // Add all emerging skills helper
    const addAllEmergingSkills = () => {
        const toAdd = emergingSkills.filter((s) => !data.required_skills.includes(s));
        if (toAdd.length > 0) {
            setData('required_skills', [...data.required_skills, ...toAdd]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('jobs.store'));
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
                        Post a New Job
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Find the perfect gig worker for your project
                    </p>
                </div>
            }
        >
            <Head title="Post a Job" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                <div className="relative z-20 max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-lg">
                                    1
                                </div>
                                <span className="ml-3 text-sm font-semibold text-blue-600">Job Details</span>
                            </div>
                            <div className="w-16 h-1 bg-gradient-to-r from-blue-300 to-gray-300 rounded-full"></div>
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 rounded-full text-sm font-bold shadow-md">
                                    2
                                </div>
                                <span className="ml-3 text-sm font-semibold text-gray-500">Review & Post</span>
                            </div>
                        </div>
                    </div>

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
                                    
                                    {/* AI-Suggested Skills */}
                                    {(skillSuggestLoading || suggestedSkills.length > 0) && (
                                        <div className="mt-4">
                                            <div className="flex items-center mb-2">
                                                <span className="text-sm font-semibold text-gray-700">AI-Suggested Skills</span>
                                                {skillSuggestLoading && (
                                                    <span className="ml-2 text-xs text-blue-600 flex items-center">
                                                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></span>
                                                        Analyzing...
                                                    </span>
                                                )}
                                                {!skillSuggestLoading && suggestedSkills.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={addAllSuggestedSkills}
                                                        disabled={suggestedSkills.every((s) => data.required_skills.includes(s))}
                                                        className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition ${suggestedSkills.every((s) => data.required_skills.includes(s)) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-indigo-50 text-blue-700 border-blue-200 hover:bg-indigo-100 hover:text-blue-800 hover:border-blue-300'}`}
                                                        aria-disabled={suggestedSkills.every((s) => data.required_skills.includes(s))}
                                                        title="Add all suggested skills"
                                                    >
                                                        Add all
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestedSkills.map((s) => {
                                                    const isAdded = data.required_skills.includes(s);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={s}
                                                            onClick={() => !isAdded && addSkillFromSuggestion(s)}
                                                            disabled={isAdded}
                                                            className={`group inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border shadow-sm transition ${isAdded ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-gradient-to-r from-indigo-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 hover:border-blue-300'}`}
                                                            aria-disabled={isAdded}
                                                            title={isAdded ? 'Already added' : 'Add skill'}
                                                        >
                                                            <span className={`mr-2 ${isAdded ? 'text-green-600' : 'text-blue-600 group-hover:text-blue-800'}`}>{isAdded ? '✓' : '+'}</span>
                                                            {s}
                                                        </button>
                                                    );
                                                })}
                                                {!skillSuggestLoading && suggestedSkills.length === 0 && (
                                                    <span className="text-xs text-gray-500">No suggestions yet. Try adding more details to your title or description.</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Emerging Skills */}
                                {emergingSkills.length > 0 && (
                                    <div className="mt-4">
                                        <div className="flex items-center mb-2">
                                            <span className="text-sm font-semibold text-gray-700">Emerging Skills</span>
                                            <button
                                                type="button"
                                                onClick={addAllEmergingSkills}
                                                disabled={emergingSkills.every((s) => data.required_skills.includes(s))}
                                                className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition ${emergingSkills.every((s) => data.required_skills.includes(s)) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-indigo-50 text-blue-700 border-blue-200 hover:bg-indigo-100 hover:text-blue-800 hover:border-blue-300'}`}
                                                aria-disabled={emergingSkills.every((s) => data.required_skills.includes(s))}
                                                title="Add all emerging skills"
                                            >
                                                Add all
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {emergingSkills.map((s) => {
                                                const isAdded = data.required_skills.includes(s);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={s}
                                                        onClick={() => !isAdded && addEmergingSkill(s)}
                                                        disabled={isAdded}
                                                        className={`group inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border shadow-sm transition ${isAdded ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-gradient-to-r from-indigo-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 hover:border-blue-300'}`}
                                                        aria-disabled={isAdded}
                                                        title={isAdded ? 'Already added' : 'Add emerging skill'}
                                                    >
                                                        <span className={`mr-2 ${isAdded ? 'text-green-600' : 'text-blue-600 group-hover:text-blue-800'}`}>{isAdded ? '✓' : '+'}</span>
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Innovative Roles */}
                                {innovativeRoles.length > 0 && (
                                    <div className="mt-4">
                                        <div className="flex items-center mb-2">
                                            <span className="text-sm font-semibold text-gray-700">Innovative Roles</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {innovativeRoles.map((r) => (
                                                <button
                                                    type="button"
                                                    key={r}
                                                    onClick={() => applyInnovativeRole(r)}
                                                    className="group inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border shadow-sm transition bg-gradient-to-r from-amber-50 to-orange-100 text-orange-700 border-orange-200 hover:from-orange-100 hover:to-orange-200 hover:text-orange-800 hover:border-orange-300"
                                                    title="Apply role to title"
                                                >
                                                    <span className="mr-2 text-orange-600 group-hover:text-orange-800">↪</span>
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                    <Link
                                        href={route('jobs.index')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Posting Job...
                                            </div>
                                        ) : (
                                            'Post Job'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Tips Sidebar
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips for a Great Job Post</h3>
                        <div className="space-y-3 text-sm text-blue-800">
                            <div className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Be specific about your requirements and deliverables</span>
                            </div>
                            <div className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Set a realistic budget based on project complexity</span>
                            </div>
                            <div className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Include examples or references if possible</span>
                            </div>
                            <div className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Respond promptly to gig worker questions</span>
                            </div>
                        </div>
                    </div> */}
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
