<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillRecommendationStat extends Model
{
    protected $table = 'skill_recommendation_stats';

    protected $fillable = [
        'type',
        'value',
        'accepted_count',
        'last_accepted_at',
        'context',
    ];

    protected $casts = [
        'context' => 'array',
        'last_accepted_at' => 'datetime',
    ];
}