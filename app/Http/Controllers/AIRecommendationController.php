<?php

namespace App\Http\Controllers;

use App\Services\MatchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;

class AIRecommendationController extends Controller
{
    private MatchService $matchService;

    public function __construct(MatchService $matchService)
    {
        $this->matchService = $matchService;
    }

    /**
     * Show AI recommendations page
     */
    public function index(): Response
    {
        $user = auth()->user();
        $recommendations = [];

        try {
            // Set execution time limit to prevent timeout
            set_time_limit(25); // 25 seconds max
            
            if ($user->user_type === 'gig_worker') {
                $recommendations = $this->matchService->getRecommendedJobs($user, 5);
            } else {
                // For employers, limit to first 3 active jobs to prevent timeout
                $activeJobs = $user->postedJobs()
                    ->where('status', 'open')
                    ->limit(3)
                    ->get();
                    
                foreach ($activeJobs as $job) {
                    $recommendations[$job->id] = [
                        'job' => $job,
                        'matches' => $this->matchService->getJobMatches($job, 3) // Limit matches per job
                    ];
                }
            }
        } catch (\Exception $e) {
            // If matching fails, return empty recommendations with error message
            \Log::error('AI Recommendations error: ' . $e->getMessage());
            $recommendations = [];
        }

        return Inertia::render('AI/Recommendations', [
            'recommendations' => $recommendations,
            'userType' => $user->user_type,
            'hasError' => empty($recommendations) && $user->postedJobs()->where('status', 'open')->exists()
        ]);
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
     * Retrieve all unique required skills from all jobs in the system.
     * Returns a flat, sorted array of skills as JSON.
     */
    public function allSkills() {
        // Fetch all required_skills arrays from GigJob
        $allSkills = \App\Models\GigJob::pluck('required_skills')
            ->flatten(1)
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->toArray();
        return response()->json($allSkills);
    }
} 