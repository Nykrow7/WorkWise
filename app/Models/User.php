<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'name',
        'email',
        'password',
        'barangay',
        'user_type',
        'profile_completed',
        'profile_status',
        'bio',
        'location',
        'phone',
        'profile_photo',
        'professional_title',
        'hourly_rate',
        'experience_level',
        'skills',
        'languages',
        'portfolio_url',
        'company_name',
        'work_type_needed',
        'budget_range',
        'project_intent',
        'stripe_customer_id',
        'stripe_account_id',
        'stripe_account_details',
        'stripe_onboarded_at',
        'escrow_balance',
        'is_admin',
        'google_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'skills' => 'array',
            'languages' => 'array',
            'hourly_rate' => 'decimal:2',
            'profile_completed' => 'boolean',
            'stripe_account_details' => 'array',
            'stripe_onboarded_at' => 'datetime',
            'escrow_balance' => 'decimal:2',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Get the user's full name
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the user's name (for backward compatibility)
     */
    public function getNameAttribute(): string
    {
        return $this->getFullNameAttribute();
    }

    /**
     * Check if user is an employer
     */
    public function isEmployer(): bool
    {
        return $this->user_type === 'employer';
    }

    /**
     * Check if user is a client (deprecated - use isEmployer)
     */
    public function isClient(): bool
    {
        return $this->user_type === 'client';
    }

    /**
     * Check if user is a gig worker
     */
    public function isGigWorker(): bool
    {
        return $this->user_type === 'gig_worker';
    }

    /**
     * Check if user is a freelancer (deprecated - use isGigWorker)
     */
    public function isFreelancer(): bool
    {
        return $this->user_type === 'gig_worker';
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->is_admin || $this->user_type === 'admin';
    }

    /**
     * Jobs posted by this employer
     */
    public function postedJobs(): HasMany
    {
        return $this->hasMany(GigJob::class, 'employer_id');
    }

    /**
     * Bids made by this gig worker
     */
    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class, 'gig_worker_id');
    }

    // Project relationships
    public function employerProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'employer_id');
    }

    public function gigWorkerProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'gig_worker_id');
    }

    /**
     * Get client projects (deprecated - use employerProjects)
     */
    public function clientProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'employer_id');
    }

    /**
     * Get freelancer projects (deprecated - use gigWorkerProjects)
     */
    public function freelancerProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'gig_worker_id');
    }

    // Review relationships
    public function givenReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function receivedReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    // Message relationships
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    // Transaction relationships
    public function paymentsMade(): HasMany
    {
        return $this->hasMany(Transaction::class, 'payer_id');
    }

    public function paymentsReceived(): HasMany
    {
        return $this->hasMany(Transaction::class, 'payee_id');
    }

    // Report relationships
    public function reportsSubmitted(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function reportsReceived(): HasMany
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }

    /**
     * Get average rating for this user
     */
    public function getAverageRatingAttribute(): float
    {
        return $this->receivedReviews()->avg('rating') ?? 0.0;
    }

    /**
     * Get total earnings for gig worker
     */
    public function getTotalEarningsAttribute(): float
    {
        return $this->paymentsReceived()
            ->where('type', 'release')
            ->where('status', 'completed')
            ->sum('net_amount');
    }

    /**
     * Get completion rate for gig worker
     */
    public function getCompletionRateAttribute(): float
    {
        $totalProjects = $this->gigWorkerProjects()->count();
        if ($totalProjects === 0) return 0.0;

        $completedProjects = $this->gigWorkerProjects()
            ->where('status', 'completed')
            ->count();

        return ($completedProjects / $totalProjects) * 100;
    }

    /**
     * Get the user's deposits
     */
    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }
}
