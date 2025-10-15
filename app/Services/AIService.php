<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;

    public function __construct()
    {
        // Prioritize META_LLAMA_L4_SCOUT_FREE API key from .env file
        $this->apiKey = env('META_LLAMA_L4_SCOUT_FREE') ?: config('services.openrouter.api_key');
        $this->model = 'meta-llama/llama-4-scout:free';
        $this->baseUrl = config('services.openrouter.base_url') ?: env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1');
    }

    /**
     * Generate AI-powered match explanation for job-gig worker pairing
     */
    public function generateMatchExplanation(array $jobData, array $gigWorkerData, float $matchScore): string
    {
        try {
            $prompt = $this->buildMatchExplanationPrompt($jobData, $gigWorkerData, $matchScore);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => request()->header('referer') ?: config('app.url'),
                'X-Title' => 'WorkWise AI Matching'
            ])->timeout(30)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert AI recruiter specializing in Philippine freelance talent matching. Your expertise is in analyzing technical skills compatibility and experience level alignment. Focus exclusively on SKILLS MATCH and EXPERIENCE LEVEL compatibility. Provide detailed analysis of: 1) Direct skills overlap, 2) Related/complementary skills, 3) Experience level alignment, 4) Potential skill gaps. Always use professional, encouraging language. Use Philippine Peso (₱) for budget mentions.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 200,
                'temperature' => 0.7
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? 'AI analysis completed successfully.';
            }

            Log::warning('AI service response not successful', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return $this->getFallbackExplanation($jobData, $gigWorkerData, $matchScore);

        } catch (\Exception $e) {
            Log::error('AI service error', [
                'error' => $e->getMessage(),
                'job_id' => $jobData['id'] ?? null,
                'gig_worker_id' => $gigWorkerData['id'] ?? null
            ]);

            return $this->getFallbackExplanation($jobData, $gigWorkerData, $matchScore);
        }
    }

    /**
     * Generate AI-powered skill recommendations for gig worker
     */
    public function generateSkillRecommendations(array $gigWorkerData, array $marketTrends): array
    {
        try {
            $prompt = $this->buildSkillRecommendationPrompt($gigWorkerData, $marketTrends);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => request()->header('referer') ?: config('app.url'),
                'X-Title' => 'WorkWise AI Matching'
            ])->timeout(30)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert AI career development advisor specializing in Philippine freelance market trends. Focus on technical skills analysis and experience level progression. Provide specific, actionable skill recommendations based on: 1) Current market demand analysis, 2) Skills compatibility with existing profile, 3) Experience level appropriate learning paths, 4) Industry trends and emerging technologies. Always prioritize skills that complement existing expertise.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 250,
                'temperature' => 0.7
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? '';

                return [
                    'success' => true,
                    'recommendations' => $this->parseSkillRecommendations($content),
                    'raw_response' => $content
                ];
            }

            return [
                'success' => false,
                'recommendations' => [],
                'error' => 'AI service unavailable'
            ];

        } catch (\Exception $e) {
            Log::error('AI skill recommendation error', [
                'error' => $e->getMessage(),
                'gig_worker_id' => $gigWorkerData['id'] ?? null
            ]);

            return [
                'success' => false,
                'recommendations' => [],
                'error' => 'Service temporarily unavailable'
            ];
        }
    }

    /**
     * Generate AI-powered project success predictions
     */
    public function generateSuccessPrediction(array $jobData, array $gigWorkerData): array
    {
        try {
            $prompt = $this->buildSuccessPredictionPrompt($jobData, $gigWorkerData);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => request()->header('referer') ?: config('app.url'),
                'X-Title' => 'WorkWise AI Matching'
            ])->timeout(30)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert AI project management consultant specializing in Philippine freelance project success prediction. Focus on technical skills compatibility and experience level alignment. Analyze: 1) Skills match quality and completeness, 2) Experience level appropriateness, 3) Technical complexity vs expertise alignment, 4) Learning curve and adaptation potential. Provide realistic success probabilities based on skills and experience compatibility.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 150,
                'temperature' => 0.6
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? '';

                return [
                    'success' => true,
                    'prediction' => $this->parseSuccessPrediction($content),
                    'raw_response' => $content
                ];
            }

            return [
                'success' => false,
                'prediction' => null,
                'error' => 'Prediction service unavailable'
            ];

        } catch (\Exception $e) {
            Log::error('AI success prediction error', [
                'error' => $e->getMessage(),
                'job_id' => $jobData['id'] ?? null,
                'gig_worker_id' => $gigWorkerData['id'] ?? null
            ]);

            return [
                'success' => false,
                'prediction' => null,
                'error' => 'Service temporarily unavailable'
            ];
        }
    }

    /**
     * Build prompt for match explanation
     */
    private function buildMatchExplanationPrompt(array $jobData, array $gigWorkerData, float $matchScore): string
    {
        return sprintf(
            "Analyze this job-gig worker match:\n\n" .
            "JOB DETAILS:\n" .
            "Title: %s\n" .
            "Description: %s\n" .
            "Required Skills: %s\n" .
            "Experience Level: %s\n" .
            "Budget: %s\n\n" .
            "GIG WORKER DETAILS:\n" .
            "Name: %s\n" .
            "Skills: %s\n" .
            "Experience Level: %s\n" .
            "Bio: %s\n" .
            "Match Score: %.1f%%\n\n" .
            "Provide a concise explanation (2-3 sentences) of why this gig worker is a %s match for this job, focusing on skills and experience compatibility.",
            $jobData['title'] ?? 'N/A',
            $jobData['description'] ?? 'N/A',
            implode(', ', $jobData['required_skills'] ?? []),
            $jobData['experience_level'] ?? 'Not specified',
            $jobData['budget_range'] ?? 'Not specified',
            $gigWorkerData['name'] ?? 'N/A',
            implode(', ', $gigWorkerData['skills'] ?? []),
            $gigWorkerData['experience_level'] ?? 'Not specified',
            $gigWorkerData['bio'] ?? 'Not provided',
            $matchScore * 100,
            $matchScore >= 0.8 ? 'excellent' : ($matchScore >= 0.6 ? 'good' : 'moderate')
        );
    }

    /**
     * Build prompt for skill recommendations
     */
    private function buildSkillRecommendationPrompt(array $gigWorkerData, array $marketTrends): string
    {
        return sprintf(
            "Based on this gig worker's profile and current market trends, recommend 3-4 specific skills to learn:\n\n" .
            "GIG WORKER PROFILE:\n" .
            "Current Skills: %s\n" .
            "Experience Level: %s\n" .
            "Bio: %s\n\n" .
            "MARKET TRENDS:\n" .
            "High Demand Skills: %s\n" .
            "Emerging Technologies: %s\n\n" .
            "Provide specific, actionable skill recommendations that complement their existing skills and align with market demand.",
            implode(', ', $gigWorkerData['skills'] ?? []),
            $gigWorkerData['experience_level'] ?? 'Not specified',
            $gigWorkerData['bio'] ?? 'Not provided',
            implode(', ', $marketTrends['high_demand'] ?? []),
            implode(', ', $marketTrends['emerging'] ?? [])
        );
    }

    /**
     * Build prompt for success prediction
     */
    private function buildSuccessPredictionPrompt(array $jobData, array $gigWorkerData): string
    {
        return sprintf(
            "Predict the success probability of this gig worker-job pairing:\n\n" .
            "JOB: %s (%s, %s)\n" .
            "GIG WORKER: %s (%s experience)\n" .
            "Required Skills: %s\n" .
            "Gig Worker Skills: %s\n\n" .
            "Provide a realistic success probability (percentage) and 2-3 key factors that will determine success or failure.",
            $jobData['title'] ?? 'N/A',
            $jobData['experience_level'] ?? 'Any level',
            $jobData['budget_range'] ?? 'Budget not specified',
            $gigWorkerData['name'] ?? 'N/A',
            $gigWorkerData['experience_level'] ?? 'Not specified',
            implode(', ', $jobData['required_skills'] ?? []),
            implode(', ', $gigWorkerData['skills'] ?? [])
        );
    }

    /**
     * Parse skill recommendations from AI response
     */
    private function parseSkillRecommendations(string $content): array
    {
        // Extract skills from AI response (simple parsing)
        $recommendations = [];

        // Look for bullet points or numbered lists
        if (preg_match_all('/(?:^|\n)(?:[-*•]|\d+\.)\s*([^\n]+)/', $content, $matches)) {
            foreach ($matches[1] as $match) {
                $skill = trim($match);
                if (strlen($skill) > 3) {
                    $recommendations[] = $skill;
                }
            }
        }

        // If no structured list found, split by sentences
        if (empty($recommendations)) {
            $sentences = preg_split('/[.!?]+/', $content, -1, PREG_SPLIT_NO_EMPTY);
            foreach ($sentences as $sentence) {
                $sentence = trim($sentence);
                if (strlen($sentence) > 20 && strlen($sentence) < 100) {
                    $recommendations[] = $sentence;
                }
            }
        }

        return array_slice($recommendations, 0, 5); // Limit to 5 recommendations
    }

    /**
     * Parse success prediction from AI response
     */
    private function parseSuccessPrediction(string $content): ?array
    {
        // Look for percentage in the response
        if (preg_match('/(\d+)%/', $content, $matches)) {
            $percentage = (int) $matches[1];

            // Extract key factors
            $factors = [];
            if (preg_match_all('/(?:^|\n)(?:[-*•]|\d+\.)\s*([^\n]+)/', $content, $matches)) {
                foreach ($matches[1] as $match) {
                    $factors[] = trim($match);
                }
            }

            return [
                'probability' => min(100, max(0, $percentage)),
                'factors' => array_slice($factors, 0, 3)
            ];
        }

        return null;
    }

    /**
     * Get fallback explanation when AI service fails
     */
    private function getFallbackExplanation(array $jobData, array $gigWorkerData, float $matchScore): string
    {
        if ($matchScore >= 0.8) {
            return "This gig worker shows excellent compatibility with the job requirements based on their skills and experience level.";
        } elseif ($matchScore >= 0.6) {
            return "This gig worker demonstrates good alignment with the project needs and has relevant experience for the role.";
        } else {
            return "This gig worker has some relevant skills but may need additional training or experience for optimal project success.";
        }
    }

    /**
     * Check if AI service is available and configured
     */
    public function isAvailable(): bool
    {
        return !empty($this->apiKey) && !empty($this->model);
    }

    /**
     * Get service configuration info (without exposing API key)
     */
    public function getConfig(): array
    {
        return [
            'model' => $this->model,
            'base_url' => $this->baseUrl,
            'available' => $this->isAvailable()
        ];
    }
}