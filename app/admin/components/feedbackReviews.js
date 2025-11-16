'use client'
import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStar,
    faSearch,
    faFilter,
    faTrash,
    faSync,
    faExclamationTriangle,
    faComment,
    faEnvelope,
    faSort,
    faSortUp,
    faSortDown,
    faChevronLeft,
    faChevronRight,
    faUser,
    faCalendar,
    faEllipsisVertical
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faStar, faSearch, faFilter, faTrash, faSync, faExclamationTriangle, faComment, faEnvelope, faSort, faSortUp, faSortDown, faChevronLeft, faChevronRight, faUser, faCalendar, faEllipsisVertical);

// Interfaces
const Feedback = {
    id: Number,
    user_id: Number,
    username: String,
    message: String,
    rating: Number,
    created_at: String
};

const Review = {
    id: Number,
    user_id: Number,
    name: String,
    comment: String,
    rating: Number,
    created_at: String
};

const Pagination = {
    currentPage: Number,
    totalPages: Number,
    totalItems: Number,
    itemsPerPage: Number
};

export default function ReviewsAndFeedbacks() {
    const [activeTab, setActiveTab] = useState('reviews');
    const [reviews, setReviews] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'DESC' });

    // Pagination states
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Build query string
    const buildQueryString = useCallback((page = pagination.currentPage) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: pagination.itemsPerPage.toString(),
            sortBy: sortConfig.key,
            sortOrder: sortConfig.direction
        });

        if (searchTerm) params.append('search', searchTerm);
        if (selectedRating) params.append('rating', selectedRating);

        return params.toString();
    }, [searchTerm, selectedRating, sortConfig, pagination]);

    // Fetch data
    const fetchData = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError('');

            const endpoint = activeTab === 'reviews' ? '/api/admin/reviews' : '/api/admin/feedback';
            const queryString = buildQueryString(page);
            const url = `${endpoint}?${queryString}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${activeTab}`);
            }

            const result = await response.json();

            if (result.success) {
                if (activeTab === 'reviews') {
                    setReviews(result.data);
                } else {
                    setFeedback(result.data);
                }
                setPagination(result.pagination);
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [activeTab, buildQueryString]);

    // Initial fetch and when dependencies change
    useEffect(() => {
        fetchData(1);
    }, [activeTab, sortConfig]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedRating]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchTerm('');
        setSelectedRating('');
        setSortConfig({ key: 'created_at', direction: 'DESC' });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Handle delete
    const handleDelete = async (id, type) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) {
            return;
        }

        try {
            const endpoint = type === 'review' ? '/api/admin/reviews' : '/api/admin/feedback';
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            const result = await response.json();

            if (result.success) {
                fetchData(pagination.currentPage);
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            alert(`Failed to delete ${type}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'DESC' ? 'ASC' : 'DESC'
        }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage);
        }
    };

    // Render sort icon
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <FontAwesomeIcon icon="sort" className="text-neutral-400" />;
        }
        return sortConfig.direction === 'DESC'
            ? <FontAwesomeIcon icon="sort-down" className="text-blue-400" />
            : <FontAwesomeIcon icon="sort-up" className="text-blue-400" />;
    };

    // Render stars
    const renderStars = (rating) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, index) => (
                    <FontAwesomeIcon
                        key={index}
                        icon="star"
                        className={`text-sm ${index < rating ? 'text-yellow-400' : 'text-neutral-600'}`}
                    />
                ))}
            </div>
        );
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Current data based on active tab
    const currentData = activeTab === 'reviews' ? reviews : feedback;
    const totalItems = pagination.totalItems;

    return (
        <div className="min-h-screen bg-neutral-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">User Content Management</h1>
                    <p className="mt-2 text-neutral-400">Manage reviews and feedback from users</p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-neutral-700">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => handleTabChange('reviews')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'reviews'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-600'
                                    }`}
                            >
                                <FontAwesomeIcon icon="comment" className="mr-2" />
                                Reviews ({totalItems})
                            </button>
                            <button
                                onClick={() => handleTabChange('feedback')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'feedback'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-600'
                                    }`}
                            >
                                <FontAwesomeIcon icon="envelope" className="mr-2" />
                                Feedback ({totalItems})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-6 bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon="search" className="text-neutral-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-neutral-600 rounded-md leading-5 bg-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:placeholder-neutral-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="sm:w-48">
                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border border-neutral-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-neutral-700 text-white"
                            >
                                <option value="" className="bg-neutral-700">All Ratings</option>
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <option key={rating} value={rating} className="bg-neutral-700">
                                        {rating} Star{rating > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div className="sm:w-48">
                            <select
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={(e) => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortConfig({ key, direction });
                                }}
                                className="block w-full pl-3 pr-10 py-2 text-base border border-neutral-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-neutral-700 text-white"
                            >
                                <option value="created_at-DESC" className="bg-neutral-700">Newest First</option>
                                <option value="created_at-ASC" className="bg-neutral-700">Oldest First</option>
                                <option value="rating-DESC" className="bg-neutral-700">Highest Rating</option>
                                <option value="rating-ASC" className="bg-neutral-700">Lowest Rating</option>
                                <option value="name-ASC" className="bg-neutral-700">Name A-Z</option>
                                <option value="name-DESC" className="bg-neutral-700">Name Z-A</option>
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchData(1)}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-neutral-600 shadow-sm text-sm font-medium rounded-md text-white bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 focus:ring-offset-neutral-900"
                        >
                            <FontAwesomeIcon
                                icon="sync"
                                className={`mr-2 ${loading ? 'animate-spin' : ''}`}
                            />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-800 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon icon="exclamation-triangle" className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-400">Error</h3>
                                <p className="text-sm text-red-300 mt-1">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => fetchData(1)}
                                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">
                        {activeTab === 'reviews' ? 'Customer Reviews' : 'User Feedback'}
                    </h3>
                    <div className="text-sm text-neutral-400">
                        Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems)} of{' '}
                        {totalItems} entries
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        // Loading state
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 animate-pulse">
                                <div className="flex items-center mb-3">
                                    <div className="h-10 w-10 bg-neutral-700 rounded-full"></div>
                                    <div className="ml-3 flex-1">
                                        <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-3 bg-neutral-700 rounded w-full mb-2"></div>
                                <div className="h-3 bg-neutral-700 rounded w-5/6 mb-3"></div>
                                <div className="flex justify-between items-center">
                                    <div className="h-4 bg-neutral-700 rounded w-16"></div>
                                    <div className="h-8 bg-neutral-700 rounded w-16"></div>
                                </div>
                            </div>
                        ))
                    ) : currentData.length === 0 ? (
                        // Empty state
                        <div className="col-span-full bg-neutral-800 rounded-lg border border-neutral-700 p-12 text-center">
                            <FontAwesomeIcon
                                icon={activeTab === 'reviews' ? "comment" : "envelope"}
                                className="mx-auto h-16 w-16 text-neutral-600 mb-4"
                            />
                            <h3 className="text-lg font-medium text-white mb-2">No {activeTab} found</h3>
                            <p className="text-neutral-400">
                                No {activeTab} found matching your criteria.
                            </p>
                        </div>
                    ) : (
                        // Data cards
                        currentData.map((item) => (
                            <div key={item.id} className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 hover:border-neutral-600 transition-colors">
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                            <FontAwesomeIcon icon="user" className="text-white text-sm" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-white">
                                                {item.name || item.username || 'Anonymous User'}
                                            </div>
                                            <div className="text-xs text-neutral-400 flex items-center mt-1">
                                                <FontAwesomeIcon icon="calendar" className="mr-1" />
                                                {formatDate(item.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id, activeTab.slice(0, -1))}
                                        className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                                        title="Delete"
                                    >
                                        <FontAwesomeIcon icon="trash" className="text-sm" />
                                    </button>
                                </div>

                                {/* Rating */}
                                {item.rating && (
                                    <div className="mb-3">
                                        {renderStars(item.rating)}
                                        <span className="text-xs text-neutral-400 ml-2">
                                            {item.rating}/5
                                        </span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="mb-4">
                                    <p className="text-sm text-neutral-300 leading-relaxed line-clamp-4">
                                        {item.comment || item.message}
                                    </p>
                                </div>

                                {/* Metadata */}
                                <div className="flex justify-between items-center text-xs text-neutral-500">
                                    <span>ID: {item.id}</span>
                                    <span className="capitalize">{activeTab.slice(0, -1)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-neutral-400">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </div>
                            <div className="flex space-x-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-neutral-600 text-sm font-medium rounded-md text-neutral-300 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FontAwesomeIcon icon="chevron-left" className="mr-2" />
                                    Previous
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${pagination.currentPage === pageNum
                                                ? 'z-10 bg-blue-500 border-blue-500 text-white'
                                                : 'bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="relative inline-flex items-center px-4 py-2 border border-neutral-600 text-sm font-medium rounded-md text-neutral-300 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <FontAwesomeIcon icon="chevron-right" className="ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}