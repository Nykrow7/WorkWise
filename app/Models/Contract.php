<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'project_id',
        'employer_id',
        'gig_worker_id',
        'job_id',
        'bid_id',
        'scope_of_work',
        'total_payment',
        'contract_type',
        'project_start_date',
        'project_end_date',
        'employer_responsibilities',
        'gig_worker_responsibilities',
        'preferred_communication',
        'communication_frequency',
        'status',
        'gig_worker_signed_at',
        'employer_signed_at',
        'fully_signed_at',
        'pdf_path',
        'pdf_generated_at',
    ];

    protected $attributes = [
        'status' => 'pending_employer_signature',
    ];

    protected function casts(): array
    {
        return [
            'total_payment' => 'decimal:2',
            'project_start_date' => 'date',
            'project_end_date' => 'date',
            'employer_responsibilities' => 'array',
            'gig_worker_responsibilities' => 'array',
            'gig_worker_signed_at' => 'datetime',
            'employer_signed_at' => 'datetime',
            'fully_signed_at' => 'datetime',
            'pdf_generated_at' => 'datetime',
        ];
    }

    /**
     * Generate unique contract ID
     */
    public static function generateContractId(): string
    {
        $year = date('Y');
        $lastContract = self::where('contract_id', 'like', "WW-{$year}-%")
            ->orderBy('contract_id', 'desc')
            ->first();
        
        if ($lastContract) {
            $lastNumber = (int) substr($lastContract->contract_id, -6);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return sprintf('WW-%s-%06d', $year, $newNumber);
    }

    /**
     * Relationships
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the employer
     */
    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    /**
     * Get the gig worker
     */
    public function gigWorker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'gig_worker_id');
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(GigJob::class, 'job_id');
    }

    public function bid(): BelongsTo
    {
        return $this->belongsTo(Bid::class, 'bid_id');
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(ContractSignature::class);
    }

    /**
     * Status check methods
     */
    public function isPendingGigWorkerSignature(): bool
    {
        return $this->status === 'pending_gig_worker_signature';
    }

    /**
     * Check if contract is pending gig worker signature (deprecated - use isPendingGigWorkerSignature)
     */
    public function isPendingFreelancerSignature(): bool
    {
        return $this->status === 'pending_gig_worker_signature';
    }

    public function isPendingEmployerSignature(): bool
    {
        return $this->status === 'pending_employer_signature';
    }

    public function isFullySigned(): bool
    {
        return $this->status === 'fully_signed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get signature for specific role
     */
    public function getSignatureForRole(string $role): ?ContractSignature
    {
        return $this->signatures()->where('role', $role)->first();
    }

    /**
     * Check if user has signed
     */
    public function hasUserSigned(int $userId): bool
    {
        return $this->signatures()->where('user_id', $userId)->exists();
    }

    /**
     * Get next signer (who needs to sign next)
     * Employer must sign first, then gig worker
     */
    public function getNextSigner(): ?string
    {
        // If status is empty or null, default to pending employer signature
        if (empty($this->status)) {
            return 'employer';
        }

        // Employer must sign first
        if ($this->isPendingEmployerSignature()) {
            return 'employer';
        }

        // After employer signs, gig worker can sign
        if ($this->isPendingGigWorkerSignature()) {
            return 'gig_worker';
        }

        return null;
    }

    /**
     * Check if user can sign this contract
     */
    public function canUserSign(int $userId): bool
    {
        \Log::info('Checking if user can sign contract', [
            'contract_id' => $this->id,
            'user_id' => $userId,
            'employer_id' => $this->employer_id,
            'gig_worker_id' => $this->gig_worker_id,
            'contract_status' => $this->status
        ]);

        // User must be either employer or gig worker
        if ($userId !== $this->employer_id && $userId !== $this->gig_worker_id) {
            \Log::warning('User is not employer or gig worker', [
                'user_id' => $userId,
                'employer_id' => $this->employer_id,
                'gig_worker_id' => $this->gig_worker_id
            ]);
            return false;
        }

        // User must not have already signed
        if ($this->hasUserSigned($userId)) {
            \Log::warning('User has already signed', [
                'user_id' => $userId,
                'contract_id' => $this->id
            ]);
            return false;
        }

        // Contract must not be fully signed or cancelled
        if ($this->isFullySigned() || $this->isCancelled()) {
            \Log::warning('Contract is fully signed or cancelled', [
                'contract_id' => $this->id,
                'is_fully_signed' => $this->isFullySigned(),
                'is_cancelled' => $this->isCancelled(),
                'status' => $this->status
            ]);
            return false;
        }

        // Check if it's the user's turn to sign based on contract status
        $userRole = $this->getUserRole($userId);
        $nextSigner = $this->getNextSigner();

        // If status is empty, default to employer-first workflow
        if (empty($this->status) && $userRole === 'employer') {
            return true;
        }

        if ($nextSigner && $userRole !== $nextSigner) {
            \Log::warning('Not user\'s turn to sign', [
                'user_id' => $userId,
                'user_role' => $userRole,
                'next_signer' => $nextSigner,
                'contract_status' => $this->status
            ]);
            return false;
        }

        \Log::info('User can sign contract', [
            'user_id' => $userId,
            'contract_id' => $this->id,
            'user_role' => $userRole,
            'next_signer' => $nextSigner
        ]);

        return true;
    }

    /**
     * Check if employer has signed the contract
     */
    public function hasEmployerSigned(): bool
    {
        return $this->employer_signed_at !== null;
    }

    /**
     * Check if gig worker can view/sign contract
     * Gig worker can only view/sign after employer has signed
     */
    public function canGigWorkerAccess(): bool
    {
        return $this->hasEmployerSigned();
    }

    /**
     * Get user role in this contract
     */
    public function getUserRole(int $userId): ?string
    {
        if ($userId === $this->employer_id) {
            return 'employer';
        }

        if ($userId === $this->gig_worker_id) {
            return 'gig_worker';
        }

        return null;
    }
}
