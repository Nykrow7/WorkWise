<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        $isGigWorker = $user->user_type === 'freelancer';

        $rules = [
            // Basic information
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'location' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:255'],
            'profile_photo' => ['nullable', 'image', 'max:2048'], // 2MB max
        ];

        if ($isGigWorker) {
            // Freelancer-specific fields
            $rules = array_merge($rules, [
                'professional_title' => ['required', 'string', 'max:255'],
                'hourly_rate' => ['required', 'numeric', 'min:5', 'max:500'],
                'experience_level' => ['required', 'in:beginner,intermediate,expert'],
                'skills' => ['required', 'array', 'min:1', 'max:15'],
                'skills.*' => ['string', 'max:50'],
                'languages' => ['nullable', 'array', 'max:10'],
                'languages.*' => ['string', 'max:50'],
                'portfolio_url' => ['nullable', 'url', 'max:255'],
            ]);
        } else {
            // Client-specific fields
            $rules = array_merge($rules, [
                'company_name' => ['nullable', 'string', 'max:255'],
                'work_type_needed' => ['nullable', 'string', 'max:255'],
                'budget_range' => ['nullable', 'string', 'max:255'],
                'project_intent' => ['nullable', 'string', 'max:1000'],
            ]);
        }

        return $rules;
    }
}
