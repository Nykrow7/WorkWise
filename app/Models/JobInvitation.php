<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobInvitation extends Model
{
    protected $fillable = [
        'job_id',
        'employer_id',
        'gig_worker_id',
        'message',
        'status',
        'sent_at',
        'responded_at',
        'expires_at'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the job that this invitation is for
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(GigJob::class, 'job_id');
    }

    /**
     * Get the employer who sent the invitation
     */
    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    /**
     * Get the gig worker who received the invitation
     */
    public function gigWorker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'gig_worker_id');
    }

    /**
     * Check if the invitation is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the invitation is accepted
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if the invitation is declined
     */
    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }

    /**
     * Check if the invitation is expired
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired' || 
               ($this->expires_at && $this->expires_at->isPast());
    }

    /**
     * Mark invitation as accepted
     */
    public function accept(): void
    {
        $this->update([
            'status' => 'accepted',
            'responded_at' => now()
        ]);
    }

    /**
     * Mark invitation as declined
     */
    public function decline(): void
    {
        $this->update([
            'status' => 'declined',
            'responded_at' => now()
        ]);
    }
}
