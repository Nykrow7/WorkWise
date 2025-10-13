<?php

namespace App\Http\Controllers;

use App\Models\Bid;
use App\Models\Project;
use App\Models\GigJob;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class GigWorkerDashboardController extends Controller
{
    /**
     * Display the gig worker dashboard
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isGigWorker()) {
            abort(403, 'Access denied. Only gig workers can access this dashboard.');
        }

        $data = [
            'auth' => ['user' => $user],
            'stats' => $this->getGigWorkerStats($user),
            'activeContracts' => $this->getActiveContracts($user),
            'jobInvites' => $this->getJobInvites($user),
            'earningsSummary' => $this->getEarningsSummary($user),
            'aiRecommendations' => $this->getAIRecommendations($user),
            'recentActivity' => $this->getRecentActivity($user),
            'skillsProgress' => $this->getSkillsProgress($user),
            'upcomingDeadlines' => $this->getUpcomingDeadlines($user),
        ];

        return Inertia::render('GigWorkerDashboard', $data);
    }

    /**
     * Get comprehensive stats for gig worker
     */
    private function getGigWorkerStats($user)
    {
        $now = Carbon::now();
        $lastMonth = $now->copy()->subMonth();

        // Active bids
        $activeBids = Bid::where('gig_worker_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $lastMonthActiveBids = Bid::where('gig_worker_id', $user->id)
            ->where('status', 'pending')
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $now->copy()->startOfMonth())
            ->count();

        // Active contracts
        $activeContracts = Project::where('gig_worker_id', $user->id)
            ->whereIn('status', ['active', 'in_progress'])
            ->count();

        $lastMonthActiveContracts = Project::where('gig_worker_id', $user->id)
            ->whereIn('status', ['active', 'in_progress'])
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $now->copy()->startOfMonth())
            ->count();

        // Total earnings
        $totalEarnings = Transaction::where('payee_id', $user->id)
            ->where('type', 'release')
            ->where('status', 'completed')
            ->sum('net_amount');

        $lastMonthEarnings = Transaction::where('payee_id', $user->id)
            ->where('type', 'release')
            ->where('status', 'completed')
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $now->copy()->startOfMonth())
            ->sum('net_amount');

        // Success rate calculation
        $totalBids = Bid::where('gig_worker_id', $user->id)->count();
        $acceptedBids = Bid::where('gig_worker_id', $user->id)
            ->where('status', 'accepted')
            ->count();
        $successRate = $totalBids > 0 ? round(($acceptedBids / $totalBids) * 100, 1) : 0;

        return [
            'activeBids' => $activeBids,
            'bidsTrend' => $this->calculateTrend($activeBids, $lastMonthActiveBids),
            'bidsTrendValue' => abs($activeBids - $lastMonthActiveBids),
            
            'activeContracts' => $activeContracts,
            'contractsTrend' => $this->calculateTrend($activeContracts, $lastMonthActiveContracts),
            'contractsTrendValue' => abs($activeContracts - $lastMonthActiveContracts),
            
            'totalEarnings' => $totalEarnings,
            'earningsTrend' => $this->calculateTrend($totalEarnings, $lastMonthEarnings),
            'earningsTrendValue' => abs($totalEarnings - $lastMonthEarnings),
            
            'successRate' => $successRate,
            'successRateTrend' => 'up', // This would need more complex calculation
            'successRateTrendValue' => 0,
        ];
    }

    /**
     * Get active contracts for gig worker
     */
    private function getActiveContracts($user)
    {
        return Project::where('gig_worker_id', $user->id)
            ->whereIn('status', ['active', 'in_progress'])
            ->with(['job', 'employer'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->job->title,
                    'client' => $project->employer->first_name . ' ' . $project->employer->last_name,
                    'amount' => $project->agreed_amount,
                    'status' => $project->status,
                    'progress' => $project->progress_percentage ?? 0,
                    'deadline' => $project->deadline,
                    'started_at' => $project->started_at,
                ];
            });
    }

    /**
     * Get job invites for gig worker
     */
    private function getJobInvites($user)
    {
        // For now, we'll get recent open jobs that match the gig worker's skills
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
            ->limit(5)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'client' => $job->employer->first_name . ' ' . $job->employer->last_name,
                    'budget' => $job->getBudgetDisplayAttribute(),
                    'skills' => $job->required_skills,
                    'posted_at' => $job->created_at,
                    'description' => substr($job->description, 0, 150) . '...',
                ];
            });

        return $jobs;
    }

    /**
     * Get earnings summary for gig worker
     */
    private function getEarningsSummary($user)
    {
        $now = Carbon::now();
        $thisMonth = $now->copy()->startOfMonth();
        $lastMonth = $now->copy()->subMonth()->startOfMonth();
        $thisYear = $now->copy()->startOfYear();

        $thisMonthEarnings = Transaction::where('payee_id', $user->id)
            ->where('type', 'release')
            ->where('status', 'completed')
            ->where('created_at', '>=', $thisMonth)
            ->sum('net_amount');

        $lastMonthEarnings = Transaction::where('payee_id', $user->id)
            ->where('type', 'release')
            ->where('status', 'completed')
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $thisMonth)
            ->sum('net_amount');

        $thisYearEarnings = Transaction::where('payee_id', $user->id)
            ->where('type', 'release')
            ->where('status', 'completed')
            ->where('created_at', '>=', $thisYear)
            ->sum('net_amount');

        $pendingEarnings = Project::where('gig_worker_id', $user->id)
            ->whereIn('status', ['active', 'in_progress', 'completed'])
            ->where('payment_released', false)
            ->sum('agreed_amount');

        // Get monthly earnings for chart (last 6 months)
        $monthlyEarnings = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            
            $earnings = Transaction::where('payee_id', $user->id)
                ->where('type', 'release')
                ->where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('net_amount');
                
            $monthlyEarnings[] = [
                'month' => $month->format('M'),
                'earnings' => $earnings
            ];
        }

        return [
            'thisMonth' => $thisMonthEarnings,
            'lastMonth' => $lastMonthEarnings,
            'thisYear' => $thisYearEarnings,
            'pending' => $pendingEarnings,
            'monthlyTrend' => $thisMonthEarnings >= $lastMonthEarnings ? 'up' : 'down',
            'monthlyEarnings' => $monthlyEarnings,
        ];
    }

    /**
     * Get AI job recommendations for gig worker
     */
    private function getAIRecommendations($user)
    {
        $userSkills = $user->skills ?? [];
        $userExperience = $user->experience_level ?? 'beginner';
        $userRate = $user->hourly_rate ?? 0;

        // Simple recommendation algorithm based on skills and experience
        $recommendations = GigJob::where('status', 'open')
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
            ->when($userRate > 0, function ($query) use ($userRate) {
                // Recommend jobs within 20% of user's rate
                $minBudget = $userRate * 0.8;
                $maxBudget = $userRate * 1.2;
                $query->where(function ($q) use ($minBudget, $maxBudget) {
                    $q->whereBetween('budget_min', [$minBudget, $maxBudget])
                      ->orWhereBetween('budget_max', [$minBudget, $maxBudget]);
                });
            })
            ->with(['employer'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(function ($job) use ($userSkills) {
                $matchingSkills = array_intersect($userSkills, $job->required_skills ?? []);
                $matchScore = count($matchingSkills) / max(count($userSkills), 1) * 100;
                
                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'client' => $job->employer->first_name . ' ' . $job->employer->last_name,
                    'budget' => $job->getBudgetDisplayAttribute(),
                    'skills' => $job->required_skills,
                    'matchScore' => round($matchScore),
                    'matchingSkills' => $matchingSkills,
                    'posted_at' => $job->created_at,
                    'description' => substr($job->description, 0, 120) . '...',
                ];
            });

        return $recommendations;
    }

    /**
     * Get recent activity for gig worker
     */
    private function getRecentActivity($user)
    {
        $activities = collect();

        // Recent bids
        $recentBids = Bid::where('gig_worker_id', $user->id)
            ->with(['job'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($bid) {
                return [
                    'type' => 'bid',
                    'title' => 'Submitted bid for "' . $bid->job->title . '"',
                    'description' => 'Bid amount: ₱' . number_format($bid->bid_amount, 2),
                    'status' => $bid->status,
                    'created_at' => $bid->created_at,
                ];
            });

        // Recent project updates
        $recentProjects = Project::where('gig_worker_id', $user->id)
            ->with(['job'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'type' => 'project',
                    'title' => 'Project update: "' . $project->job->title . '"',
                    'description' => 'Status: ' . ucfirst($project->status),
                    'status' => $project->status,
                    'created_at' => $project->updated_at,
                ];
            });

        return $activities->merge($recentBids)
            ->merge($recentProjects)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();
    }

    /**
     * Calculate trend direction
     */
    private function calculateTrend($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 'up' : 'neutral';
        }
        
        return $current > $previous ? 'up' : ($current < $previous ? 'down' : 'neutral');
    }

    /**
     * Get skills progress for gig worker
     */
    private function getSkillsProgress($user)
    {
        // Mock data for skills progress - replace with actual implementation
        return [
            [
                'name' => 'Web Development',
                'level' => 85,
                'projectsCompleted' => 12
            ],
            [
                'name' => 'Mobile Development',
                'level' => 70,
                'projectsCompleted' => 8
            ],
            [
                'name' => 'UI/UX Design',
                'level' => 60,
                'projectsCompleted' => 5
            ],
            [
                'name' => 'Digital Marketing',
                'level' => 45,
                'projectsCompleted' => 3
            ]
        ];
    }

    /**
     * Get upcoming deadlines for gig worker
     */
    private function getUpcomingDeadlines($user)
    {
        $upcomingProjects = Project::where('gig_worker_id', $user->id)
            ->where('status', 'in_progress')
            ->whereNotNull('deadline')
            ->where('deadline', '>', Carbon::now())
            ->orderBy('deadline', 'asc')
            ->with(['job', 'employer'])
            ->limit(5)
            ->get();

        return $upcomingProjects->map(function ($project) {
            $deadline = Carbon::parse($project->deadline);
            $daysLeft = Carbon::now()->diffInDays($deadline, false);
            
            return [
                'id' => $project->id,
                'projectTitle' => $project->job->title ?? 'Untitled Project',
                'clientName' => $project->employer->name ?? 'Unknown Client',
                'daysLeft' => max(0, $daysLeft),
                'completionPercentage' => $project->completion_percentage ?? 0,
                'deadline' => $deadline->toDateString()
            ];
        })->toArray();
    }
}