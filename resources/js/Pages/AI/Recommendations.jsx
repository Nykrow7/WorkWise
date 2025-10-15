import React, { useMemo, useState } from "react";

import { Head, Link } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import usePagination from "@/Hooks/usePagination";

export default function Recommendations({
    recommendations,
    userType,
    hasError,
    skills = [],
}) {
    const isGigWorker = userType === "gig_worker";

    const experienceOptions = [
        { label: "All experience levels", value: "all" },

        { label: "Beginner", value: "beginner" },

        { label: "Intermediate", value: "intermediate" },

        { label: "Expert", value: "expert" },
    ];

    const [filters, setFilters] = useState({
        experience: "all",

        budgetMin: "",

        budgetMax: "",

        skills: [],
    });

    const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);

    const availableSkills = useMemo(
        () =>
            (skills || [])

                .map((skill) => (typeof skill === "string" ? skill.trim() : ""))

                .filter((skill) => skill.length > 0),

        [skills],
    );

    const normalizedSelectedSkills = useMemo(
        () => filters.skills.map((skill) => skill.toLowerCase()),

        [filters.skills],
    );

    const budgetFilter = useMemo(() => {
        const parseBudgetValue = (value) => {
            if (value === "" || value === null || value === undefined) {
                return null;
            }

            if (typeof value === "number") {
                return Number.isFinite(value) ? value : null;
            }

            const numeric = parseFloat(value);

            return Number.isFinite(numeric) ? numeric : null;
        };

        return {
            min: parseBudgetValue(filters.budgetMin),

            max: parseBudgetValue(filters.budgetMax),
        };
    }, [filters.budgetMin, filters.budgetMax]);

    const baseFreelancerRecommendations = Array.isArray(recommendations)
        ? recommendations
        : [];

    const baseEmployerRecommendations =
        !Array.isArray(recommendations) && recommendations
            ? recommendations
            : {};

    const hasActiveFilters = useMemo(
        () =>
            filters.experience !== "all" ||
            filters.budgetMin !== "" ||
            filters.budgetMax !== "" ||
            filters.skills.length > 0,

        [filters],
    );

    const matchesExperience = (value) => {
        if (filters.experience === "all") {
            return true;
        }

        if (!value) {
            return false;
        }

        return value.toLowerCase() === filters.experience;
    };

    const matchesSkillFilter = (skillSet) => {
        if (!normalizedSelectedSkills.length) {
            return true;
        }

        if (!Array.isArray(skillSet) || skillSet.length === 0) {
            return false;
        }

        const normalizedSkillSet = skillSet

            .map((skill) =>
                typeof skill === "string" ? skill.toLowerCase() : "",
            )

            .filter((skill) => skill.length > 0);

        if (normalizedSkillSet.length === 0) {
            return false;
        }

        return normalizedSelectedSkills.every((skill) =>
            normalizedSkillSet.includes(skill),
        );
    };

    const jobBudgetMatches = (minValue, maxValue) => {
        if (budgetFilter.min === null && budgetFilter.max === null) {
            return true;
        }

        const jobMin = minValue !== undefined ? minValue : null;

        const jobMax = maxValue !== undefined ? maxValue : null;

        const normalizedMin =
            jobMin === null || jobMin === "" || jobMin === undefined
                ? null
                : Number.isFinite(jobMin)
                  ? jobMin
                  : Number.isFinite(parseFloat(jobMin))
                    ? parseFloat(jobMin)
                    : null;

        const normalizedMax =
            jobMax === null || jobMax === "" || jobMax === undefined
                ? null
                : Number.isFinite(jobMax)
                  ? jobMax
                  : Number.isFinite(parseFloat(jobMax))
                    ? parseFloat(jobMax)
                    : null;

        if (normalizedMin === null && normalizedMax === null) {
            return true;
        }

        const rangeMin = normalizedMin ?? normalizedMax;

        const rangeMax = normalizedMax ?? normalizedMin;

        if (rangeMin === null && rangeMax === null) {
            return true;
        }

        if (
            budgetFilter.min !== null &&
            rangeMax !== null &&
            rangeMax < budgetFilter.min
        ) {
            return false;
        }

        if (
            budgetFilter.max !== null &&
            rangeMin !== null &&
            rangeMin > budgetFilter.max
        ) {
            return false;
        }

        return true;
    };

    const workerBudgetMatches = (hourlyRate) => {
        if (budgetFilter.min === null && budgetFilter.max === null) {
            return true;
        }

        if (
            hourlyRate === null ||
            hourlyRate === undefined ||
            hourlyRate === ""
        ) {
            return true;
        }

        const rate =
            typeof hourlyRate === "number"
                ? hourlyRate
                : Number.isFinite(parseFloat(hourlyRate))
                  ? parseFloat(hourlyRate)
                  : null;

        if (rate === null) {
            return true;
        }

        if (budgetFilter.min !== null && rate < budgetFilter.min) {
            return false;
        }

        if (budgetFilter.max !== null && rate > budgetFilter.max) {
            return false;
        }

        return true;
    };

    const handleBudgetChange = (key) => (event) => {
        const { value } = event.target;

        setFilters((current) => ({
            ...current,

            [key]: value,
        }));
    };

    const toggleSkillSelection = (skill) => {
        setFilters((current) => {
            const alreadySelected = current.skills.some(
                (selectedSkill) =>
                    selectedSkill.toLowerCase() === skill.toLowerCase(),
            );

            return {
                ...current,

                skills: alreadySelected
                    ? current.skills.filter(
                          (selectedSkill) =>
                              selectedSkill.toLowerCase() !==
                              skill.toLowerCase(),
                      )
                    : [...current.skills, skill],
            };
        });
    };

    const clearFilters = () => {
        setFilters({
            experience: "all",

            budgetMin: "",

            budgetMax: "",

            skills: [],
        });

        setIsSkillDropdownOpen(false);
    };

    const filteredFreelancerRecommendations = useMemo(() => {
        if (!isGigWorker) {
            return baseFreelancerRecommendations;
        }

        return baseFreelancerRecommendations.filter((match) => {
            const job = match.job || {};

            if (!matchesExperience(job.experience_level)) {
                return false;
            }

            if (!jobBudgetMatches(job.budget_min, job.budget_max)) {
                return false;
            }

            if (!matchesSkillFilter(job.required_skills)) {
                return false;
            }

            return true;
        });
    }, [
        isGigWorker,

        baseFreelancerRecommendations,

        filters,

        normalizedSelectedSkills,

        budgetFilter,
    ]);

    const filteredEmployerRecommendations = useMemo(() => {
        if (isGigWorker) {
            return baseEmployerRecommendations;
        }

        return Object.entries(baseEmployerRecommendations).reduce(
            (accumulator, [jobId, data]) => {
                const matches = Array.isArray(data.matches)
                    ? data.matches.filter((match) => {
                          const gigWorker = match.gig_worker || {};

                          if (!matchesExperience(gigWorker.experience_level)) {
                              return false;
                          }

                          if (!workerBudgetMatches(gigWorker.hourly_rate)) {
                              return false;
                          }

                          if (!matchesSkillFilter(gigWorker.skills)) {
                              return false;
                          }

                          return true;
                      })
                    : [];

                return {
                    ...accumulator,

                    [jobId]: {
                        ...data,

                        matches,
                    },
                };
            },
            {},
        );
    }, [
        isGigWorker,

        baseEmployerRecommendations,

        filters,

        normalizedSelectedSkills,

        budgetFilter,
    ]);

    const employerHasInitialMatches = useMemo(
        () =>
            Object.values(baseEmployerRecommendations).some(
                (jobData) =>
                    jobData &&
                    Array.isArray(jobData.matches) &&
                    jobData.matches.length > 0,
            ),

        [baseEmployerRecommendations],
    );

    const filtersAppliedForFreelancer =
        hasActiveFilters && baseFreelancerRecommendations.length > 0;

    const filtersAppliedForEmployer =
        hasActiveFilters && employerHasInitialMatches;

    // Pagination for gig worker recommendations (5 items per page)
    const {
        currentPage: gigWorkerPage,
        totalPages: gigWorkerTotalPages,
        currentItems: paginatedGigWorkerRecs,
        goToPage: goToGigWorkerPage,
        shouldShowPagination: shouldShowGigWorkerPagination,
        totalItems: gigWorkerTotalItems,
        itemsPerPage: gigWorkerItemsPerPage,
    } = usePagination(filteredFreelancerRecommendations, 5);

    // Pagination for employer recommendations (5 jobs per page)
    const employerRecsArray = useMemo(() => {
        return Object.entries(filteredEmployerRecommendations || {}).filter(
            ([, jobData]) => jobData && Array.isArray(jobData.matches) && jobData.matches.length > 0
        );
    }, [filteredEmployerRecommendations]);

    const {
        currentPage: employerPage,
        totalPages: employerTotalPages,
        currentItems: paginatedEmployerRecs,
        goToPage: goToEmployerPage,
        shouldShowPagination: shouldShowEmployerPagination,
        totalItems: employerTotalItems,
        itemsPerPage: employerItemsPerPage,
    } = usePagination(employerRecsArray, 5);

    const getMatchScoreColor = (score) => {
        if (score >= 80) return "text-green-600";

        if (score >= 60) return "text-blue-600";

        if (score >= 30) return "text-yellow-600";

        return "text-orange-600";
    };

    const renderFreelancerRecommendations = (items, filtersApplied) => {
        if (!items || items.length === 0) {
            return (
                <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">🔍</div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filtersApplied
                                ? "No Results Found"
                                : "No Job Matches Found"}
                        </h3>

                        <p className="text-gray-600">
                            {filtersApplied
                                ? "Try adjusting your filters to see more AI recommendations."
                                : "We couldn't find any jobs matching your current skills and experience. Try updating your profile with more skills or check back later for new opportunities."}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="space-y-6">
                    {items.map((match, index) => (
                        <div
                            key={index}
                            className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border-l-4 border-blue-500 border border-gray-200"
                        >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">💼</span>

                                        <h3 className="text-lg font-semibold text-gray-900">
                                            <Link
                                                href={route(
                                                    "jobs.show",
                                                    match.job.id,
                                                )}
                                                className="hover:text-blue-600 transition-colors"
                                            >
                                                {match.job.title}
                                            </Link>
                                        </h3>
                                    </div>

                                    <div className="text-sm text-gray-600 flex items-center gap-4">
                                        <span>
                                            Posted by:{" "}
                                            <span className="font-medium">
                                                {match.job.employer &&
                                                    `${match.job.employer.first_name} ${match.job.employer.last_name}`}
                                            </span>
                                        </span>

                                        {match.job.experience_level && (
                                            <span className="px-3 py-1 bg-gray-100 rounded-xl text-sm font-medium shadow-md">
                                                {match.job.experience_level
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    match.job.experience_level.slice(
                                                        1,
                                                    )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div
                                        className={`text-3xl font-bold ${getMatchScoreColor(match.score)}`}
                                    >
                                        {match.score}%
                                    </div>

                                    <div className="text-xs text-gray-500 font-medium">
                                        {match.score >= 80
                                            ? "🎯 Excellent"
                                            : match.score >= 60
                                              ? "👍 Good"
                                              : match.score >= 40
                                                ? "✓ Fair"
                                                : "⚠️ Weak"}{" "}
                                        Match
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-4 border border-blue-200 shadow-md">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <span>🤖</span> AI Analysis - Why this
                                    matches your profile:
                                </h4>

                                <p className="text-gray-700 leading-relaxed">
                                    {match.reason}
                                </p>
                            </div>

                            {match.job.required_skills &&
                                match.job.required_skills.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-xs font-medium text-gray-700 mb-2">
                                            Required Skills:
                                        </h4>

                                        <div className="flex flex-wrap gap-2">
                                            {match.job.required_skills.map(
                                                (skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-xl shadow-md"
                                                    >
                                                        {skill}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Budget:</span>{" "}
                                    {match.job.budget_display ||
                                        `₱${match.job.budget_min || 0} - ₱${match.job.budget_max || 0}`}
                                    {match.job.budget_type && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({match.job.budget_type})
                                        </span>
                                    )}
                                </div>

                                <Link
                                    href={route("jobs.show", match.job.id)}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border border-transparent rounded-xl font-semibold text-sm text-white uppercase tracking-widest shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    View Job Details →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                </div>

                {/* Pagination for Gig Worker Recommendations */}
                {shouldShowGigWorkerPagination && (
                    <Pagination
                        currentPage={gigWorkerPage}
                        totalPages={gigWorkerTotalPages}
                        onPageChange={goToGigWorkerPage}
                        itemsPerPage={gigWorkerItemsPerPage}
                        totalItems={gigWorkerTotalItems}
                    />
                )}
            </>
        );
    };

    const renderEmployerRecommendations = (items, filtersApplied) => {
        const entries = Object.entries(items || {}).filter(
            ([, jobData]) => jobData && Array.isArray(jobData.matches),
        );

        const totalMatches = entries.reduce(
            (count, [, jobData]) => count + jobData.matches.length,

            0,
        );

        if (!entries.length || totalMatches === 0) {
            return (
                <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">dY"?</div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filtersApplied
                                ? "No Candidates Found"
                                : "No AI Matches Available"}
                        </h3>

                        <p className="text-gray-600">
                            {filtersApplied
                                ? "Try expanding your filters to discover more potential gig workers."
                                : "We could not find gig workers that match your current job postings. Check back soon or adjust your requirements."}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="space-y-8">
                    {entries.map(([jobId, jobData]) => {
                    const matches = (jobData.matches || []).filter(
                        (match) => match && match.gig_worker,
                    );

                    if (!matches.length) {
                        return null;
                    }

                    const excellentMatches = matches.filter(
                        (match) => match.score >= 20,
                    );

                    const goodMatches = matches.filter(
                        (match) => match.score >= 10 && match.score < 20,
                    );

                    const basicMatches = matches.filter(
                        (match) => match.score > 0 && match.score < 10,
                    );

                    const showEmptyState =
                        !excellentMatches.length &&
                        !goodMatches.length &&
                        !basicMatches.length;

                    return (
                        <div
                            key={jobId}
                            className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200"
                        >
                            <div className="p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Matches for:{" "}
                                    {jobData.job?.title || "Untitled Job"}
                                </h3>

                                <div className="space-y-4">
                                    {showEmptyState ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>
                                                No matching gig workers found
                                                for this job.
                                            </p>

                                            <p className="text-sm mt-2">
                                                Try adjusting your job
                                                requirements or wait for more
                                                gig workers to join the
                                                platform.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {excellentMatches.length > 0 && (
                                                <>
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-green-700 mb-2">
                                                            dYZ_ Excellent
                                                            Matches (
                                                            {
                                                                excellentMatches.length
                                                            }
                                                            )
                                                        </h4>
                                                    </div>

                                                    {excellentMatches.map(
                                                        (match, index) => {
                                                            const worker =
                                                                match.gig_worker ||
                                                                {};

                                                            return (
                                                                <div
                                                                    key={`excellent-${jobId}-${index}`}
                                                                    className="border border-green-200 bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-md"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-gray-900">
                                                                                {
                                                                                    worker.first_name
                                                                                }{" "}
                                                                                {
                                                                                    worker.last_name
                                                                                }
                                                                            </h4>

                                                                            <div className="text-sm text-gray-600 mt-1">
                                                                                {worker.experience_level ||
                                                                                    "Not specified"}{" "}
                                                                                |{" "}
                                                                                {worker.professional_title ||
                                                                                    "Gig Worker"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-bold text-green-600">
                                                                                {
                                                                                    match.score
                                                                                }
                                                                                %
                                                                            </div>

                                                                            <div className="text-sm text-gray-500">
                                                                                Match
                                                                                Score
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-green-100 rounded-xl p-4 mt-3 shadow-sm">
                                                                        <p className="text-sm text-gray-700">
                                                                            {
                                                                                match.reason
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div className="mt-4 flex justify-end">
                                                                        <Link
                                                                            href={`/gig-worker/${match.gig_worker_id}/profile`}
                                                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border border-transparent rounded-xl font-semibold text-sm text-white uppercase tracking-widest shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                                        >
                                                                            View Profile
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </>
                                            )}

                                            {goodMatches.length > 0 && (
                                                <>
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-blue-700 mb-2">
                                                            dY`? Good Matches (
                                                            {goodMatches.length}
                                                            )
                                                        </h4>

                                                        <p className="text-xs text-gray-600">
                                                            These gig workers
                                                            have relevant skills
                                                            and could be a good
                                                            fit with some
                                                            training.
                                                        </p>
                                                    </div>

                                                    {goodMatches.map(
                                                        (match, index) => {
                                                            const worker =
                                                                match.gig_worker ||
                                                                {};

                                                            return (
                                                                <div
                                                                    key={`good-${jobId}-${index}`}
                                                                    className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-md"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-gray-900">
                                                                                {
                                                                                    worker.first_name
                                                                                }{" "}
                                                                                {
                                                                                    worker.last_name
                                                                                }
                                                                            </h4>

                                                                            <div className="text-sm text-gray-600 mt-1">
                                                                                {worker.experience_level ||
                                                                                    "Not specified"}{" "}
                                                                                |{" "}
                                                                                {worker.professional_title ||
                                                                                    "Gig Worker"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-bold text-blue-600">
                                                                                {
                                                                                    match.score
                                                                                }
                                                                                %
                                                                            </div>

                                                                            <div className="text-sm text-gray-500">
                                                                                Match
                                                                                Score
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-blue-100 rounded-xl p-4 mt-3 shadow-sm">
                                                                        <p className="text-sm text-gray-700">
                                                                            {
                                                                                match.reason
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div className="mt-4 flex justify-end">
                                                                        <button
                                                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border border-transparent rounded-xl font-semibold text-sm text-white uppercase tracking-widest shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 opacity-50 cursor-not-allowed"
                                                                            disabled
                                                                        >
                                                                            View
                                                                            Profile
                                                                            (Coming
                                                                            Soon)
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </>
                                            )}

                                            {basicMatches.length > 0 && (
                                                <>
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-yellow-700 mb-2">
                                                            dY? Potential
                                                            Matches (
                                                            {
                                                                basicMatches.length
                                                            }
                                                            )
                                                        </h4>

                                                        <p className="text-xs text-gray-600">
                                                            These gig workers
                                                            show some relevant
                                                            background and could
                                                            develop into strong
                                                            candidates.
                                                        </p>
                                                    </div>

                                                    {basicMatches.map(
                                                        (match, index) => {
                                                            const worker =
                                                                match.gig_worker ||
                                                                {};

                                                            return (
                                                                <div
                                                                    key={`basic-${jobId}-${index}`}
                                                                    className="border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow-md"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-gray-900">
                                                                                {
                                                                                    worker.first_name
                                                                                }{" "}
                                                                                {
                                                                                    worker.last_name
                                                                                }
                                                                            </h4>

                                                                            <div className="text-sm text-gray-600 mt-1">
                                                                                {worker.experience_level ||
                                                                                    "Not specified"}{" "}
                                                                                |{" "}
                                                                                {worker.professional_title ||
                                                                                    "Gig Worker"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-bold text-yellow-600">
                                                                                {
                                                                                    match.score
                                                                                }
                                                                                %
                                                                            </div>

                                                                            <div className="text-sm text-gray-500">
                                                                                Match
                                                                                Score
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-yellow-100 rounded-xl p-4 mt-3 shadow-sm">
                                                                        <p className="text-sm text-gray-700">
                                                                            {
                                                                                match.reason
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div className="mt-4 flex justify-end">
                                                                        <Link
                                                                            href={`/gig-worker/${match.gig_worker_id}/profile`}
                                                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 border border-transparent rounded-xl font-semibold text-sm text-white uppercase tracking-widest shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                                        >
                                                                            View Profile
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>

                {/* Pagination for Employer Recommendations */}
                {shouldShowEmployerPagination && (
                    <Pagination
                        currentPage={employerPage}
                        totalPages={employerTotalPages}
                        onPageChange={goToEmployerPage}
                        itemsPerPage={employerItemsPerPage}
                        totalItems={employerTotalItems}
                    />
                )}
            </>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    🤖 AI-Powered Matches
                </h2>
            }
        >
            <Head title="AI Recommendations" />

            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap"
                rel="stylesheet"
            />

            <div className="relative py-12 bg-white overflow-hidden">
                {/* Animated Background Shapes */}

                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

                <div
                    className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>

                <div className="relative z-20 max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden shadow-xl sm:rounded-xl mb-8 border border-blue-500">
                        <div className="p-8 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">🤖</span>

                                <h3 className="text-xl font-bold">
                                    {isGigWorker
                                        ? "AI-Powered Job Recommendations"
                                        : "AI-Matched Gig Workers"}
                                </h3>
                            </div>

                            <p className="text-blue-100">
                                {isGigWorker
                                    ? "Our AI analyzes your skills, experience, and professional background to find the best job opportunities for you. Match scores are based on skill compatibility and experience alignment."
                                    : "Our AI evaluates gig worker profiles against your job requirements, focusing on skills match and experience level to find the best candidates for your projects."}
                            </p>

                            <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    80-100%: Excellent Match
                                </span>

                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    60-79%: Good Match
                                </span>

                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    40-59%: Fair Match
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                        <aside className="bg-white/90 backdrop-blur-md border-2 border-blue-200 rounded-xl shadow-2xl p-6 lg:sticky lg:top-24 h-max ring-1 ring-blue-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Filter Recommendations
                                </h3>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Experience Level
                                    </label>

                                    <select
                                        value={filters.experience}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,

                                                experience: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {experienceOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Range{" "}
                                        {isGigWorker
                                            ? "(Job)"
                                            : "(Hourly Rate)"}
                                    </label>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Min"
                                            value={filters.budgetMin}
                                            onChange={handleBudgetChange(
                                                "budgetMin",
                                            )}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        <span className="text-sm text-gray-500">
                                            -
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Max"
                                            value={filters.budgetMax}
                                            onChange={handleBudgetChange(
                                                "budgetMax",
                                            )}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        Set either value to narrow the
                                        recommendations by{" "}
                                        {isGigWorker
                                            ? "job budget"
                                            : "candidate rate"}
                                        .
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Required Skills
                                        </label>
                                        {availableSkills.length > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {availableSkills.length} available
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsSkillDropdownOpen(
                                                (open) => !open,
                                            )
                                        }
                                        className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                        <span>
                                            {filters.skills.length
                                                ? `${filters.skills.length} skill${filters.skills.length > 1 ? "s" : ""} selected`
                                                : "Select skills"}
                                        </span>

                                        <span className="text-xs text-gray-500">
                                            {isSkillDropdownOpen ? "▲" : "▼"}
                                        </span>
                                    </button>

                                    {isSkillDropdownOpen && (
                                        <div className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-y-auto rounded-xl border-2 border-blue-200 bg-white p-3 shadow-2xl ring-1 ring-blue-100">
                                            {availableSkills.length > 0 ? (
                                                <>
                                                    <div className="mb-2 pb-2 border-b border-gray-200">
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Skills from AI recommendations
                                                        </p>
                                                    </div>
                                                    {availableSkills.map((skill) => {
                                                        const isSelected =
                                                            filters.skills.some(
                                                                (selectedSkill) =>
                                                                    selectedSkill.toLowerCase() ===
                                                                    skill.toLowerCase(),
                                                            );

                                                        return (
                                                            <label
                                                                key={skill}
                                                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    onChange={() =>
                                                                        toggleSkillSelection(
                                                                            skill,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="flex-1">{skill}</span>
                                                                {isSelected && (
                                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </label>
                                                        );
                                                    })}
                                                </>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        No skills available yet
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Skills will appear from AI recommendations
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Filter AI matches by required skills
                                    </p>

                                    {filters.skills.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {filters.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                                >
                                                    {skill}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleSkillSelection(
                                                                skill,
                                                            )
                                                        }
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        x
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>

                        <div className="space-y-6">
                            {hasError ? (
                                <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg sm:rounded-xl border border-gray-200">
                                    <div className="p-8 text-center">
                                        <div className="text-6xl mb-4">:(</div>

                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Recommendations Temporarily
                                            Unavailable
                                        </h3>

                                        <p className="text-gray-600 mb-4">
                                            We're experiencing high demand.
                                            Please try again in a few moments.
                                        </p>

                                        <button
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border border-transparent rounded-xl font-semibold text-sm text-white uppercase tracking-widest shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : isGigWorker ? (
                                renderFreelancerRecommendations(
                                    paginatedGigWorkerRecs,

                                    filtersAppliedForFreelancer,
                                )
                            ) : (
                                renderEmployerRecommendations(
                                    Object.fromEntries(paginatedEmployerRecs),

                                    filtersAppliedForEmployer,
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`

                body {

                    background: white;

                    color: #333;

                    font-family: 'Inter', sans-serif;

                }

            `}</style>
        </AuthenticatedLayout>
    );
}
