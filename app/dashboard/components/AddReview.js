"use client";

import { useState } from "react";

export default function AddReview({ apartmentId, userReview, onSuccess }) {
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    if (userReview) {
        return (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                <p className="font-semibold text-blue-800">
                    You already posted a review.
                </p>
                <p className="text-blue-600 text-sm mt-1">
                    You can edit your review below.
                </p>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apartment_id: apartmentId, rating, comment }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            alert(data.error || "Error posting review");
            return;
        }

        setRating("");
        setComment("");
        onSuccess();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded-xl shadow border border-gray-100 space-y-4"
        >
            <h2 className="text-lg font-semibold">Write a Review</h2>

            <div>
                <label className="block text-sm font-medium">Rating</label>
                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full border rounded-lg p-2 mt-1"
                    required
                >
                    <option value="">Select</option>
                    <option value="1">1 ⭐</option>
                    <option value="2">2 ⭐</option>
                    <option value="3">3 ⭐</option>
                    <option value="4">4 ⭐</option>
                    <option value="5">5 ⭐</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Comment</label>
                <textarea
                    rows="4"
                    className="w-full border p-2 rounded-lg mt-1"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
            </div>

            <button
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                {loading ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}
