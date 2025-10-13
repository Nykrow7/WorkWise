import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function useGigWorkers() {
    const [gigWorkers, setGigWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
        from: 0,
        to: 0
    });
    const [availableSkills, setAvailableSkills] = useState([]);
    const [stats, setStats] = useState({
        total_gig_workers: 0,
        average_rating: 0,
        total_completed_projects: 0
    });

    // Fetch gig workers with filters
    const fetchGigWorkers = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get('/api/gig-workers', {
                params: {
                    page: params.page || 1,
                    per_page: params.per_page || 12,
                    search: params.search || '',
                    experience_level: params.experience_level || '',
                    skills: params.skills || '',
                    min_hourly_rate: params.min_hourly_rate || '',
                    max_hourly_rate: params.max_hourly_rate || '',
                    location: params.location || '',
                    sort_by: params.sort_by || 'rating',
                    sort_order: params.sort_order || 'desc',
                    min_rating: params.min_rating || ''
                }
            });

            setGigWorkers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                per_page: response.data.per_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch gig workers');
            console.error('Error fetching gig workers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch available skills
    const fetchAvailableSkills = useCallback(async () => {
        try {
            const response = await axios.get('/api/gig-workers/skills/available');
            setAvailableSkills(response.data.skills || []);
        } catch (err) {
            console.error('Error fetching available skills:', err);
        }
    }, []);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get('/api/gig-workers/stats/overview');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    // Fetch individual gig worker
    const fetchGigWorker = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`/api/gig-workers/${id}`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch gig worker');
            console.error('Error fetching gig worker:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize data on mount
    useEffect(() => {
        fetchGigWorkers();
        fetchAvailableSkills();
        fetchStats();
    }, [fetchGigWorkers, fetchAvailableSkills, fetchStats]);

    return {
        gigWorkers,
        loading,
        error,
        pagination,
        availableSkills,
        stats,
        fetchGigWorkers,
        fetchGigWorker,
        fetchAvailableSkills,
        fetchStats,
        refetch: () => fetchGigWorkers()
    };
}