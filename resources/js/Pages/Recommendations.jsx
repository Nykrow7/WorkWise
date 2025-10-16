import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Loader2, Sparkles, User, Briefcase, Star, MapPin, Clock } from 'lucide-react';
import axios from 'axios';

export default function Recommendations({ auth }) {
    const [useAI, setUseAI] = useState(true);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const [userType, setUserType] = useState('gig_worker'); // 'gig_worker' or 'employer'

    useEffect(() => {
        loadRecommendations();
    }, [useAI, userType]);

    const loadRecommendations = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let endpoint;
            if (useAI) {
                // Use AI-powered recommendations (web routes with session auth)
                endpoint = '/ai/recommendations';
            } else {
                // Use traditional recommendations (fallback)
                endpoint = '/ai/recommendations?traditional=1';
            }

            // Add user type as query parameter
            const params = new URLSearchParams({
                user_type: userType,
                ai_enabled: useAI ? '1' : '0'
            });

            const response = await axios.get(`${endpoint}?${params}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            
            setRecommendations(response.data.recommendations || response.data || []);
        } catch (err) {
            console.error('Error loading recommendations:', err);
            setError(err.response?.data?.message || 'Failed to load recommendations');
            
            // Fallback to traditional recommendations if AI fails
            if (useAI && err.response?.status !== 401) {
                console.log('AI failed, falling back to traditional recommendations...');
                setUseAI(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleAI = () => {
        setUseAI(!useAI);
    };

    const toggleUserType = () => {
        setUserType(userType === 'gig_worker' ? 'employer' : 'gig_worker');
    };

    const renderJobRecommendation = (job) => (
        <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <Briefcase className="h-4 w-4" />
                            {job.company || 'Company Name'}
                        </CardDescription>
                    </div>
                    {job.match_score && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {Math.round(job.match_score * 100)}% match
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {job.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type || 'Full-time'}
                        </div>
                    </div>

                    {job.required_skills && (
                        <div className="flex flex-wrap gap-1">
                            {job.required_skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                            {job.required_skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{job.required_skills.length - 3} more
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold text-green-600">
                            ${job.budget || job.salary || 'Negotiable'}
                        </span>
                        <Button size="sm">
                            Apply Now
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderWorkerRecommendation = (worker) => (
        <Card key={worker.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{worker.name}</CardTitle>
                            <CardDescription>{worker.title || 'Professional'}</CardDescription>
                        </div>
                    </div>
                    {worker.match_score && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {Math.round(worker.match_score * 100)}% match
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {worker.bio || worker.description}
                    </p>

                    {worker.skills && (
                        <div className="flex flex-wrap gap-1">
                            {worker.skills.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                            {worker.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                    +{worker.skills.length - 4} more
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{worker.rating || '5.0'} ({worker.reviews || '0'} reviews)</span>
                        </div>
                        <Button size="sm">
                            Contact
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Recommendations</h2>}
        >
            <Head title="Recommendations" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Controls */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {userType === 'gig_worker' ? 'Job Recommendations' : 'Worker Recommendations'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {useAI ? 'AI-powered recommendations based on your profile' : 'Traditional recommendations'}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {/* User Type Toggle */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={userType === 'gig_worker' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setUserType('gig_worker')}
                                        >
                                            <User className="h-4 w-4 mr-1" />
                                            Gig Worker
                                        </Button>
                                        <Button
                                            variant={userType === 'employer' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setUserType('employer')}
                                        >
                                            <Briefcase className="h-4 w-4 mr-1" />
                                            Employer
                                        </Button>
                                    </div>

                                    {/* AI Toggle */}
                                    <div className="flex items-center gap-2">
                                        <Sparkles className={`h-4 w-4 ${useAI ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <span className="text-sm font-medium">AI-Powered</span>
                                        <Switch
                                            checked={useAI}
                                            onCheckedChange={toggleAI}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <div className="text-red-800">
                                    <h3 className="text-sm font-medium">Error loading recommendations</h3>
                                    <p className="text-sm mt-1">{error}</p>
                                    {useAI && (
                                        <p className="text-sm mt-2 text-red-600">
                                            Try disabling AI-powered recommendations or check your authentication.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                                <p className="text-gray-600">
                                    {useAI ? 'AI is analyzing your profile...' : 'Loading recommendations...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Recommendations Grid */}
                    {!loading && recommendations.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.map(item => 
                                userType === 'gig_worker' 
                                    ? renderJobRecommendation(item)
                                    : renderWorkerRecommendation(item)
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && recommendations.length === 0 && !error && (
                        <div className="text-center py-12">
                            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                {useAI ? <Sparkles className="h-24 w-24" /> : <Briefcase className="h-24 w-24" />}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No recommendations found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {useAI 
                                    ? 'AI couldn\'t find matching recommendations. Try updating your profile or disable AI for traditional results.'
                                    : 'No traditional recommendations available at the moment.'
                                }
                            </p>
                            <Button onClick={loadRecommendations}>
                                Refresh Recommendations
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}