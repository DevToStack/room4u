"use client";

import { useEffect, useState } from "react";
import AddReview from "./AddReview";
import EditReviewModal from "./EditReviewModal";

export default function ReviewsSection({ apartmentId, userId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?apartmentId=${apartmentId}`);
            const data = await res.json();
            setReviews(data.reviews || []);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const userReview = reviews.find((r) => r.user_id === userId);

    return (
        <div className="space-y-6">
            {/* Add Review Section */}
            <AddReview
                apartmentId={apartmentId}
                userReview={userReview}
                onSuccess={fetchReviews}
            />

            {/* Reviews List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>

                {loading ? (
                    <p className="text-gray-500">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-white p-4 rounded-xl shadow border border-gray-100"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {review.user_name}
                                        </h3>
                                        <p className="text-sm text-yellow-600 mt-1">
                                            ⭐ {review.rating}
                                        </p>
                                    </div>

                                    {/* Edit button only for the user's review */}
                                    {review.user_id === userId && (
                                        <button
                                            onClick={() => setEditingReview(review)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <p className="text-gray-700 mt-3">{review.comment}</p>

                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingReview && (
                <EditReviewModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onUpdated={fetchReviews}
                />
            )}
        </div>
    );
}
