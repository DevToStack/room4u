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

library.add(
    faStar, faSearch, faFilter, faTrash, faSync, faExclamationTriangle,
    faComment, faEnvelope, faSort, faSortUp, faSortDown,
    faChevronLeft, faChevronRight, faUser, faCalendar, faEllipsisVertical
);

export default function ReviewsAndFeedbacks() {

    const [activeTab, setActiveTab] = useState("reviews");

    // Data states
    const [reviews, setReviews] = useState([]);
    const [feedback, setFeedback] = useState([]);

    // Loading & Error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Search, Filter, Sort
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: "created_at",
        direction: "DESC"
    });

    // 🔥 SEPARATE STATES FOR PAGINATION
    const [reviewPagination, setReviewPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
    });

    const [feedbackPagination, setFeedbackPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Helper: Get Active Pagination
    const getActivePagination = () => {
        return activeTab === "reviews" ? reviewPagination : feedbackPagination;
    };

    const updateActivePagination = (paginationData) => {
        if (activeTab === "reviews") {
            setReviewPagination(paginationData);
        } else {
            setFeedbackPagination(paginationData);
        }
    };

    const buildQueryString = useCallback(
        (page = getActivePagination().currentPage) => {
            const pagination = getActivePagination();

            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.itemsPerPage.toString(),
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            });

            if (searchTerm) params.append("search", searchTerm);
            if (selectedRating) params.append("rating", selectedRating);

            return params.toString();
        },
        [searchTerm, selectedRating, sortConfig, activeTab]
    );

    const fetchData = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const endpoint =
                    activeTab === "reviews"
                        ? "/api/admin/reviews"
                        : "/api/admin/feedback";

                const qs = buildQueryString(page);
                const response = await fetch(`${endpoint}?${qs}`);

                if (!response.ok) throw new Error("Failed to fetch data");

                const result = await response.json();

                if (!result.success) throw new Error(result.message);

                if (activeTab === "reviews") {
                    setReviews(result.data);
                } else {
                    setFeedback(result.data);
                }

                updateActivePagination(result.pagination);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [activeTab, buildQueryString]
    );

    // Fetch on tab change or sort change
    useEffect(() => {
        fetchData(1);
    }, [activeTab, sortConfig]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => fetchData(1), 400);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedRating]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchTerm("");
        setSelectedRating("");
        setSortConfig({ key: "created_at", direction: "DESC" });

        // Reset tab-specific pagination
        if (tab === "reviews") {
            setReviewPagination((prev) => ({ ...prev, currentPage: 1 }));
        } else {
            setFeedbackPagination((prev) => ({ ...prev, currentPage: 1 }));
        }
    };

    const handlePageChange = (page) => {
        const pagination = getActivePagination();
        if (page < 1 || page > pagination.totalPages) return;
        fetchData(page);
    };

    const handleDelete = async (id, type) => {
        if (!confirm(`Delete this ${type}?`)) return;

        const endpoint =
            type === "review"
                ? "/api/admin/reviews"
                : "/api/admin/feedback";

        const res = await fetch(endpoint, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        const result = await res.json();
        if (result.success) fetchData(getActivePagination().currentPage);
    };

    const renderStars = (rating) => (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon
                    key={i}
                    icon="star"
                    className={`text-sm ${i < rating ? "text-yellow-400" : "text-neutral-600"}`}
                />
            ))}
        </div>
    );

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const currentData = activeTab === "reviews" ? reviews : feedback;
    const pagination = getActivePagination();
    const totalItems = pagination.totalItems;

    return (
        <div className="min-h-screen bg-neutral-900 py-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">User Content Management</h1>
                    <p className="text-neutral-400">Manage reviews and feedback</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-neutral-700 mb-8">
                    <nav className="flex space-x-8 -mb-px">
                        <button
                            onClick={() => handleTabChange("reviews")}
                            className={`py-2 px-1 border-b-2 flex items-center ${activeTab === "reviews"
                                    ? "border-blue-500 text-blue-400"
                                    : "text-neutral-400 hover:text-neutral-200 border-transparent"
                                }`}>
                            <FontAwesomeIcon icon="comment" className="mr-2" />
                            Reviews ({reviewPagination.totalItems})
                        </button>

                        <button
                            onClick={() => handleTabChange("feedback")}
                            className={`py-2 px-1 border-b-2 flex items-center ${activeTab === "feedback"
                                    ? "border-blue-500 text-blue-400"
                                    : "text-neutral-400 hover:text-neutral-200 border-transparent"
                                }`}>
                            <FontAwesomeIcon icon="envelope" className="mr-2" />
                            Feedback ({feedbackPagination.totalItems})
                        </button>
                    </nav>
                </div>

                {/* Search + Filters */}
                <div className="mb-6 bg-neutral-800 p-4 rounded-md border border-neutral-700">
                    <div className="flex flex-col sm:flex-row gap-4">

                        {/* Search */}
                        <div className="flex-1 relative">
                            <FontAwesomeIcon
                                icon="search"
                                className="absolute left-3 top-3 text-neutral-400"
                            />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-10 pr-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600"
                            />
                        </div>

                        {/* Rating Filter */}
                        <select
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(e.target.value)}
                            className="sm:w-48 bg-neutral-700 text-white border border-neutral-600 rounded">
                            <option value="">All Ratings</option>
                            {[1, 2, 3, 4, 5].map((r) => (
                                <option key={r} value={r}>{r} Stars</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={`${sortConfig.key}-${sortConfig.direction}`}
                            onChange={(e) => {
                                const [key, dir] = e.target.value.split("-");
                                setSortConfig({ key, direction: dir });
                            }}
                            className="sm:w-48 bg-neutral-700 text-white border border-neutral-600 rounded">
                            <option value="created_at-DESC">Newest First</option>
                            <option value="created_at-ASC">Oldest First</option>
                            <option value="rating-DESC">Highest Rating</option>
                            <option value="rating-ASC">Lowest Rating</option>
                            <option value="name-ASC">Name A-Z</option>
                            <option value="name-DESC">Name Z-A</option>
                        </select>

                        {/* Refresh */}
                        <button
                            onClick={() => fetchData(1)}
                            className="px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded hover:bg-neutral-600">
                            <FontAwesomeIcon
                                icon="sync"
                                className={loading ? "animate-spin mr-2" : "mr-2"}
                            />
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-800 p-4 rounded">
                        <div className="flex items-start">
                            <FontAwesomeIcon icon="exclamation-triangle" className="text-red-400 mr-3" />
                            <div>
                                <p className="text-red-300">{error}</p>
                                <button
                                    onClick={() => fetchData(1)}
                                    className="text-sm text-red-400 underline mt-2">
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Count */}
                <div className="mb-4 flex justify-between text-neutral-300">
                    <h3 className="text-lg text-white">
                        {activeTab === "reviews" ? "Customer Reviews" : "User Feedback"}
                    </h3>
                    <span className="text-sm">
                        Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                        {Math.min(
                            pagination.currentPage * pagination.itemsPerPage,
                            totalItems
                        )}{" "}
                        of {totalItems}
                    </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">

                    {/* Loading Skeletons */}
                    {loading &&
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-neutral-800 p-4 border border-neutral-700 rounded animate-pulse">
                                <div className="flex items-center mb-3">
                                    <div className="rounded-full bg-neutral-700 h-10 w-10"></div>
                                    <div className="ml-3 flex-1">
                                        <div className="h-4 bg-neutral-700 w-3/4 rounded mb-2"></div>
                                        <div className="h-3 bg-neutral-700 w-1/2 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-3 bg-neutral-700 rounded mb-2"></div>
                                <div className="h-3 bg-neutral-700 w-5/6 rounded mb-3"></div>
                            </div>
                        ))}

                    {/* Empty State */}
                    {!loading && currentData.length === 0 && (
                        <div className="col-span-full p-12 bg-neutral-800 border border-neutral-700 rounded text-center">
                            <FontAwesomeIcon
                                icon={activeTab === "reviews" ? "comment" : "envelope"}
                                className="text-neutral-500 text-5xl mb-4"
                            />
                            <p className="text-neutral-300 text-lg">No {activeTab} found</p>
                        </div>
                    )}
                    {console.log(currentData)}
                    {/* Data Cards */}
                    {!loading &&
                        currentData.map((item) => (
                            <div
                                key={item.id}
                                className="bg-neutral-800 p-4 border border-neutral-700 rounded hover:border-neutral-500 transition">

                                <div className="flex justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="bg-blue-500 h-10 w-10 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon="user" className="text-white" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-white">
                                                {item.username || item.name || "Unknown User"}
                                            </p>
                                            <p className="text-xs text-neutral-400 flex items-center">
                                                <FontAwesomeIcon
                                                    icon="calendar"
                                                    className="mr-1"
                                                />
                                                {formatDate(item.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className="text-neutral-400 hover:text-red-400"
                                        onClick={() =>
                                            handleDelete(
                                                item.id,
                                                activeTab === "reviews" ? "review" : "feedback"
                                            )
                                        }>
                                        <FontAwesomeIcon icon="trash" />
                                    </button>
                                </div>

                                {item.rating && (
                                    <div className="mb-3 flex items-center">
                                        {renderStars(item.rating)}
                                        <span className="text-xs text-neutral-400 ml-2">
                                            {item.rating}/5
                                        </span>
                                    </div>
                                )}

                                <p className="text-neutral-300 text-sm mb-4 line-clamp-4">
                                    {item.comment || item.message}
                                </p>

                                <div className="text-xs text-neutral-500 flex justify-between">
                                    <span>ID: {item.id}</span>
                                    <span>{activeTab}</span>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
                        <div className="flex justify-between items-center">

                            <span className="text-neutral-400 text-sm">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <div className="flex space-x-2">

                                {/* Prev */}
                                <button
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    className="px-4 py-2 bg-neutral-700 text-neutral-300 border border-neutral-600 rounded disabled:opacity-40">
                                    <FontAwesomeIcon icon="chevron-left" className="mr-2" />
                                    Previous
                                </button>

                                {Array.from(
                                    { length: Math.min(5, pagination.totalPages) },
                                    (_, i) => {
                                        let pageNum;

                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            pagination.currentPage >= pagination.totalPages - 2
                                        ) {
                                            pageNum = pagination.totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-4 py-2 border rounded ${pageNum === pagination.currentPage
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "bg-neutral-700 text-neutral-300 border-neutral-600 hover:bg-neutral-600"
                                                    }`}>
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                )}

                                {/* Next */}
                                <button
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className="px-4 py-2 bg-neutral-700 text-neutral-300 border border-neutral-600 rounded disabled:opacity-40">
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
