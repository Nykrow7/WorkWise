import React from 'react';

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} itemsPerPage - Items shown per page
 * @param {number} totalItems - Total number of items
 */
export default function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange,
    itemsPerPage = 5,
    totalItems = 0
}) {
    // Don't render if only one page or no items
    if (totalPages <= 1 || totalItems === 0) {
        return null;
    }

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Maximum page numbers to show

        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Smart pagination with ellipsis
            if (currentPage <= 3) {
                // Near the start
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // In the middle
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        if (typeof page === 'number' && page !== currentPage) {
            onPageChange(page);
        }
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-6 mt-6">
            {/* Items count info */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-700">
                    Showing <span className="font-semibold text-blue-600">{startItem}</span> to{' '}
                    <span className="font-semibold text-blue-600">{endItem}</span> of{' '}
                    <span className="font-semibold text-gray-900">{totalItems}</span> items
                </p>
                <p className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages}
                </p>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-center gap-2">
                {/* Previous button */}
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-200 transform
                        ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-105'
                        }
                    `}
                    aria-label="Previous page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-3 py-2 text-gray-400 select-none"
                                >
                                    ...
                                </span>
                            );
                        }

                        const isActive = page === currentPage;

                        return (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={`
                                    min-w-[40px] h-10 px-3 rounded-lg font-medium text-sm
                                    transition-all duration-200 transform
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm hover:scale-105 border border-gray-200'
                                    }
                                `}
                                aria-label={`Go to page ${page}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next button */}
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-200 transform
                        ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-105'
                        }
                    `}
                    aria-label="Next page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Quick jump (optional - only show for many pages) */}
            {totalPages > 10 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <label htmlFor="page-jump" className="text-sm text-gray-600">
                        Jump to page:
                    </label>
                    <input
                        id="page-jump"
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= totalPages) {
                                onPageChange(page);
                            }
                        }}
                        className="w-20 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                </div>
            )}
        </div>
    );
}
