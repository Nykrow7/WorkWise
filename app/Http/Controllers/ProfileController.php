<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old profile photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            // Store new profile photo
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $validated['profile_photo'] = $path;
        } else {
            // Remove profile_photo from validated data if no file uploaded
            unset($validated['profile_photo']);
        }

        // Fill user with validated data
        $user->fill($validated);

        // Handle email verification reset
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // Update profile completion status
        $user->profile_completed = $this->calculateProfileCompletion($user);

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Calculate profile completion percentage
     */
    private function calculateProfileCompletion($user): bool
    {
        $requiredFields = ['first_name', 'last_name', 'email', 'bio', 'barangay'];

        if ($user->user_type === 'gig_worker') {
            $requiredFields = array_merge($requiredFields, [
                'professional_title', 'hourly_rate', 'skills'
            ]);
        } else {
            $requiredFields = array_merge($requiredFields, [
                'company_name', 'work_type_needed'
            ]);
        }

        $completedFields = 0;
        foreach ($requiredFields as $field) {
            if ($field === 'skills' && is_array($user->skills) && count($user->skills) > 0) {
                $completedFields++;
            } elseif ($field !== 'skills' && !empty($user->$field)) {
                $completedFields++;
            }
        }

        // Consider profile complete if 80% or more fields are filled
        return ($completedFields / count($requiredFields)) >= 0.8;
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
