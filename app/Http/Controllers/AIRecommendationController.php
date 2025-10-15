<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AIJobMatchingService;
use App\Models\GigJob;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;

class AIRecommendationController extends Controller
{
    private AIJobMatchingService $aiJobMatchingService;

    public function __construct(AIJobMatchingService $aiJobMatchingService)
    {
        $this->aiJobMatchingService = $aiJobMatchingService;
    }

    /**
     * Show AI recommendations page
     */
    public function index(): Response
    {
        $user = auth()->user();
        $recommendations = [];
        $skills = [];

        try {
            // Set execution time limit to prevent timeout
            set_time_limit(25); // 25 seconds max
            
            if ($user->user_type === 'gig_worker') {
                $recommendations = $this->aiJobMatchingService->findMatchingJobs($user, 5)->toArray();
            } else {
                // For employers, limit to first 3 active jobs to prevent timeout
                $activeJobs = $user->postedJobs()
                    ->where('status', 'open')
                    ->limit(3)
                    ->get();
                    
                foreach ($activeJobs as $job) {
                    $matches = $this->aiJobMatchingService->findMatchingGigWorkers($job, 3);
                    $recommendations[$job->id] = [
                        'job' => $job,
                        'matches' => $matches->toArray()
                    ];
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
}
