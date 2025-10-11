import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook for client-side pagination
 * 
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page (default: 5)
 * @returns {Object} Pagination state and helpers
 */
export default function usePagination(items = [], itemsPerPage = 5) {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(items.length / itemsPerPage);
    }, [items.length, itemsPerPage]);

    // Get current page items
    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    // Reset to page 1 when items change (e.g., after filtering)
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    // Go to specific page
    const goToPage = (page) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
        
        // Smooth scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Go to next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    // Go to previous page
    const previousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    // Check if pagination should be shown
    const shouldShowPagination = items.length > itemsPerPage;

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        previousPage,
        shouldShowPagination,
        totalItems: items.length,
        itemsPerPage,
    };
}
