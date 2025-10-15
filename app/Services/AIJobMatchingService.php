<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\GigJob;
use App\Models\User;
use App\Models\Bid;
use Illuminate\Support\Collection;

class AIJobMatchingService
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }
    /**
         * Find matching gig workers for a job using AI-like algorithm
         */
        public function findMatchingGigWorkers(GigJob $job, int $limit = 10): Collection
    {
        $gigWorkers = User::where('user_type', 'gig_worker')
            ->where('profile_completed', true)
            ->get();

        return $gigWorkers->map(function ($gigWorker) use ($job) {
            $score = $this->calculateMatchScore($job, $gigWorker);
            return [
                'gig_worker' => $gigWorker,
                'match_score' => $score,
                'match_reasons' => $this->getMatchReasons($job, $gigWorker, $score)
            ];
        })
        ->filter(fn($match) => $match['match_score'] > 0.1) // Show more matches (10% threshold)
        ->sortByDesc('match_score')
        ->take($limit)
        ->values();
    }

    /**
     * Find matching jobs for a gig worker
     */
    public function findMatchingJobs(User $gigWorker, int $limit = 20): Collection
    {
        $jobs = GigJob::with(['employer']) // Load employer relationship
            ->where('status', 'open')
            ->where('employer_id', '!=', $gigWorker->id)
            ->whereDoesntHave('bids', function($query) use ($gigWorker) {
                $query->where('gig_worker_id', $gigWorker->id);
            })
            ->get();

        return $jobs->map(function ($job) use ($gigWorker) {
            $score = $this->calculateMatchScore($job, $gigWorker);
            return [
                'job' => $job,
                'match_score' => $score,
                'match_reasons' => $this->getMatchReasons($job, $gigWorker, $score),
                'competition_level' => $this->calculateCompetitionLevel($job)
            ];
        })
        ->filter(fn($match) => $match['match_score'] > 0.1) // Show more matches (10% threshold)
        ->sortByDesc('match_score')
        ->take($limit)
        ->values();
    }

    /**
     * Calculate match score between job and gig worker
     */
    private function calculateMatchScore(GigJob $job, User $gigWorker): float
    {
        $score = 0.0;
        $maxScore = 1.0;

        // Skills matching (70% weight) - Primary factor
        $skillsScore = $this->calculateSkillsMatch($job->required_skills, $gigWorker->skills ?? []);
        $score += $skillsScore * 0.7;

        // Experience level matching (30% weight) - Secondary factor
        $experienceScore = $this->calculateExperienceMatch($job->experience_level, $gigWorker);
        $score += $experienceScore * 0.3;

        // Remove all other factors (budget, location, reputation, availability)
        // Focus only on skills and experience level

        return min($score, $maxScore);
    }

    /**
     * Calculate skills matching score
     */
    private function calculateSkillsMatch(array $requiredSkills, array $gigWorkerSkills): float
    {
        if (empty($requiredSkills) || empty($gigWorkerSkills)) {
            return 0.0;
        }

        // Normalize skills for better matching
        $requiredSkills = array_map(function($skill) {
            return strtolower(trim($skill));
        }, $requiredSkills);

        $gigWorkerSkills = array_map(function($skill) {
            return strtolower(trim($skill));
        }, $gigWorkerSkills);

        // Direct matches
        $directMatches = array_intersect($requiredSkills, $gigWorkerSkills);
        $directMatchScore = count($directMatches) / count($requiredSkills);

        // Partial matches (for similar skills)
        $partialMatches = 0;
        foreach ($requiredSkills as $required) {
            if (!in_array($required, $directMatches)) {
                foreach ($gigWorkerSkills as $gigWorker) {
                    if (str_contains($gigWorker, $required) || str_contains($required, $gigWorker)) {
                        $partialMatches++;
                        break;
                    }
                }
            }
        }

        $partialMatchScore = ($partialMatches * 0.5) / count($requiredSkills);
        $totalMatchScore = $directMatchScore + $partialMatchScore;

        // Bonus for having more skills than required
        $extraSkillsBonus = min(0.2, (count($gigWorkerSkills) - count($requiredSkills)) * 0.02);

        return min(1.0, $totalMatchScore + $extraSkillsBonus);
    }

    /**
     * Calculate experience level match
     */
    private function calculateExperienceMatch(string $requiredLevel, User $gigWorker): float
    {
        $levelMap = ['beginner' => 1, 'intermediate' => 2, 'expert' => 3];
        $required = $levelMap[$requiredLevel] ?? 2;

        // Use gig worker's set experience level if available, otherwise estimate
        if ($gigWorker->experience_level) {
            $gigWorkerLevel = $levelMap[$gigWorker->experience_level] ?? 2;
        } else {
            // Fallback: Estimate gig worker level based on completed projects and ratings
            $completedProjects = $gigWorker->gigWorkerProjects()->where('status', 'completed')->count();
            $avgRating = $gigWorker->receivedReviews()->avg('rating') ?? 3;

            $gigWorkerLevel = 1; // Default beginner
            if ($completedProjects >= 10 && $avgRating >= 4.5) {
                $gigWorkerLevel = 3; // Expert
            } elseif ($completedProjects >= 3 && $avgRating >= 4.0) {
                $gigWorkerLevel = 2; // Intermediate
            }
        }

        // Perfect match = 1.0, one level off = 0.7, two levels off = 0.3
        $difference = abs($required - $gigWorkerLevel);
        return match($difference) {
            0 => 1.0,
            1 => 0.7,
            default => 0.3
        };
    }

    /**
     * Calculate budget compatibility
     */
    private function calculateBudgetMatch(GigJob $job, User $gigWorker): float
    {
        $gigWorkerRate = $gigWorker->hourly_rate ?? 25; // Default rate
        $jobBudgetMin = $job->budget_min ?? 0;
        $jobBudgetMax = $job->budget_max ?? 1000;

        if ($job->budget_type === 'hourly') {
            // For hourly jobs, compare rates directly
            if ($gigWorkerRate >= $jobBudgetMin && $gigWorkerRate <= $jobBudgetMax) {
                return 1.0;
            } elseif ($gigWorkerRate < $jobBudgetMin) {
                return max(0.0, 1.0 - (($jobBudgetMin - $gigWorkerRate) / $jobBudgetMin));
            } else {
                return max(0.0, 1.0 - (($gigWorkerRate - $jobBudgetMax) / $jobBudgetMax));
            }
        } else {
            // For fixed jobs, estimate based on duration and hourly rate
            $estimatedHours = ($job->estimated_duration_days ?? 7) * 6; // 6 hours per day
            $gigWorkerEstimate = $gigWorkerRate * $estimatedHours;
            
            if ($gigWorkerEstimate >= $jobBudgetMin && $gigWorkerEstimate <= $jobBudgetMax) {
                return 1.0;
            } else {
                $midpoint = ($jobBudgetMin + $jobBudgetMax) / 2;
                $difference = abs($gigWorkerEstimate - $midpoint);
                return max(0.0, 1.0 - ($difference / $midpoint));
            }
        }
    }

    /**
     * Calculate location match (Lapu-Lapu City focus)
     */
    private function calculateLocationMatch(GigJob $job, User $gigWorker): float
    {
        // Both in Lapu-Lapu City = perfect match
        if ($gigWorker->barangay && $job->location) {
            return 1.0; // Both local
        }
        
        // Remote work preference
        if ($job->is_remote) {
            return 0.8; // Good for remote
        }
        
        return 0.5; // Neutral
    }

    /**
     * Calculate gig worker reputation score
     */
    private function calculateReputationScore(User $gigWorker): float
    {
        $avgRating = $gigWorker->receivedReviews()->avg('rating') ?? 3.0;
        $reviewCount = $gigWorker->receivedReviews()->count();
        $completedProjects = $gigWorker->gigWorkerProjects()->where('status', 'completed')->count();

        // Base score from rating
        $ratingScore = ($avgRating - 1) / 4; // Convert 1-5 to 0-1

        // Bonus for having reviews and completed projects
        $experienceBonus = min(0.3, ($reviewCount * 0.05) + ($completedProjects * 0.02));

        return min(1.0, $ratingScore + $experienceBonus);
    }

    /**
     * Calculate availability score
     */
    private function calculateAvailabilityScore(User $gigWorker): float
    {
        $activeProjects = $gigWorker->gigWorkerProjects()->where('status', 'active')->count();
        
        // Less active projects = more available
        return match(true) {
            $activeProjects === 0 => 1.0,
            $activeProjects <= 2 => 0.8,
            $activeProjects <= 4 => 0.5,
            default => 0.2
        };
    }

    /**
     * Calculate competition level for a job
     */
    private function calculateCompetitionLevel(GigJob $job): string
    {
        $bidCount = $job->bids()->count();
        
        return match(true) {
            $bidCount === 0 => 'No competition',
            $bidCount <= 3 => 'Low competition',
            $bidCount <= 8 => 'Medium competition',
            $bidCount <= 15 => 'High competition',
            default => 'Very high competition'
        };
    }

    /**
     * Get human-readable match reasons with AI enhancement
     */
    private function getMatchReasons(GigJob $job, User $gigWorker, float $score): array
    {
        $reasons = [];

        // Try to get AI-powered explanation first
        if ($this->aiService->isAvailable()) {
            $aiExplanation = $this->getAIExplanation($job, $gigWorker, $score);
            if ($aiExplanation) {
                $reasons[] = "🤖 AI Analysis: " . $aiExplanation;
            }
        }

        // Skills match with details (Primary factor)
        $skillsMatch = $this->calculateSkillsMatch($job->required_skills, $gigWorker->skills ?? []);
        $requiredSkills = array_map('strtolower', $job->required_skills);
        $gigWorkerSkills = array_map('strtolower', $gigWorker->skills ?? []);
        $matchingSkills = array_intersect($requiredSkills, $gigWorkerSkills);

        if ($skillsMatch > 0.8) {
            $reasons[] = "✅ Excellent skills match (" . count($matchingSkills) . "/" . count($requiredSkills) . " skills)";
        } elseif ($skillsMatch > 0.5) {
            $reasons[] = "✅ Good skills match (" . count($matchingSkills) . "/" . count($requiredSkills) . " skills)";
        } elseif ($skillsMatch > 0.2) {
            $reasons[] = "⚠️ Partial skills match (" . count($matchingSkills) . "/" . count($requiredSkills) . " skills)";
        } elseif ($skillsMatch > 0) {
            $reasons[] = "⚠️ Some skills match (" . count($matchingSkills) . "/" . count($requiredSkills) . " skills)";
        } else {
            $reasons[] = "❌ No direct skills match - consider learning: " . implode(', ', array_slice($job->required_skills, 0, 3));
        }

        // Experience level details (Secondary factor)
        $experienceMatch = $this->calculateExperienceMatch($job->experience_level, $gigWorker);
        if ($experienceMatch > 0.8) {
            $reasons[] = "🎯 Perfect experience level match ({$gigWorker->experience_level} = {$job->experience_level})";
        } elseif ($experienceMatch > 0.5) {
            $reasons[] = "🎯 Good experience level match ({$gigWorker->experience_level} ≈ {$job->experience_level})";
        } elseif ($gigWorker->experience_level) {
            $reasons[] = "📊 Experience level: {$gigWorker->experience_level} (required: {$job->experience_level})";
        } else {
            $reasons[] = "📋 Experience level not specified in profile";
        }

        // Add success prediction if AI is available
        if ($this->aiService->isAvailable()) {
            $prediction = $this->getAISuccessPrediction($job, $gigWorker);
            if ($prediction && $prediction['success']) {
                $probability = $prediction['prediction']['probability'];
                $reasons[] = "🔮 AI Success Prediction: {$probability}% chance of successful project completion";
            }
        }

        // If no reasons found, provide basic info
        if (empty($reasons)) {
            $reasons[] = "📝 Limited match - consider updating your skills and experience level";
        }

        return $reasons;
    }

    /**
     * Get AI-powered explanation for match
     */
    private function getAIExplanation(GigJob $job, User $gigWorker, float $score): ?string
    {
        if (!$this->aiService->isAvailable()) {
            return null;
        }

        try {
            $jobData = [
                'id' => $job->id,
                'title' => $job->title,
                'description' => $job->description,
                'required_skills' => $job->required_skills ?? [],
                'experience_level' => $job->experience_level
            ];

            $gigWorkerData = [
                'id' => $gigWorker->id,
                'name' => $gigWorker->first_name . ' ' . $gigWorker->last_name,
                'skills' => $gigWorker->skills ?? [],
                'experience_level' => $gigWorker->experience_level,
                'bio' => $gigWorker->bio
            ];

            return $this->aiService->generateMatchExplanation($jobData, $gigWorkerData, $score);
        } catch (\Exception $e) {
            \Log::error('AI explanation generation failed', [
                'job_id' => $job->id,
                'gig_worker_id' => $gigWorker->id,
                'error' => $e->getMessage()
            ]);
            return $this->getFallbackExplanation($jobData, $gigWorkerData, $score);
        }
    }

    private function getAISuccessPrediction(GigJob $job, User $gigWorker): ?array
    {
        if (!$this->aiService->isAvailable()) {
            return null;
        }

        try {
            $jobData = [
                'id' => $job->id,
                'title' => $job->title,
                'description' => $job->description,
                'required_skills' => $job->required_skills ?? [],
                'experience_level' => $job->experience_level
            ];

            $gigWorkerData = [
                'id' => $gigWorker->id,
                'name' => $gigWorker->first_name . ' ' . $gigWorker->last_name,
                'skills' => $gigWorker->skills ?? [],
                'experience_level' => $gigWorker->experience_level
            ];

            return $this->aiService->generateSuccessPrediction($jobData, $gigWorkerData);
        } catch (\Exception $e) {
            \Log::error('AI success prediction failed', [
                'job_id' => $job->id,
                'gig_worker_id' => $gigWorker->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get job recommendations for gig worker
     */
    public function getJobRecommendations(User $gigWorker): array
    {
        $matches = $this->findMatchingJobs($gigWorker, 10);

        return [
            'matches' => $matches->toArray(),
            'total_jobs' => GigJob::where('status', 'open')->count(),
            'match_count' => $matches->count(),
            'suggested_improvements' => $this->getSuggestedImprovements($gigWorker)
        ];
    }

    /**
     * Get suggested improvements for gig worker
     */
    private function getSuggestedImprovements(User $gigWorker): array
    {
        $suggestions = [];

        if (!$gigWorker->skills || count($gigWorker->skills) < 3) {
            $suggestions[] = "Add more skills to your profile to increase job matches";
        }

        if (!$gigWorker->bio || strlen($gigWorker->bio) < 100) {
            $suggestions[] = "Write a detailed bio to attract more employers";
        }

        if (!$gigWorker->hourly_rate) {
            $suggestions[] = "Set your hourly rate to help employers understand your pricing";
        }

        $reviewCount = $gigWorker->receivedReviews()->count();
        if ($reviewCount < 5) {
            $suggestions[] = "Complete more projects to build your reputation";
        }

        return $suggestions;
    }

    /**
     * Get AI-powered skill recommendations for gig worker
     */
    public function getAISkillRecommendations(User $gigWorker): array
    {
        if (!$this->aiService->isAvailable()) {
            return [
                'success' => false,
                'message' => 'AI service is not available'
            ];
        }

        try {
            $gigWorkerData = [
                'id' => $gigWorker->id,
                'name' => $gigWorker->first_name . ' ' . $gigWorker->last_name,
                'skills' => $gigWorker->skills ?? [],
                'experience_level' => $gigWorker->experience_level,
                'bio' => $gigWorker->bio
            ];

            // Get market trends data
            $marketTrends = [
                'trending_skills' => $this->getTrendingSkills(),
                'high_demand_skills' => $this->getHighDemandSkills(),
                'emerging_technologies' => $this->getEmergingTechnologies()
            ];

            return $this->aiService->generateSkillRecommendations($gigWorkerData, $marketTrends);
        } catch (\Exception $e) {
            \Log::error('AI skill recommendations failed', [
                'gig_worker_id' => $gigWorker->id,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to generate skill recommendations'
            ];
        }
    }

    /**
     * Get AI-powered job recommendations for gig worker
     */
    public function getAIJobRecommendations(User $gigWorker): array
    {
        $matches = $this->findMatchingJobs($gigWorker, 10);

        $enhancedMatches = $matches->map(function ($match) use ($gigWorker) {
            $job = $match['job'];
            
            $aiExplanation = $this->getAIExplanation($match['job'], $gigWorker, $match['match_score']);
            
            // Get AI success prediction
            $prediction = $this->getAISuccessPrediction($match['job'], $gigWorker);
            
            return array_merge($match, [
                'ai_explanation' => $aiExplanation,
                'success_prediction' => $prediction
            ]);
        });

        return [
            'matches' => $enhancedMatches->toArray(),
            'total_jobs' => GigJob::where('status', 'open')->count(),
            'match_count' => $matches->count(),
            'suggested_improvements' => $this->getSuggestedImprovements($gigWorker),
        ];
    }

    /**
     * Get AI-powered gig worker recommendations for a job
     */
    public function getAIMatchingGigWorkers(GigJob $job): array
    {
        $matches = $this->findMatchingGigWorkers($job, 20);

        $enhancedMatches = $matches->map(function ($match) use ($job) {
            // Get AI explanation for this match
            $aiExplanation = $this->getAIExplanation($job, $match['gig_worker'], $match['match_score']);
            
            // Get AI success prediction
            $prediction = $this->getAISuccessPrediction($job, $match['gig_worker']);
            
            return array_merge($match, [
                'ai_explanation' => $aiExplanation,
                'success_prediction' => $prediction
            ]);
        });

        return [
            'matches' => $enhancedMatches->toArray(),
            'total_gig_workers' => User::where('user_type', 'gig_worker')->count(),
            'match_count' => $matches->count()
        ];
    }
}

class SkillRecommendationStat
{
    protected function taxonomy(): array
    {
        return Cache::rememberForever('full_taxonomy', function () {
            $path = base_path('full_freelance_services_taxonomy.json');
            $json = file_exists($path) ? file_get_contents($path) : '{}';
            $data = json_decode($json, true) ?: [];
            return $data;
        });
    }

    protected function flattenTaxonomy(): array
    {
        $data = $this->taxonomy();
        $skills = [];
        $categories = [];
        foreach (($data['services'] ?? []) as $service) {
            foreach (($service['categories'] ?? []) as $cat) {
                $categories[] = [
                    'name' => $cat['name'] ?? '',
                    'skills' => $cat['skills'] ?? [],
                ];
                foreach (($cat['skills'] ?? []) as $s) {
                    $skills[$s] = true;
                }
            }
        }
        return [
            'skills' => array_keys($skills),
            'categories' => $categories,
        ];
    }

    protected function synonyms(): array
    {
        return [
            'react js' => 'react',
            'react.js' => 'react',
            'js' => 'javascript',
            'node' => 'node.js',
            'adobe premiere' => 'adobe premiere pro',
            'davinci' => 'davinci resolve',
            'ux' => 'ui/ux',
            'ui' => 'ui/ux',
            'ml' => 'machine learning',
            'ai' => 'machine learning',
            'unity3d' => 'unity',
            'c sharp' => 'c#',
            'c plus plus' => 'c++',
            'frontend' => 'web development',
            'backend' => 'web development',
            'laravel php' => 'laravel',
        ];
    }

    protected function categorySynonyms(): array
    {
        return [
            'graphic designer' => 'Graphic Design',
            'logo designer' => 'Logo Design & Branding',
            'ui designer' => 'UI/UX Design',
            'ux designer' => 'UI/UX Design',
            'ui/ux designer' => 'UI/UX Design',
            'web designer' => 'Web Design',
            'video editor' => 'Video Editing',
            '3d modeler' => '3D Modeling',
            'frontend developer' => 'Web Development',
            'backend developer' => 'Web Development',
            'full stack developer' => 'Web Development',
            'mobile developer' => 'Mobile App Development',
            'react native developer' => 'Mobile App Development',
            'flutter developer' => 'Mobile App Development',
            'unity developer' => 'Game Development',
            'software developer' => 'Software Development',
            'api developer' => 'API Integration & Automation',
            'database administrator' => 'Database Management',
            'cybersecurity analyst' => 'Cybersecurity',
            'ai engineer' => 'AI & Machine Learning',
            'seo specialist' => 'SEO',
            'social media manager' => 'Social Media Marketing',
            'content writer' => 'Article & Blog Writing',
            'technical writer' => 'Technical Writing',
            'translator' => 'Translation',
            'photographer' => 'Photography',
            'project manager' => 'Project Management',
            'accountant' => 'Accounting & Bookkeeping',
            'legal consultant' => 'Legal Consulting',
            'data analyst' => 'Data Analysis',
            'data scientist' => 'Machine Learning',
            'shopify developer' => 'E-commerce Development',
            'woocommerce developer' => 'E-commerce Development',
            'cad designer' => 'CAD Design',
            'mechanical engineer' => 'Mechanical Engineering',
            'electrical engineer' => 'Electrical Engineering',
            'civil engineer' => 'Civil Engineering',
        ];
    }

    protected function normalize(string $text): string
    {
        $t = Str::lower($text);
        $t = preg_replace('/[^a-z0-9+.# ]/i', ' ', $t);
        $t = preg_replace('/\s+/', ' ', $t);
        return trim($t);
    }

    protected function tokenize(string $text): array
    {
        return array_values(array_filter(explode(' ', $this->normalize($text))));
    }

    protected function rootify(string $word): string
    {
        $w = $word;
        $rules = [
            ['ers', 3], ['er', 2], ['ors', 3], ['or', 2],
            ['ing', 3], ['ments', 5], ['ment', 4], ['ions', 4], ['ion', 3],
            ['ists', 4], ['ist', 3], ['als', 3], ['al', 2], ['s', 1],
        ];
        foreach ($rules as [$end, $cut]) {
            if (Str::endsWith($w, $end) && Str::length($w) > $cut) {
                return Str::substr($w, 0, Str::length($w) - $cut);
            }
        }
        return $w;
    }

    protected function matchCategories(string $text, array $categoryIndex): array
    {
        $textNorm = $this->normalize($text);
        $tokensRoot = array_map(fn ($t) => $this->rootify($t), $this->tokenize($text));
        $matched = [];

        foreach ($categoryIndex as $cat) {
            $catNorm = $this->normalize($cat['name']);
            $catTokensRoot = array_map(fn ($t) => $this->rootify($t), explode(' ', $catNorm));

            if (Str::contains($textNorm, $catNorm)) {
                $matched[$cat['name']] = true;
                continue;
            }

            $overlap = count(array_intersect($catTokensRoot, $tokensRoot));
            $threshold = min(2, count($catTokensRoot));
            if ($overlap >= $threshold) {
                $matched[$cat['name']] = true;
            }
        }

        foreach ($this->categorySynonyms() as $alias => $catName) {
            if (Str::contains($textNorm, $this->normalize($alias))) {
                $matched[$catName] = true;
            }
        }

        return array_keys($matched);
    }

    public function recommend(string $title, string $description, array $exclude = []): array
    {
        $flat = $this->flattenTaxonomy();
        $categories = $flat['categories'];
        $allSkills = $flat['skills'];
        $excludeSet = collect($exclude)->map(fn ($s) => $this->normalize($s))->flip();

        $text = trim($title . ' ' . $description);
        $textNorm = $this->normalize($text);
        $tokens = $this->tokenize($text);

        // Category matches (high-priority skills)
        $matchedCategories = $this->matchCategories($text, $categories);
        $scored = [];
        foreach ($matchedCategories as $catName) {
            $cat = collect($categories)->first(fn ($c) => $c['name'] === $catName);
            if (!$cat) continue;
            foreach (($cat['skills'] ?? []) as $s) {
                if (!$excludeSet->has($this->normalize($s))) {
                    $scored[$s] = max($scored[$s] ?? 0, 5);
                }
            }
        }

        // Direct skill matching
        foreach ($allSkills as $s) {
            if ($excludeSet->has($this->normalize($s))) continue;
            $sNorm = $this->normalize($s);
            $score = 0;
            if (Str::contains($textNorm, $sNorm)) $score += 3;
            $sTokens = explode(' ', $sNorm);
            $tokenHits = count(array_intersect($sTokens, $tokens));
            if ($tokenHits >= min(2, count($sTokens))) $score += 2;
            foreach ($this->synonyms() as $key => $val) {
                $k = $this->normalize($key);
                $v = $this->normalize($val);
                if (Str::contains($textNorm, $k) && ($v === $sNorm || Str::contains($sNorm, $v))) {
                    $score += 2;
                }
            }
            if ($score > 0) {
                $scored[$s] = max($scored[$s] ?? 0, $score);
            }
        }

        // Emerging skills (simple heuristic; can be replaced with market feed)
        $emerging = $this->suggestEmergingSkills($title, $description, $excludeSet->keys()->all());

        // Innovative roles (combine category and keyword signals)
        $innovativeRoles = $this->suggestInnovativeRoles($title, $description, array_keys($scored));

        // Sort skills by score and return top N
        arsort($scored);
        $taxonomySkills = array_slice(array_keys($scored), 0, 12);

        return [
            'taxonomy_skills' => $taxonomySkills,
            'emerging_skills' => $emerging,
            'innovative_roles' => $innovativeRoles,
        ];
    }

    protected function suggestEmergingSkills(string $title, string $description, array $exclude = []): array
    {
        $text = Str::lower($title . ' ' . $description);
        $catalog = [
            'AI Prompt Engineering',
            'Generative AI (Stable Diffusion, Midjourney)',
            'LangChain',
            'LLM Fine-tuning',
            'RAG (Retrieval Augmented Generation)',
            'Web3 dApp Integration',
            'Solana Development',
            'AR/VR Prototyping',
            'Edge Functions (Cloudflare Workers, Vercel Edge)',
            'Serverless Automation (Zapier, n8n, Make.com)',
            'DataOps',
            'MLOps',
        ];
        $signals = [
            'ai' => 2, 'ml' => 2, 'machine learning' => 2, 'llm' => 3, 'chatgpt' => 3,
            'web3' => 2, 'blockchain' => 2, 'solidity' => 2, 'ethereum' => 2,
            'ar' => 2, 'vr' => 2,
            'automation' => 2, 'serverless' => 2,
            'data' => 1, 'analytics' => 1, 'ops' => 1,
        ];

        $score = [];
        foreach ($signals as $kw => $w) {
            if (Str::contains($text, $kw)) {
                foreach ($catalog as $s) {
                    $score[$s] = ($score[$s] ?? 0) + $w;
                }
            }
        }

        // Exclude already chosen skills
        foreach ($exclude as $ex) {
            foreach ($catalog as $s) {
                if (Str::lower($s) === Str::lower($ex)) {
                    unset($score[$s]);
                }
            }
        }

        arsort($score);
        return array_slice(array_keys($score), 0, 8);
    }

    protected function suggestInnovativeRoles(string $title, string $description, array $skills): array
    {
        $text = Str::lower($title . ' ' . $description);
        $roles = [
            ['signals' => ['ai', 'marketing'], 'role' => 'AI Marketing Strategist'],
            ['signals' => ['ai', 'content'], 'role' => 'AI Content Architect'],
            ['signals' => ['web3', 'frontend'], 'role' => 'Web3 Frontend Engineer'],
            ['signals' => ['data', 'ops'], 'role' => 'DataOps Engineer'],
            ['signals' => ['ml', 'ops'], 'role' => 'MLOps Engineer'],
            ['signals' => ['automation', 'no-code'], 'role' => 'Automation Solutions Architect'],
            ['signals' => ['ar', 'vr', 'design'], 'role' => 'XR Experience Designer'],
        ];

        $out = [];
        foreach ($roles as $r) {
            $hit = 0;
            foreach ($r['signals'] as $sig) {
                if (Str::contains($text, $sig)) $hit++;
                foreach ($skills as $s) {
                    if (Str::contains(Str::lower($s), $sig)) $hit++;
                }
            }
            if ($hit >= 2) {
                $out[] = $r['role'];
            }
        }

        return array_values(array_unique($out));
    }

    public function recordAcceptance(string $type, string $value, array $context = []): void
    {
        SkillRecommendationStat::query()->updateOrCreate(
            ['type' => $type, 'value' => $value],
            [
                'accepted_count' => \DB::raw('accepted_count + 1'),
                'last_accepted_at' => now(),
                'context' => $context,
            ]
        );
    }
}
