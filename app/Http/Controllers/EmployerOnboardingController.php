<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployerOnboardingController extends Controller
{
    /**
     * Show the employer onboarding page
     */
    public function show(): Response|RedirectResponse
    {
        $user = auth()->user();

        // Redirect if not an employer
        if ($user->user_type !== 'employer') {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/EmployerOnboarding', [
            'user' => $user
        ]);
    }

    /**
     * Handle the employer onboarding form submission
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        // Validate the onboarding data
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'work_type_needed' => 'required|string|max:255',
            'budget_range' => 'required|string|max:255',
            'project_intent' => 'required|string|min:20|max:500',
        ]);

        // Update user profile
        $user->update(array_merge($validated, [
            'profile_completed' => true,
            'profile_status' => 'approved' // Clients are auto-approved
        ]));

        return redirect()->route('jobs.index')->with('success',
            'Welcome to WorkWise! You can now start posting projects and hiring freelancers.');
    }

    /**
     * Skip onboarding (optional for clients)
     */
    public function skip(): RedirectResponse
    {
        $user = auth()->user();

        $user->update([
            'profile_completed' => true,
            'profile_status' => 'approved'
        ]);

        return redirect()->route('jobs.index')->with('info',
            'You can complete your profile later from your profile settings.');
    }
}
