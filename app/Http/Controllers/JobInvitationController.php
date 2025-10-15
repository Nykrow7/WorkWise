<?php

namespace App\Http\Controllers;

use App\Models\JobInvitation;
use App\Models\GigJob;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class JobInvitationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Send a job invitation to a gig worker
     */
    public function sendInvitation(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'job_id' => 'required|exists:gig_jobs,id',
                'gig_worker_id' => 'required|exists:users,id',
                'message' => 'nullable|string|max:1000'
            ]);

            $employer = Auth::user();
            
            // Verify the employer owns the job
            $job = GigJob::where('id', $validated['job_id'])
                         ->where('employer_id', $employer->id)
                         ->first();

            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found or you do not have permission to invite for this job.'
                ], 403);
            }

            // Verify the gig worker exists and is a gig worker
            $gigWorker = User::where('id', $validated['gig_worker_id'])
                            ->where('user_type', 'gig_worker')
                            ->first();

            if (!$gigWorker) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gig worker not found.'
                ], 404);
            }

            // Check if invitation already exists
            $existingInvitation = JobInvitation::where('job_id', $validated['job_id'])
                                              ->where('gig_worker_id', $validated['gig_worker_id'])
                                              ->first();

            if ($existingInvitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'An invitation has already been sent to this gig worker for this job.'
                ], 409);
            }

            DB::beginTransaction();

            // Create the invitation
            $invitation = JobInvitation::create([
                'job_id' => $validated['job_id'],
                'employer_id' => $employer->id,
                'gig_worker_id' => $validated['gig_worker_id'],
                'message' => $validated['message'] ?? null,
                'status' => 'pending',
                'sent_at' => now(),
                'expires_at' => now()->addDays(7) // Invitations expire after 7 days
            ]);

            // Send real-time notification to gig worker
            $this->notificationService->create([
                'user_id' => $gigWorker->id,
                'type' => 'job_invitation',
                'title' => '🎯 New Job Invitation',
                'message' => "You've been invited to work on '{$job->title}' by {$employer->first_name} {$employer->last_name}",
                'data' => [
                    'invitation_id' => $invitation->id,
                    'job_id' => $job->id,
                    'job_title' => $job->title,
                    'employer_id' => $employer->id,
                    'employer_name' => $employer->first_name . ' ' . $employer->last_name,
                    'employer_avatar' => $employer->avatar,
                    'budget' => $job->budget,
                    'message' => $validated['message'],
                    'expires_at' => $invitation->expires_at->toISOString()
                ],
                'action_url' => route('job-invitations.show', $invitation->id),
                'icon' => 'briefcase'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Job invitation sent successfully.',
                'data' => [
                    'invitation_id' => $invitation->id,
                    'gig_worker_name' => $gigWorker->first_name . ' ' . $gigWorker->last_name,
                    'job_title' => $job->title
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job invitation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while sending the invitation. Please try again.'
            ], 500);
        }
    }

    /**
     * Get job invitations for the authenticated gig worker
     */
    public function getInvitations(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->user_type !== 'gig_worker') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only gig workers can view job invitations.'
                ], 403);
            }

            $invitations = JobInvitation::with(['job', 'employer'])
                ->where('gig_worker_id', $user->id)
                ->orderBy('sent_at', 'desc')
                ->get()
                ->map(function ($invitation) {
                    return [
                        'id' => $invitation->id,
                        'job' => [
                            'id' => $invitation->job->id,
                            'title' => $invitation->job->title,
                            'description' => $invitation->job->description,
                            'budget' => $invitation->job->budget,
                            'required_skills' => $invitation->job->required_skills,
                            'location' => $invitation->job->location,
                            'job_type' => $invitation->job->job_type,
                        ],
                        'employer' => [
                            'id' => $invitation->employer->id,
                            'name' => $invitation->employer->first_name . ' ' . $invitation->employer->last_name,
                            'profile_photo' => $invitation->employer->profile_photo,
                            'company' => $invitation->employer->company,
                        ],
                        'message' => $invitation->message,
                        'status' => $invitation->status,
                        'sent_at' => $invitation->sent_at->format('Y-m-d H:i:s'),
                        'expires_at' => $invitation->expires_at ? $invitation->expires_at->format('Y-m-d H:i:s') : null,
                        'is_expired' => $invitation->isExpired(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $invitations
            ]);

        } catch (\Exception $e) {
            Log::error('Get invitations error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching invitations.'
            ], 500);
        }
    }

    /**
     * Respond to a job invitation (accept/decline)
     */
    public function respondToInvitation(Request $request, $invitationId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'response' => 'required|in:accept,decline'
            ]);

            $user = Auth::user();
            
            $invitation = JobInvitation::with(['job', 'employer'])
                ->where('id', $invitationId)
                ->where('gig_worker_id', $user->id)
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation not found.'
                ], 404);
            }

            if (!$invitation->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This invitation has already been responded to.'
                ], 409);
            }

            if ($invitation->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This invitation has expired.'
                ], 410);
            }

            DB::beginTransaction();

            if ($validated['response'] === 'accept') {
                $invitation->accept();
                $responseMessage = 'Job invitation accepted successfully.';
                $notificationMessage = "{$user->first_name} {$user->last_name} accepted your job invitation for: {$invitation->job->title}";
            } else {
                $invitation->decline();
                $responseMessage = 'Job invitation declined.';
                $notificationMessage = "{$user->first_name} {$user->last_name} declined your job invitation for: {$invitation->job->title}";
            }

            // Notify the employer
            $this->notificationService->create([
                'user_id' => $invitation->employer_id,
                'type' => 'invitation_response',
                'title' => '📋 Job Invitation Response',
                'message' => $notificationMessage,
                'data' => [
                    'invitation_id' => $invitation->id,
                    'job_id' => $invitation->job->id,
                    'job_title' => $invitation->job->title,
                    'gig_worker_id' => $user->id,
                    'gig_worker_name' => $user->first_name . ' ' . $user->last_name,
                    'gig_worker_avatar' => $user->avatar,
                    'response' => $validated['response']
                ],
                'action_url' => route('jobs.show', $invitation->job->id),
                'icon' => $validated['response'] === 'accept' ? 'check-circle' : 'x-circle'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $responseMessage
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Invitation response error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while responding to the invitation.'
            ], 500);
        }
    }
}
