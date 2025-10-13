<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\Builder;

class GigWorkerController extends Controller
{
    /**
     * Get paginated list of gig workers with filtering and search
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('user_type', 'gig_worker')
            ->where('profile_completed', true)
            ->where('profile_status', 'approved')
            ->with(['receivedReviews']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('professional_title', 'like', "%{$search}%")
                  ->orWhere('bio', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
                
                // Search in skills array
                if (is_string($search)) {
                    $q->orWhereJsonContains('skills', $search);
                }
            });
        }

        // Filter by experience level
        if ($request->filled('experience_level') && $request->get('experience_level') !== 'all') {
            $query->where('experience_level', $request->get('experience_level'));
        }

        // Filter by skills
        if ($request->filled('skills')) {
            $skills = $request->get('skills');
            if (is_array($skills)) {
                foreach ($skills as $skill) {
                    $query->whereJsonContains('skills', $skill);
                }
            } elseif (is_string($skills)) {
                $query->whereJsonContains('skills', $skills);
            }
        }

        // Filter by hourly rate range
        if ($request->filled('min_rate')) {
            $query->where('hourly_rate', '>=', $request->get('min_rate'));
        }
        if ($request->filled('max_rate')) {
            $query->where('hourly_rate', '<=', $request->get('max_rate'));
        }

        // Filter by location
        if ($request->filled('location')) {
            $location = $request->get('location');
            $query->where('location', 'like', "%{$location}%");
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        switch ($sortBy) {
            case 'rating':
                // Sort by average rating (calculated from reviews)
                $query->withAvg('receivedReviews', 'rating')
                      ->orderBy('received_reviews_avg_rating', $sortOrder);
                break;
            case 'hourly_rate':
                $query->orderBy('hourly_rate', $sortOrder);
                break;
            case 'name':
                $query->orderBy('first_name', $sortOrder)
                      ->orderBy('last_name', $sortOrder);
                break;
            case 'experience_level':
                // Custom ordering for experience levels
                $query->orderByRaw("
                    CASE experience_level 
                        WHEN 'expert' THEN 3 
                        WHEN 'intermediate' THEN 2 
                        WHEN 'beginner' THEN 1 
                        ELSE 0 
                    END " . ($sortOrder === 'desc' ? 'DESC' : 'ASC')
                );
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = min($request->get('per_page', 12), 50); // Max 50 items per page
        $gigWorkers = $query->paginate($perPage);

        // Transform the data to include calculated fields
        $gigWorkers->getCollection()->transform(function ($gigWorker) {
            return [
                'id' => $gigWorker->id,
                'name' => $gigWorker->full_name,
                'first_name' => $gigWorker->first_name,
                'last_name' => $gigWorker->last_name,
                'professional_title' => $gigWorker->professional_title,
                'bio' => $gigWorker->bio,
                'location' => $gigWorker->location,
                'hourly_rate' => $gigWorker->hourly_rate,
                'experience_level' => $gigWorker->experience_level,
                'skills' => $gigWorker->skills ?? [],
                'languages' => $gigWorker->languages ?? [],
                'portfolio_url' => $gigWorker->portfolio_url,
                'profile_photo' => $gigWorker->profile_photo,
                'avatar' => $gigWorker->avatar ?? $gigWorker->profile_photo,
                'rating' => round($gigWorker->average_rating, 1),
                'review_count' => $gigWorker->receivedReviews->count(),
                'completed_projects' => $gigWorker->gigWorkerProjects()->where('status', 'completed')->count(),
                'member_since' => $gigWorker->created_at,
                'last_active' => $gigWorker->updated_at,
                'completion_rate' => $gigWorker->completion_rate,
                'total_earnings' => $gigWorker->total_earnings,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $gigWorkers->items(),
            'pagination' => [
                'current_page' => $gigWorkers->currentPage(),
                'last_page' => $gigWorkers->lastPage(),
                'per_page' => $gigWorkers->perPage(),
                'total' => $gigWorkers->total(),
                'from' => $gigWorkers->firstItem(),
                'to' => $gigWorkers->lastItem(),
                'has_more_pages' => $gigWorkers->hasMorePages(),
            ],
            'filters' => [
                'search' => $request->get('search'),
                'experience_level' => $request->get('experience_level'),
                'skills' => $request->get('skills'),
                'min_rate' => $request->get('min_rate'),
                'max_rate' => $request->get('max_rate'),
                'location' => $request->get('location'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ]
        ]);
    }

    /**
     * Get a specific gig worker profile
     */
    public function show(Request $request, $id): JsonResponse
    {
        $gigWorker = User::where('user_type', 'gig_worker')
            ->where('id', $id)
            ->where('profile_completed', true)
            ->where('profile_status', 'approved')
            ->with([
                'receivedReviews.reviewer',
                'gigWorkerProjects.job',
                'gigWorkerProjects.employer'
            ])
            ->first();

        if (!$gigWorker) {
            return response()->json([
                'success' => false,
                'message' => 'Gig worker not found or profile not available'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $gigWorker->id,
                'name' => $gigWorker->full_name,
                'first_name' => $gigWorker->first_name,
                'last_name' => $gigWorker->last_name,
                'professional_title' => $gigWorker->professional_title,
                'bio' => $gigWorker->bio,
                'location' => $gigWorker->location,
                'hourly_rate' => $gigWorker->hourly_rate,
                'experience_level' => $gigWorker->experience_level,
                'skills' => $gigWorker->skills ?? [],
                'languages' => $gigWorker->languages ?? [],
                'portfolio_url' => $gigWorker->portfolio_url,
                'profile_photo' => $gigWorker->profile_photo,
                'avatar' => $gigWorker->avatar ?? $gigWorker->profile_photo,
                'rating' => round($gigWorker->average_rating, 1),
                'review_count' => $gigWorker->receivedReviews->count(),
                'completed_projects' => $gigWorker->gigWorkerProjects()->where('status', 'completed')->count(),
                'member_since' => $gigWorker->created_at,
                'last_active' => $gigWorker->updated_at,
                'completion_rate' => $gigWorker->completion_rate,
                'total_earnings' => $gigWorker->total_earnings,
                'reviews' => $gigWorker->receivedReviews->take(10)->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'reviewer_name' => $review->reviewer->full_name,
                        'created_at' => $review->created_at,
                    ];
                }),
                'recent_projects' => $gigWorker->gigWorkerProjects()->latest()->take(5)->get()->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'title' => $project->job->title ?? 'Project',
                        'status' => $project->status,
                        'completed_at' => $project->completed_at,
                        'employer_name' => $project->employer->full_name ?? 'Unknown',
                    ];
                }),
            ]
        ]);
    }

    /**
     * Get available skills from all gig workers for filtering
     */
    public function getAvailableSkills(): JsonResponse
    {
        $skills = User::where('user_type', 'gig_worker')
            ->where('profile_completed', true)
            ->where('profile_status', 'approved')
            ->whereNotNull('skills')
            ->pluck('skills')
            ->flatten()
            ->unique()
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $skills
        ]);
    }

    /**
     * Get gig worker statistics for dashboard
     */
    public function getStats(): JsonResponse
    {
        $stats = [
            'total_gig_workers' => User::where('user_type', 'gig_worker')
                ->where('profile_completed', true)
                ->where('profile_status', 'approved')
                ->count(),
            'experience_levels' => User::where('user_type', 'gig_worker')
                ->where('profile_completed', true)
                ->where('profile_status', 'approved')
                ->selectRaw('experience_level, COUNT(*) as count')
                ->groupBy('experience_level')
                ->pluck('count', 'experience_level'),
            'average_hourly_rate' => User::where('user_type', 'gig_worker')
                ->where('profile_completed', true)
                ->where('profile_status', 'approved')
                ->whereNotNull('hourly_rate')
                ->avg('hourly_rate'),
            'top_skills' => User::where('user_type', 'gig_worker')
                ->where('profile_completed', true)
                ->where('profile_status', 'approved')
                ->whereNotNull('skills')
                ->pluck('skills')
                ->flatten()
                ->countBy()
                ->sortDesc()
                ->take(10),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}