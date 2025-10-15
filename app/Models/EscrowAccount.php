<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EscrowAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'employer_id',
        'gig_worker_id',
        'total_amount',
        'platform_fee',
        'available_amount',
        'status',
        'protection_level',
        'escrow_terms',
        'risk_score',
        'milestone_based',
        'automatic_release',
        'fraud_insurance',
        'multi_signature',
        'funded_at',
        'expires_at',
    ];

    protected $casts = [
        'escrow_terms' => 'array',
        'total_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'available_amount' => 'decimal:2',
        'risk_score' => 'decimal:2',
        'milestone_based' => 'boolean',
        'automatic_release' => 'boolean',
        'fraud_insurance' => 'boolean',
        'multi_signature' => 'boolean',
        'funded_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the project that owns the escrow account
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the employer user
     */
    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    /**
     * Get the gig worker user
     */
    public function gigWorker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'gig_worker_id');
    }

    /**
     * Get the milestones for this escrow account
     */
    public function milestones(): HasMany
    {
        return $this->hasMany(EscrowMilestone::class);
    }

    /**
     * Get the transactions for this escrow account
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(EscrowTransaction::class);
    }

    /**
     * Get the fraud detection logs
     */
    public function fraudDetectionLogs(): HasMany
    {
        return $this->hasMany(FraudDetectionLog::class);
    }

    /**
     * Get the dispute cases
     */
    public function disputeCases(): HasMany
    {
        return $this->hasMany(DisputeCase::class);
    }

    /**
     * Get the insurance claims
     */
    public function insuranceClaims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class);
    }

    /**
     * Scope for active escrow accounts
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for high-risk escrow accounts
     */
    public function scopeHighRisk($query)
    {
        return $query->where('risk_score', '>=', 0.7);
    }

    /**
     * Scope for accounts with fraud insurance
     */
    public function scopeWithInsurance($query)
    {
        return $query->where('fraud_insurance', true);
    }

    /**
     * Check if escrow account is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if escrow account is frozen
     */
    public function isFrozen(): bool
    {
        return $this->status === 'disputed' && 
               isset($this->escrow_terms['frozen_at']);
    }

    /**
     * Get protection features as array
     */
    public function getProtectionFeaturesAttribute(): array
    {
        $features = [];
        
        if ($this->milestone_based) {
            $features[] = 'Milestone-based payments';
        }
        
        if ($this->automatic_release) {
            $features[] = 'Automatic payment release';
        }
        
        if ($this->fraud_insurance) {
            $features[] = 'Fraud insurance coverage';
        }
        
        if ($this->multi_signature) {
            $features[] = 'Multi-signature security';
        }
        
        return $features;
    }

    /**
     * Get risk level as string
     */
    public function getRiskLevelAttribute(): string
    {
        if ($this->risk_score >= 0.8) {
            return 'critical';
        } elseif ($this->risk_score >= 0.7) {
            return 'high';
        } elseif ($this->risk_score >= 0.5) {
            return 'medium';
        } elseif ($this->risk_score >= 0.3) {
            return 'low';
        }

        return 'minimal';
    }

    /**
     * Calculate completion percentage
     */
    public function getCompletionPercentageAttribute(): float
    {
        $totalMilestones = $this->milestones()->count();
        
        if ($totalMilestones === 0) {
            return 0.0;
        }
        
        $completedMilestones = $this->milestones()->where('status', 'completed')->count();
        
        return ($completedMilestones / $totalMilestones) * 100;
    }

    /**
     * Get remaining amount to be released
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->available_amount;
    }

    /**
     * Get released amount
     */
    public function getReleasedAmountAttribute(): float
    {
        return $this->total_amount - $this->available_amount;
    }

    /**
     * Check if all milestones are completed
     */
    public function allMilestonesCompleted(): bool
    {
        $totalMilestones = $this->milestones()->count();
        $completedMilestones = $this->milestones()->where('status', 'completed')->count();
        
        return $totalMilestones > 0 && $totalMilestones === $completedMilestones;
    }

    /**
     * Get next pending milestone
     */
    public function getNextMilestone(): ?EscrowMilestone
    {
        return $this->milestones()
            ->where('status', 'pending')
            ->orderBy('order_index')
            ->first();
    }

    /**
     * Check if escrow can be automatically released
     */
    public function canAutoRelease(): bool
    {
        return $this->automatic_release && 
               $this->status === 'active' && 
               !$this->isFrozen() &&
               $this->allMilestonesCompleted();
    }
}
