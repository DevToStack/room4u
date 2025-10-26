'use client'

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import Toast from "./toast";

function ReviewText({ text }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 120;
    const shortText = text.slice(0, 120);

    return (
        <p className="text-white/90 leading-relaxed">
            {expanded || !isLong ? text : `${shortText}... `}
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-teal-400 hover:underline ml-1"
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </p>
    );
}

const ReviewSkeleton = () => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                <div className="h-3 bg-white/20 rounded w-3/4"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-white/20 rounded"></div>
            <div className="h-3 bg-white/20 rounded w-5/6"></div>
            <div className="h-3 bg-white/20 rounded w-4/6"></div>
        </div>
    </div>
);

const ReviewSection = ({id}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "" });

    const apartmentId = parseInt(id, 10); // dynamic if needed

    const resetForm = () => {
        setComment('');
        setRating(0);
        setHover(0);
    };

    useEffect(() => {
        document.body.style.overflow = showModal ? "hidden" : "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [showModal]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?apartmentId=${apartmentId}`, {
                headers: { 'Cache-Control': 'max-age=300' },
            });

            if (!res.ok) throw new Error('Failed to fetch reviews');

            const data = await res.json();
            const mapped = data.reviews.map(r => ({
                id: r.id,
                name: r.user_name || "Anonymous",
                rating: r.rating,
                comment: r.comment,
            }));
            setReviews(mapped);
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to load reviews.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (!comment || rating === 0) {
            setToast({ message: "Please provide a comment and rating.", type: "warning" });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ apartment_id: apartmentId, rating, comment }),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchReviews();
                resetForm();
                setShowModal(false);
                setToast({ message: "Review submitted successfully!", type: "success" });
            } else {
                setToast({ message: data.error || "Failed to submit review.", type: "error" });
            }
        } catch (err) {
            console.error(err);
            setToast({ message: "Something went wrong.", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="w-full px-4 py-16 bg-neutral-900">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
                What Guests Are Saying
            </h2>

            <div className="max-w-7xl mx-auto">
                <div className="max-h-[420px] overflow-y-auto scrollbar-hide mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 p-4">
                        {loading ? (
                            Array(4).fill(null).map((_, i) => <ReviewSkeleton key={i} />)
                        ) : reviews.length === 0 ? (
                            <p className="text-white/60 text-lg col-span-full text-center">No reviews yet. Be the first!</p>
                        ) : (
                            reviews.map(review => (
                                <div
                                    key={review.id}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-100 transition-all hover:bg-white/15 hover:scale-105 duration-300"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                            {review.name.charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg truncate">{review.name}</h4>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <FontAwesomeIcon
                                                        key={i}
                                                        icon={i < review.rating ? solidStar : regularStar}
                                                        className={`text-sm ${i < review.rating ? 'text-teal-400' : 'text-white/30'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <ReviewText text={review.comment} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 font-semibold text-white rounded-xl bg-teal-400/20 hover:bg-teal-500 transition-all duration-200 shadow-md hover:shadow-xl"
                    >
                        Write a Review
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-5">
                    <div className="bg-neutral-900 border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative backdrop-blur-xl">
                        <button
                            onClick={() => { resetForm(); setShowModal(false); }}
                            className="absolute top-4 right-4 text-white/60 hover:text-white"
                        >
                            ✕
                        </button>

                        <h3 className="text-2xl font-semibold text-white mb-6">Leave a Review</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <textarea
                                placeholder="Share your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full h-28 p-4 rounded-xl border border-white/10 bg-white/10 text-white placeholder-white/60 resize-none focus:outline-none focus:border-teal-400 transition-all"
                                required
                            />

                            <div className="flex flex-col gap-2">
                                <span className="text-white/70 mr-2">Your Rating:</span>
                                <div>
                                    {[...Array(5)].map((_, i) => {
                                        const ratingValue = i + 1;
                                        return (
                                            <label key={ratingValue} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    value={ratingValue}
                                                    onClick={() => setRating(ratingValue)}
                                                    className="hidden"
                                                />
                                                <FontAwesomeIcon
                                                    icon={ratingValue <= (hover || rating) ? solidStar : regularStar}
                                                    onMouseEnter={() => setHover(ratingValue)}
                                                    onMouseLeave={() => setHover(0)}
                                                    className={`text-2xl transition-all duration-150 ease-in-out mr-2 ${ratingValue <= (hover || rating)
                                                        ? 'text-teal-400 scale-110'
                                                        : 'text-white/30'
                                                        }`}
                                                />
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 font-semibold rounded-xl transition-all duration-200 shadow-md ${submitting
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-teal-400/20 hover:bg-white hover:text-black'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {toast.message && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: "", type: "" })}
                />
            )}
        </section>
    )
}

export default ReviewSection;
