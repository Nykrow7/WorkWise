/**
 * Match Calculation Service
 * Calculates compatibility scores between gig workers and jobs
 */

class MatchCalculationService {
    /**
     * Calculate match percentage between a gig worker and a job
     * @param {Object} worker - Gig worker profile
     * @param {Object} job - Job posting
     * @returns {Object} - Match result with score and explanation
     */
    static calculateMatch(worker, job) {
        if (!worker || !job) {
            return { score: 0, reason: 'Invalid worker or job data' };
        }

        let totalScore = 0;
        let maxScore = 0;
        const factors = [];

        // 1. Skills Match (40% weight)
        const skillsResult = this.calculateSkillsMatch(worker.skills || [], job.required_skills || []);
        totalScore += skillsResult.score * 0.4;
        maxScore += 40;
        factors.push({
            name: 'Skills Match',
            score: skillsResult.score,
            weight: 40,
            details: skillsResult.details
        });

        // 2. Experience Level Match (25% weight)
        const experienceResult = this.calculateExperienceMatch(worker.experience_level, job.experience_level);
        totalScore += experienceResult.score * 0.25;
        maxScore += 25;
        factors.push({
            name: 'Experience Level',
            score: experienceResult.score,
            weight: 25,
            details: experienceResult.details
        });

        // 3. Budget Compatibility (20% weight)
        const budgetResult = this.calculateBudgetMatch(worker.hourly_rate, job.budget_min, job.budget_max, job.budget_type);
        totalScore += budgetResult.score * 0.2;
        maxScore += 20;
        factors.push({
            name: 'Budget Compatibility',
            score: budgetResult.score,
            weight: 20,
            details: budgetResult.details
        });

        // 4. Profile Completeness (10% weight)
        const profileResult = this.calculateProfileCompleteness(worker);
        totalScore += profileResult.score * 0.1;
        maxScore += 10;
        factors.push({
            name: 'Profile Quality',
            score: profileResult.score,
            weight: 10,
            details: profileResult.details
        });

        // 5. Location Match (5% weight) - if both have location data
        const locationResult = this.calculateLocationMatch(worker.location, job.location);
        totalScore += locationResult.score * 0.05;
        maxScore += 5;
        factors.push({
            name: 'Location',
            score: locationResult.score,
            weight: 5,
            details: locationResult.details
        });

        const finalScore = Math.round((totalScore / maxScore) * 100);
        const reason = this.generateMatchReason(factors, finalScore);

        return {
            score: finalScore,
            reason,
            factors,
            breakdown: {
                skills: skillsResult,
                experience: experienceResult,
                budget: budgetResult,
                profile: profileResult,
                location: locationResult
            }
        };
    }

    /**
     * Calculate skills match percentage
     */
    static calculateSkillsMatch(workerSkills, jobSkills) {
        if (!Array.isArray(workerSkills) || !Array.isArray(jobSkills)) {
            return { score: 0, details: 'Invalid skills data' };
        }

        if (jobSkills.length === 0) {
            return { score: 80, details: 'No specific skills required' };
        }

        const normalizedWorkerSkills = workerSkills.map(skill => 
            typeof skill === 'string' ? skill.toLowerCase().trim() : ''
        ).filter(skill => skill.length > 0);

        const normalizedJobSkills = jobSkills.map(skill => 
            typeof skill === 'string' ? skill.toLowerCase().trim() : ''
        ).filter(skill => skill.length > 0);

        if (normalizedWorkerSkills.length === 0) {
            return { score: 0, details: 'No skills listed in profile' };
        }

        // Calculate exact matches
        const exactMatches = normalizedJobSkills.filter(jobSkill =>
            normalizedWorkerSkills.includes(jobSkill)
        );

        // Calculate partial matches (similar skills)
        const partialMatches = normalizedJobSkills.filter(jobSkill =>
            !exactMatches.includes(jobSkill) &&
            normalizedWorkerSkills.some(workerSkill =>
                this.areSkillsSimilar(workerSkill, jobSkill)
            )
        );

        const exactMatchScore = (exactMatches.length / normalizedJobSkills.length) * 100;
        const partialMatchScore = (partialMatches.length / normalizedJobSkills.length) * 50;
        
        const totalScore = Math.min(100, exactMatchScore + partialMatchScore);

        let details = '';
        if (exactMatches.length > 0) {
            details += `${exactMatches.length}/${normalizedJobSkills.length} required skills matched exactly`;
        }
        if (partialMatches.length > 0) {
            details += details ? `, ${partialMatches.length} similar skills` : `${partialMatches.length} similar skills found`;
        }
        if (!details) {
            details = 'No matching skills found';
        }

        return { score: Math.round(totalScore), details, exactMatches, partialMatches };
    }

    /**
     * Check if two skills are similar
     */
    static areSkillsSimilar(skill1, skill2) {
        const similarityMap = {
            'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
            'react': ['reactjs', 'react.js', 'javascript', 'js'],
            'vue': ['vuejs', 'vue.js', 'javascript', 'js'],
            'angular': ['angularjs', 'javascript', 'js'],
            'php': ['laravel', 'symfony', 'codeigniter'],
            'laravel': ['php'],
            'python': ['django', 'flask', 'fastapi'],
            'django': ['python'],
            'css': ['scss', 'sass', 'less', 'styling'],
            'html': ['html5', 'markup'],
            'mysql': ['sql', 'database'],
            'postgresql': ['sql', 'database'],
            'mongodb': ['nosql', 'database'],
        };

        const getSimilarSkills = (skill) => {
            const normalized = skill.toLowerCase();
            return similarityMap[normalized] || [];
        };

        return getSimilarSkills(skill1).includes(skill2) || 
               getSimilarSkills(skill2).includes(skill1);
    }

    /**
     * Calculate experience level match
     */
    static calculateExperienceMatch(workerLevel, jobLevel) {
        if (!workerLevel || !jobLevel) {
            return { score: 70, details: 'Experience level not specified' };
        }

        const levels = { 'beginner': 1, 'intermediate': 2, 'expert': 3 };
        const workerLevelNum = levels[workerLevel.toLowerCase()] || 2;
        const jobLevelNum = levels[jobLevel.toLowerCase()] || 2;

        let score = 0;
        let details = '';

        if (workerLevelNum === jobLevelNum) {
            score = 100;
            details = 'Perfect experience level match';
        } else if (workerLevelNum > jobLevelNum) {
            score = 90; // Overqualified but still good
            details = 'Overqualified - higher experience than required';
        } else if (workerLevelNum === jobLevelNum - 1) {
            score = 75; // One level below
            details = 'Slightly below required experience level';
        } else {
            score = 50; // Significantly underqualified
            details = 'Below required experience level';
        }

        return { score, details };
    }

    /**
     * Calculate budget compatibility
     */
    static calculateBudgetMatch(workerRate, jobBudgetMin, jobBudgetMax, budgetType) {
        if (!workerRate) {
            return { score: 60, details: 'No hourly rate specified' };
        }

        const rate = parseFloat(workerRate);
        if (isNaN(rate)) {
            return { score: 60, details: 'Invalid hourly rate' };
        }

        if (!jobBudgetMin && !jobBudgetMax) {
            return { score: 70, details: 'Job budget not specified' };
        }

        const minBudget = parseFloat(jobBudgetMin) || 0;
        const maxBudget = parseFloat(jobBudgetMax) || minBudget;

        let score = 0;
        let details = '';

        if (rate >= minBudget && rate <= maxBudget) {
            score = 100;
            details = 'Rate within job budget range';
        } else if (rate < minBudget) {
            const difference = ((minBudget - rate) / minBudget) * 100;
            if (difference <= 20) {
                score = 80;
                details = 'Rate slightly below budget range';
            } else if (difference <= 40) {
                score = 60;
                details = 'Rate below budget range';
            } else {
                score = 30;
                details = 'Rate significantly below budget range';
            }
        } else { // rate > maxBudget
            const difference = ((rate - maxBudget) / maxBudget) * 100;
            if (difference <= 20) {
                score = 70;
                details = 'Rate slightly above budget range';
            } else if (difference <= 50) {
                score = 40;
                details = 'Rate above budget range';
            } else {
                score = 20;
                details = 'Rate significantly above budget range';
            }
        }

        return { score, details };
    }

    /**
     * Calculate profile completeness score
     */
    static calculateProfileCompleteness(worker) {
        let completeness = 0;
        const factors = [];

        // Check essential fields
        if (worker.bio && worker.bio.length > 50) {
            completeness += 25;
            factors.push('Detailed bio');
        }
        if (worker.skills && worker.skills.length >= 3) {
            completeness += 25;
            factors.push('Multiple skills listed');
        }
        if (worker.professional_title) {
            completeness += 20;
            factors.push('Professional title');
        }
        if (worker.hourly_rate) {
            completeness += 15;
            factors.push('Hourly rate specified');
        }
        if (worker.portfolio_url) {
            completeness += 10;
            factors.push('Portfolio URL');
        }
        if (worker.profile_photo) {
            completeness += 5;
            factors.push('Profile photo');
        }

        const details = factors.length > 0 ? factors.join(', ') : 'Incomplete profile';
        return { score: completeness, details };
    }

    /**
     * Calculate location match (basic implementation)
     */
    static calculateLocationMatch(workerLocation, jobLocation) {
        if (!workerLocation && !jobLocation) {
            return { score: 80, details: 'Location not specified' };
        }

        if (!workerLocation || !jobLocation) {
            return { score: 70, details: 'Partial location information' };
        }

        // Simple string comparison - can be enhanced with geolocation
        const workerLoc = workerLocation.toLowerCase().trim();
        const jobLoc = jobLocation.toLowerCase().trim();

        if (workerLoc === jobLoc) {
            return { score: 100, details: 'Same location' };
        } else if (workerLoc.includes(jobLoc) || jobLoc.includes(workerLoc)) {
            return { score: 85, details: 'Similar location' };
        } else {
            return { score: 60, details: 'Different location' };
        }
    }

    /**
     * Generate human-readable match reason
     */
    static generateMatchReason(factors, finalScore) {
        const topFactors = factors
            .sort((a, b) => (b.score * b.weight) - (a.score * a.weight))
            .slice(0, 3);

        let reason = '';

        if (finalScore >= 80) {
            reason = 'Excellent match! ';
        } else if (finalScore >= 60) {
            reason = 'Good match. ';
        } else if (finalScore >= 40) {
            reason = 'Fair match. ';
        } else {
            reason = 'Limited match. ';
        }

        const strongPoints = topFactors.filter(f => f.score >= 80);
        const weakPoints = factors.filter(f => f.score < 60);

        if (strongPoints.length > 0) {
            const strengths = strongPoints.map(f => f.name.toLowerCase()).join(' and ');
            reason += `Strong ${strengths}. `;
        }

        if (weakPoints.length > 0 && finalScore < 70) {
            const weaknesses = weakPoints.slice(0, 2).map(f => f.name.toLowerCase()).join(' and ');
            reason += `Consider improving ${weaknesses}. `;
        }

        // Add specific skill insights
        const skillsFactor = factors.find(f => f.name === 'Skills Match');
        if (skillsFactor && skillsFactor.score >= 80) {
            reason += 'Your skills align well with job requirements. ';
        } else if (skillsFactor && skillsFactor.score < 50) {
            reason += 'Consider developing the required skills for better matches. ';
        }

        return reason.trim();
    }

    /**
     * Batch calculate matches for multiple jobs
     */
    static calculateMultipleMatches(worker, jobs) {
        if (!Array.isArray(jobs)) {
            return [];
        }

        return jobs.map(job => ({
            job,
            ...this.calculateMatch(worker, job)
        })).sort((a, b) => b.score - a.score);
    }

    /**
     * Get match statistics for a worker
     */
    static getMatchStatistics(matches) {
        if (!Array.isArray(matches) || matches.length === 0) {
            return {
                totalMatches: 0,
                averageScore: 0,
                excellentMatches: 0,
                goodMatches: 0,
                fairMatches: 0
            };
        }

        const scores = matches.map(m => m.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        return {
            totalMatches: matches.length,
            averageScore: Math.round(averageScore),
            excellentMatches: scores.filter(s => s >= 80).length,
            goodMatches: scores.filter(s => s >= 60 && s < 80).length,
            fairMatches: scores.filter(s => s >= 40 && s < 60).length,
            weakMatches: scores.filter(s => s < 40).length
        };
    }
}

export default MatchCalculationService;