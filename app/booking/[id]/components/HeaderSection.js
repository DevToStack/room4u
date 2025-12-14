'use client'
import { Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { useOffers, applyOffer, getApplicableOffers } from "@/hooks/useOffers";

function HeaderSection({ plan }) {
    const { offers, loading, error } = useOffers(plan?.id);

    // Calculate prices
    const originalPrice = plan.price || 0;
    const discountedPrice = applyOffer(originalPrice, offers, plan?.id);
    const hasDiscount = discountedPrice < originalPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    // Get applicable offers for display
    const applicableOffers = getApplicableOffers(offers, plan?.id);

    return (
        <section className="w-full pt-16 sm:pt-25 py-8 sm:py-12 px-4 sm:px-6 lg:px-12 bg-neutral-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{plan.title || "Untitled Plan"}</h1>
                        <div className="flex items-center gap-4 text-gray-300 mb-4">
                            <div className="flex items-center">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                <span className="ml-1">{plan?.reviews?.rating || 0} ({plan?.reviews?.totalReviews || 0} reviews)</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center">
                                    <FontAwesomeIcon
                                        icon={faLocationDot}
                                        className="text-teal-400 w-4 h-4"
                                    />
                                    <span className="ml-2">{plan?.city}, {plan?.country}</span>
                                </div>
                                <span className="text-sm text-gray-400 ml-6">{plan?.location}</span>
                            </div>
                        </div>
                        <p className="text-gray-400 max-w-2xl">{plan?.description || "A beautifully furnished apartment with modern amenities, perfect for your stay."}</p>

                        {/* Display active offers */}
                        {!loading && applicableOffers.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {applicableOffers.map((offer) => (
                                    <div
                                        key={offer.id}
                                        className="bg-teal-900/30 border border-teal-700 rounded-lg px-3 py-1"
                                    >
                                        <span className="text-teal-300 text-sm font-medium">
                                            🎁 {offer.title}: {offer.discount_percentage}% OFF
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2">
                                            Valid until {new Date(offer.valid_until).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg min-w-[200px]">
                        {hasDiscount ? (
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                        {discountPercentage}% OFF
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {applicableOffers.length > 0 && applicableOffers[0].title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg line-through text-gray-400">₹{originalPrice}</span>
                                    <span className="text-2xl font-bold text-teal-400">₹{discountedPrice}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-teal-400">₹{originalPrice}</div>
                        )}
                        <span className="text-sm font-normal text-gray-400"> / day</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeaderSection;