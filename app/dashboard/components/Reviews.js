"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faPenToSquare,
    faTrash,
    faSearch,
    faFilter,
    faSort,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

export default function UserReviews() {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

    // Fetch user's own reviews
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const res = await fetch("/api/reviews");
                const data = await res.json();
                if (data.reviews) {
                    setReviews(data.reviews);
                    setFilteredReviews(data.reviews);
                }
            } catch (err) {
                console.error("Fetch user reviews error:", err);
            }
            setLoading(false);
        };
        fetchUserReviews();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let results = [...reviews];

        // Apply search filter
        if (searchTerm) {
            results = results.filter(review =>
                review.apartment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.comment.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply rating filter
        if (ratingFilter !== "all") {
            results = results.filter(review => review.rating === parseInt(ratingFilter));
        }

        // Apply sorting
        results.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.created_at) - new Date(a.created_at);
                case "oldest":
                    return new Date(a.created_at) - new Date(b.created_at);
                case "highest":
                    return b.rating - a.rating;
                case "lowest":
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

        setFilteredReviews(results);
    }, [reviews, searchTerm, ratingFilter, sortBy]);

    // Update Review
    const handleUpdate = async () => {
        if (!editingReview) return;

        try {
            const res = await fetch(`/api/reviews/${editingReview.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: editingReview.rating,
                    comment: editingReview.comment
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setReviews((prev) =>
                    prev.map((r) =>
                        r.id === editingReview.id ? { ...r, ...editingReview } : r
                    )
                );
                setEditingReview(null);
            } else {
                alert(data.error || "Failed to update review");
            }
        } catch (err) {
            console.error("Update review error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                setReviews((prev) => prev.filter((r) => r.id !== id));
            } else {
                alert(data.error || "Failed to delete review");
            }
        } catch (err) {
            console.error("Delete review error:", err);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setRatingFilter("all");
        setSortBy("newest");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!reviews.length) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-300 text-xl mb-2">No reviews posted yet.</p>
                <p className="text-gray-500">Start sharing your experiences!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search reviews by apartment or comment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Toggle for Mobile */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                    >
                        <FontAwesomeIcon icon={faFilter} className="mr-2" />
                        Filters
                    </button>

                    {/* Filters - Desktop */}
                    <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-4 lg:items-center`}>
                        {/* Rating Filter */}
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>

                        {/* Sort By */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                        </select>

                        {/* Clear Filters */}
                        {(searchTerm || ratingFilter !== "all") && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-colors"
                            >
                                <FontAwesomeIcon icon={faXmark} className="mr-2" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* No Results */}
            {filteredReviews.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <p className="text-gray-300 text-xl mb-2">No reviews found</p>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* Reviews Grid */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredReviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-gray-100 hover:bg-white/10 transition-all duration-300 hover:border-white/20 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">
                                    {review.apartment_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesomeIcon
                                                key={i}
                                                icon={faStar}
                                                className={`text-sm ${i < review.rating
                                                        ? "text-yellow-400"
                                                        : "text-gray-500"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {review.rating}.0
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingReview(review)}
                                    className="p-2 text-blue-400 hover:text-blue-300 bg-blue-800/40 hover:bg-blue-700/40 rounded-lg transition-colors"
                                    title="Edit review"
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>

                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="p-2 text-red-400 hover:text-red-300 bg-red-800/40 hover:bg-red-700/40 rounded-lg transition-colors"
                                    title="Delete review"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>

                        {/* Comment */}
                        <p className="text-gray-300 line-clamp-3 mb-4">{review.comment}</p>

                        {/* Date */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                                {new Date(review.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${review.rating >= 4
                                        ? "bg-green-500/20 text-green-300"
                                        : review.rating >= 3
                                            ? "bg-yellow-500/20 text-yellow-300"
                                            : "bg-red-500/20 text-red-300"
                                    }`}
                            >
                                {review.rating >= 4
                                    ? "Excellent"
                                    : review.rating >= 3
                                        ? "Good"
                                        : review.rating >= 2
                                            ? "Fair"
                                            : "Poor"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>


            {editingReview && (
                <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
                    <div className="
                        w-full max-w-xl 
                        bg-neutral-900 
                        border border-white/10 
                        rounded-2xl 
                        shadow-[0_0_30px_rgba(0,0,0,0.6)] 
                        p-5 sm:p-7
                        animate-in fade-in duration-200
                    ">

                        {/* Title */}
                        <div className="text-center mb-7">
                            <h2 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Edit Review
                            </h2>
                            <div className="h-[2px] w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-3"></div>
                        </div>

                        {/* Apartment */}
                        <div className="space-y-2 mb-6">
                            <label className="text-gray-400 text-sm font-medium">
                                Apartment
                            </label>
                            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                                <p className="text-white text-base sm:text-lg font-semibold break-all">
                                    {editingReview.apartment_name}
                                </p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="mb-7">
                            <label className="text-gray-400 text-sm font-medium block mb-3 text-center">
                                Your Rating
                            </label>
                            <div className="flex justify-center gap-3 sm:gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FontAwesomeIcon
                                        key={star}
                                        icon={faStar}
                                        onClick={() => setEditingReview({ ...editingReview, rating: star })}
                                        className={`
                                            text-2xl sm:text-3xl cursor-pointer transition-transform duration-200
                                            ${star <= editingReview.rating
                                                                            ? "text-yellow-400 scale-110 drop-shadow-[0_0_6px_rgba(255,255,0,0.35)]"
                                                                            : "text-gray-600 hover:text-yellow-300 hover:scale-110"
                                                                        }
                                            `}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Review */}
                        <div className="space-y-2 mb-8">
                            <label className="text-gray-400 text-sm font-medium">
                                Your Review
                            </label>
                            <textarea
                                value={editingReview.comment}
                                onChange={(e) =>
                                    setEditingReview({ ...editingReview, comment: e.target.value })
                                }
                                className="
                                    w-full h-32 sm:h-36 
                                    bg-neutral-800 
                                    border border-neutral-700 
                                    text-white 
                                    rounded-xl 
                                    p-4 
                                    resize-none 
                                    outline-none 
                                    focus:ring-2 focus:ring-blue-600
                                    transition
                                    placeholder-gray-500
                                    "
                                placeholder="Write your experience..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex sm:justify-end gap-3">

                            <button
                                onClick={() => setEditingReview(null)}
                                className="
                                    w-full sm:w-auto 
                                    px-6 py-3 
                                    rounded-xl 
                                    bg-neutral-800 
                                    border border-neutral-700 
                                    text-white 
                                    hover:bg-neutral-700 
                                    transition
                                    font-medium
                                    "
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdate}
                                className="
                                    w-full sm:w-auto 
                                    px-6 py-3 
                                    rounded-xl 
                                    bg-gradient-to-r from-blue-600 to-blue-700 
                                    hover:from-blue-500 hover:to-blue-600 
                                    text-white 
                                    font-semibold 
                                    shadow-lg 
                                    hover:shadow-blue-500/20 
                                    transition
                                    "
                            >
                                Update
                            </button>

                        </div>

                    </div>
                </div>
            )}
  

        </div>
    );
}