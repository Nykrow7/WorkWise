<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AIJobMatchingService;
use App\Services\AIEmbeddingService;
use App\Models\GigJob;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class AIRecommendationController extends Controller
{
    private AIJobMatchingService $aiJobMatchingService;
    private AIEmbeddingService $embeddingService;

    public function __construct(AIJobMatchingService $aiJobMatchingService, AIEmbeddingService $embeddingService)
    {
        $this->aiJobMatchingService = $aiJobMatchingService;
        $this->embeddingService = $embeddingService;
    }

    /**
     * Get AI-powered job recommendations for a gig worker (API endpoint)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getJobRecommendations(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || $user->user_type !== 'gig_worker') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            // Check if Voyage AI is configured
            if (!$this->embeddingService->isConfigured()) {
                return $this->getFallbackJobRecommendations($user);
            }

            // Generate or retrieve user embedding
            $userEmbedding = $this->getUserEmbedding($user);
            
            if (!$userEmbedding) {
                // Fallback to basic recommendations if AI fails
                return $this->getFallbackJobRecommendations($user);
            }

            // Get all open jobs with their embeddings
            $jobs = GigJob::where('status', 'open')
                ->where('employer_id', '!=', $user->id)
                ->whereDoesntHave('bids', function ($query) use ($user) {
                    $query->where('gig_worker_id', $user->id);
                })
                ->with(['employer'])
                ->get();

            $recommendations = [];

            foreach ($jobs as $job) {
                $jobEmbedding = $this->getJobEmbedding($job);
                
                if ($jobEmbedding) {
                    $similarity = $this->embeddingService->cosineSimilarity($userEmbedding, $jobEmbedding);
                    $score = round($similarity * 100, 1);
                    
                    // Only include jobs with reasonable match scores
                    if ($score >= 30) {
                        $recommendations[] = [
                            'job' => $job,
                            'score' => $score,
                            'reason' => $this->generateMatchReason($user, $job, $score)
                        ];
                    }
                }
            }

            // Sort by score descending
            usort($recommendations, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });

            // Limit to top 20 recommendations
            $recommendations = array_slice($recommendations, 0, 20);

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'user_type' => 'gig_worker',
                'ai_powered' => true
            ]);

        } catch (\Exception $e) {
            Log::error('AI job recommendations error', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            // Fallback to basic recommendations
            return $this->getFallbackJobRecommendations($user);
        }
    }

    /**
     * Get AI-powered gig worker recommendations for employers (API endpoint)
     * 
     * @param Request $request
     * @param int $jobId
     * @return JsonResponse
     */
    public function getWorkerRecommendations(Request $request, int $jobId): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || $user->user_type !== 'employer') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $job = GigJob::where('id', $jobId)
                ->where('employer_id', $user->id)
                ->first();

            if (!$job) {
                return response()->json(['error' => 'Job not found'], 404);
            }

            // Check if Voyage AI is configured
            if (!$this->embeddingService->isConfigured()) {
                return $this->getFallbackWorkerRecommendations($job);
            }

            // Generate or retrieve job embedding
            $jobEmbedding = $this->getJobEmbedding($job);
            
            if (!$jobEmbedding) {
                // Fallback to basic recommendations if AI fails
                return $this->getFallbackWorkerRecommendations($job);
            }

            // Get all active gig workers with their embeddings
            $gigWorkers = User::where('user_type', 'gig_worker')
                ->where('profile_status', 'active')
                ->where('profile_completed', true)
                ->get();

            $recommendations = [];

            foreach ($gigWorkers as $worker) {
                $workerEmbedding = $this->getUserEmbedding($worker);
                
                if ($workerEmbedding) {
                    $similarity = $this->embeddingService->cosineSimilarity($jobEmbedding, $workerEmbedding);
                    $score = round($similarity * 100, 1);
                    
                    // Only include workers with reasonable match scores
                    if ($score >= 30) {
                        $recommendations[] = [
                            'gig_worker' => $worker,
                            'score' => $score,
                            'reason' => $this->generateWorkerMatchReason($job, $worker, $score)
                        ];
                    }
                }
            }

            // Sort by score descending
            usort($recommendations, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });

            // Group recommendations by score ranges for better UX
            $groupedRecommendations = [
                'excellent' => array_filter($recommendations, fn($r) => $r['score'] >= 80),
                'good' => array_filter($recommendations, fn($r) => $r['score'] >= 60 && $r['score'] < 80),
                'basic' => array_filter($recommendations, fn($r) => $r['score'] >= 30 && $r['score'] < 60)
            ];

            return response()->json([
                'success' => true,
                'job_id' => $jobId,
                'recommendations' => $groupedRecommendations,
                'user_type' => 'employer',
                'ai_powered' => true
            ]);

        } catch (\Exception $e) {
            Log::error('AI worker recommendations error', [
                'user_id' => $user->id,
                'job_id' => $jobId,
                'error' => $e->getMessage()
            ]);

            // Fallback to basic recommendations
            return $this->getFallbackWorkerRecommendations($job ?? null);
        }
    }

    /**
     * Show AI recommendations page
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = auth()->user();
        $userType = $request->get('user_type', $user->user_type);
        $aiEnabled = $request->get('ai_enabled', '1') === '1';
        $traditional = $request->get('traditional', '0') === '1';
        
        // If this is an AJAX request, return JSON
        if ($request->expectsJson() || $request->ajax()) {
            return $this->getRecommendationsJson($user, $userType, $aiEnabled, $traditional);
        }
        
        // Otherwise return Inertia response for direct page access
        $recommendations = [];
        $skills = [];

        try {
            // Set execution time limit to prevent timeout
            set_time_limit(25); // 25 seconds max
            
            if ($userType === 'gig_worker') {
                if ($aiEnabled && !$traditional) {
                    // Use AI recommendations
                    $apiResponse = $this->getJobRecommendations($request);
                    $responseData = json_decode($apiResponse->getContent(), true);
                    $recommendations = $responseData['recommendations'] ?? [];
                } else {
                    // Use traditional matching
                    $recommendations = $this->aiJobMatchingService->findMatchingJobs($user, 5)->toArray();
                }
            } else {
                // For employers, limit to first 3 active jobs to prevent timeout
                $activeJobs = $user->postedJobs()
                    ->where('status', 'open')
                    ->limit(3)
                    ->get();
                    
                foreach ($activeJobs as $job) {
                    if ($aiEnabled && !$traditional) {
                        // Use AI recommendations
                        $apiResponse = $this->getWorkerRecommendations($request, $job->id);
                        $responseData = json_decode($apiResponse->getContent(), true);
                        $recommendations[$job->id] = [
                            'job' => $job,
                            'matches' => $responseData['recommendations'] ?? []
                        ];
                    } else {
                        // Use traditional matching
                        $matches = $this->aiJobMatchingService->findMatchingGigWorkers($job, 3);
                        $recommendations[$job->id] = [
                            'job' => $job,
                            'matches' => $matches->toArray()
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            // If matching fails, return empty recommendations with error message
            \Log::error('AI Recommendations error: ' . $e->getMessage());
            $recommendations = [];
        }

        $skills = collect(
            GigJob::query()
                ->whereNotNull('required_skills')
                ->pluck('required_skills')
                ->toArray()
        )
            ->filter()
            ->reduce(function (array $unique, $skillSet) {
                $skillsArray = is_array($skillSet)
                    ? $skillSet
                    : (json_decode($skillSet, true) ?: []);

                foreach ($skillsArray as $skill) {
                    $trimmed = trim((string) $skill);

                    if ($trimmed === '') {
                        continue;
                    }

                    $normalized = strtolower($trimmed);

                    if (!array_key_exists($normalized, $unique)) {
                        $unique[$normalized] = $trimmed;
                    }
                }

                return $unique;
            }, []);

        $skills = collect($skills)
            ->values()
            ->sort(fn ($a, $b) => strcasecmp($a, $b))
            ->values()
            ->all();

        return Inertia::render('AI/Recommendations', [
            'recommendations' => $recommendations,
            'userType' => $user->user_type,
            'hasError' => empty($recommendations) && $user->postedJobs()->where('status', 'open')->exists(),
            'skills' => $skills,
            'user_type' => $userType,
            'ai_enabled' => $aiEnabled
        ]);
    }

    /**
     * Get recommendations as JSON response
     */
    private function getRecommendationsJson(User $user, string $userType, bool $aiEnabled, bool $traditional): JsonResponse
    {
        try {
            if ($userType === 'gig_worker') {
                if ($aiEnabled && !$traditional) {
                    // Create a mock request for the API method
                    $mockRequest = new Request();
                    $mockRequest->setUserResolver(function () use ($user) {
                        return $user;
                    });
                    
                    return $this->getJobRecommendations($mockRequest);
                } else {
                    // Use traditional matching
                    $recommendations = $this->aiJobMatchingService->findMatchingJobs($user, 10)->toArray();
                    return response()->json([
                        'success' => true,
                        'recommendations' => $recommendations,
                        'user_type' => 'gig_worker',
                        'ai_powered' => false
                    ]);
                }
            } else {
                // For employers, get worker recommendations for their jobs
                $activeJobs = $user->postedJobs()
                    ->where('status', 'open')
                    ->limit(5)
                    ->get();
                
                $allRecommendations = [];
                
                foreach ($activeJobs as $job) {
                    if ($aiEnabled && !$traditional) {
                        // Create a mock request for the API method
                        $mockRequest = new Request();
                        $mockRequest->setUserResolver(function () use ($user) {
                            return $user;
                        });
                        
                        $apiResponse = $this->getWorkerRecommendations($mockRequest, $job->id);
                        $responseData = json_decode($apiResponse->getContent(), true);
                        
                        if (isset($responseData['recommendations'])) {
                            $allRecommendations = array_merge($allRecommendations, $responseData['recommendations']);
                        }
                    } else {
                        // Use traditional matching
                        $matches = $this->aiJobMatchingService->findMatchingGigWorkers($job, 5);
                        foreach ($matches as $match) {
                            $allRecommendations[] = [
                                'gig_worker' => $match,
                                'score' => 75, // Default score for traditional matching
                                'reason' => 'Traditional skill-based matching'
                            ];
                        }
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'recommendations' => $allRecommendations,
                    'user_type' => 'employer',
                    'ai_powered' => $aiEnabled && !$traditional
                ]);
            }
        } catch (\Exception $e) {
            Log::error('AI Recommendations JSON error', [
                'user_id' => $user->id,
                'user_type' => $userType,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to load recommendations',
                'recommendations' => [],
                'user_type' => $userType,
                'ai_powered' => false
            ]);
        }
    }

    /**
     * Test OpenRouter API connectivity
     */
    public function testConnection()
    {
        try {
            // Use META_LLAMA_L4_SCOUT_FREE API key from .env file
            $apiKey = env('META_LLAMA_L4_SCOUT_FREE') ?: config('services.openrouter.api_key');
            $certPath = base_path('cacert.pem');
            
            if (empty($apiKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'META_LLAMA_L4_SCOUT_FREE API key is not configured in .env file'
                ]);
            }

            $response = Http::withToken($apiKey)
                ->withOptions([
                    'verify' => $certPath
                ])
                ->withHeaders([
                    'HTTP-Referer' => config('app.url'),
                    'X-Title' => 'WorkWise Job Matching'
                ])
                ->post(config('services.openrouter.base_url') . '/chat/completions', [
                    'model' => 'meta-llama/llama-4-scout:free',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a helpful assistant.'],
                        ['role' => 'user', 'content' => 'Hi, this is a test message.']
                    ]
                ]);

            $data = $response->json();
            
            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'API Connection Successful',
                    'data' => $data
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'API request failed',
                'error' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'API Connection Failed',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Retrieve all unique required skills across all jobs.
     */
    public function allSkills()
    {
        $skills = collect(
            GigJob::query()
                ->whereNotNull('required_skills')
                ->pluck('required_skills')
                ->toArray()
        )
            ->filter()
            ->reduce(function (array $unique, $skillSet) {
                $skillsArray = is_array($skillSet)
                    ? $skillSet
                    : (json_decode($skillSet, true) ?: []);

                foreach ($skillsArray as $skill) {
                    $trimmed = trim((string) $skill);

                    if ($trimmed === '') {
                        continue;
                    }

                    $normalized = strtolower($trimmed);

                    if (!array_key_exists($normalized, $unique)) {
                        $unique[$normalized] = $trimmed;
                    }
                }

                return $unique;
            }, []);

        $skills = collect($skills)
            ->values()
            ->sort(fn ($a, $b) => strcasecmp($a, $b))
            ->values()
            ->all();

        return response()->json($skills);
    }

    public function recommendSkills(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'exclude' => 'array',
            'exclude.*' => 'string',
        ]);

        $title = $validated['title'] ?? '';
        $description = $validated['description'] ?? '';
        $exclude = $validated['exclude'] ?? [];

        $service = app(AIJobMatchingService::class);
        $result = $service->recommend($title, $description, $exclude);

        return response()->json($result);
    }

    public function acceptSuggestion(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:skill,role',
            'value' => 'required|string',
            'context' => 'nullable|array',
        ]);

        $service = app(AIJobMatchingService::class);
        $service->recordAcceptance($validated['type'], $validated['value'], $validated['context'] ?? []);

        return response()->json(['status' => 'ok']);
    }

    /**
     * Get or generate embedding for a user
     * 
     * @param User $user
     * @return array|null
     */
    private function getUserEmbedding(User $user): ?array
    {
        // Check if embedding is already stored
        if ($user->skills_embedding) {
            return json_decode($user->skills_embedding, true);
        }

        // Generate new embedding
        $skills = $user->skills ?? [];
        $bio = $user->bio ?? '';
        $professionalTitle = $user->professional_title ?? '';
        $experienceLevel = $user->experience_level ?? 'beginner';

        $embedding = $this->embeddingService->generateWorkerEmbedding(
            $skills, 
            $bio, 
            $professionalTitle, 
            $experienceLevel
        );

        if ($embedding) {
            // Store embedding for future use
            $user->update(['skills_embedding' => json_encode($embedding)]);
        }

        return $embedding;
    }

    /**
     * Get or generate embedding for a job
     * 
     * @param GigJob $job
     * @return array|null
     */
    private function getJobEmbedding(GigJob $job): ?array
    {
        // Check if embedding is already stored
        if ($job->skills_embedding) {
            return json_decode($job->skills_embedding, true);
        }

        // Generate new embedding
        $skills = $job->required_skills ?? [];
        $description = $job->description ?? '';
        $title = $job->title ?? '';

        $embedding = $this->embeddingService->generateJobEmbedding($skills, $description, $title);

        if ($embedding) {
            // Store embedding for future use
            $job->update(['skills_embedding' => json_encode($embedding)]);
        }

        return $embedding;
    }

    /**
     * Generate a human-readable reason for job match
     * 
     * @param User $user
     * @param GigJob $job
     * @param float $score
     * @return string
     */
    private function generateMatchReason(User $user, GigJob $job, float $score): string
    {
        $userSkills = $user->skills ?? [];
        $jobSkills = $job->required_skills ?? [];
        
        $matchingSkills = array_intersect(
            array_map('strtolower', $userSkills),
            array_map('strtolower', $jobSkills)
        );

        if ($score >= 80) {
            return "Excellent match! Your skills in " . implode(', ', array_slice($matchingSkills, 0, 3)) . 
                   " align perfectly with this job's requirements. Your " . $user->experience_level . 
                   " level experience is ideal for this position.";
        } elseif ($score >= 60) {
            return "Good match! You have relevant experience in " . implode(', ', array_slice($matchingSkills, 0, 2)) . 
                   ". This role could be a great opportunity to expand your skillset while leveraging your existing expertise.";
        } else {
            return "Potential match! While this role may require some new skills, your background in " . 
                   implode(', ', array_slice($userSkills, 0, 2)) . 
                   " provides a solid foundation. Consider this as a growth opportunity.";
        }
    }

    /**
     * Generate a human-readable reason for worker match
     * 
     * @param GigJob $job
     * @param User $worker
     * @param float $score
     * @return string
     */
    private function generateWorkerMatchReason(GigJob $job, User $worker, float $score): string
    {
        $jobSkills = $job->required_skills ?? [];
        $workerSkills = $worker->skills ?? [];
        
        $matchingSkills = array_intersect(
            array_map('strtolower', $jobSkills),
            array_map('strtolower', $workerSkills)
        );

        if ($score >= 80) {
            return "Perfect candidate! " . $worker->first_name . " has extensive experience in " . 
                   implode(', ', array_slice($matchingSkills, 0, 3)) . 
                   " and their " . $worker->experience_level . " level expertise matches your requirements exactly.";
        } elseif ($score >= 60) {
            return "Strong candidate! " . $worker->first_name . " brings solid skills in " . 
                   implode(', ', array_slice($matchingSkills, 0, 2)) . 
                   " and could deliver excellent results for your project.";
        } else {
            return "Promising candidate! " . $worker->first_name . " has relevant background and could grow into this role. " .
                   "Their experience in " . implode(', ', array_slice($workerSkills, 0, 2)) . " provides a good foundation.";
        }
    }

    /**
     * Fallback job recommendations when AI is unavailable
     * 
     * @param User $user
     * @return JsonResponse
     */
    private function getFallbackJobRecommendations(User $user): JsonResponse
    {
        $userSkills = $user->skills ?? [];
        
        $jobs = GigJob::where('status', 'open')
            ->where('employer_id', '!=', $user->id)
            ->whereDoesntHave('bids', function ($query) use ($user) {
                $query->where('gig_worker_id', $user->id);
            })
            ->when(!empty($userSkills), function ($query) use ($userSkills) {
                $query->where(function ($q) use ($userSkills) {
                    foreach ($userSkills as $skill) {
                        $q->orWhereJsonContains('required_skills', $skill);
                    }
                });
            })
            ->with(['employer'])
            ->latest()
            ->limit(10)
            ->get();

        $recommendations = $jobs->map(function ($job) use ($user) {
            return [
                'job' => $job,
                'score' => 75, // Default score for fallback
                'reason' => 'Based on your skills and experience, this job could be a good match for your profile.'
            ];
        });

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations,
            'user_type' => 'gig_worker',
            'ai_powered' => false,
            'fallback' => true
        ]);
    }

    /**
     * Fallback worker recommendations when AI is unavailable
     * 
     * @param GigJob|null $job
     * @return JsonResponse
     */
    private function getFallbackWorkerRecommendations(?GigJob $job): JsonResponse
    {
        if (!$job) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        $jobSkills = $job->required_skills ?? [];
        
        $workers = User::where('user_type', 'gig_worker')
            ->where('profile_status', 'active')
            ->where('profile_completed', true)
            ->when(!empty($jobSkills), function ($query) use ($jobSkills) {
                $query->where(function ($q) use ($jobSkills) {
                    foreach ($jobSkills as $skill) {
                        $q->orWhereJsonContains('skills', $skill);
                    }
                });
            })
            ->limit(10)
            ->get();

        $recommendations = [
            'excellent' => [],
            'good' => $workers->map(function ($worker) {
                return [
                    'gig_worker' => $worker,
                    'score' => 70, // Default score for fallback
                    'reason' => $worker->first_name . ' has relevant skills that match your job requirements.'
                ];
            })->toArray(),
            'basic' => []
        ];

        return response()->json([
            'success' => true,
            'job_id' => $job->id,
            'recommendations' => $recommendations,
            'user_type' => 'employer',
            'ai_powered' => false,
            'fallback' => true
        ]);
    }

    /**
     * Update AI recommendations when profile is changed
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfileRecommendations(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            // Validate the request data
            $validatedData = $request->validate([
                'skills' => 'array',
                'skills.*' => 'string',
                'experience_level' => 'nullable|string',
                'hourly_rate' => 'nullable|numeric',
                'location' => 'nullable|string',
                'bio' => 'nullable|string'
            ]);

            // Update user profile with new data
            $user->update(array_filter([
                'skills' => $validatedData['skills'] ?? $user->skills,
                'experience_level' => $validatedData['experience_level'] ?? $user->experience_level,
                'hourly_rate' => $validatedData['hourly_rate'] ?? $user->hourly_rate,
                'location' => $validatedData['location'] ?? $user->location,
                'bio' => $validatedData['bio'] ?? $user->bio,
            ]));

            // Clear any cached embeddings for this user
            if ($this->embeddingService->isConfigured()) {
                $this->clearUserEmbeddingCache($user);
            }

            // Get fresh recommendations based on updated profile
            $recommendations = [];
            
            if ($user->user_type === 'gig_worker') {
                // Get updated job recommendations
                $apiResponse = $this->getJobRecommendations($request);
                $responseData = json_decode($apiResponse->getContent(), true);
                $recommendations = $responseData['recommendations'] ?? [];
            } else {
                // For employers, get updated worker recommendations for their active jobs
                $activeJobs = $user->postedJobs()
                    ->where('status', 'open')
                    ->limit(5)
                    ->get();
                    
                foreach ($activeJobs as $job) {
                    $apiResponse = $this->getWorkerRecommendations($request, $job->id);
                    $responseData = json_decode($apiResponse->getContent(), true);
                    $recommendations[$job->id] = [
                        'job' => $job,
                        'matches' => $responseData['recommendations'] ?? []
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated and recommendations refreshed successfully',
                'recommendations' => $recommendations,
                'user_type' => $user->user_type,
                'updated_fields' => array_keys($validatedData)
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Profile update recommendations error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to update recommendations',
                'message' => 'An error occurred while updating your recommendations. Please try again.'
            ], 500);
        }
    }

    /**
     * Clear cached user embedding
     * 
     * @param User $user
     * @return void
     */
    private function clearUserEmbeddingCache(User $user): void
    {
        try {
            $cacheKey = "user_embedding_{$user->id}";
            \Cache::forget($cacheKey);
        } catch (\Exception $e) {
            Log::warning('Failed to clear user embedding cache', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
