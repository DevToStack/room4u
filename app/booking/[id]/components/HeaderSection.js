import { Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

function HeaderSection({ plan }) {
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
                                <div className="flex items-center"> {/* Added items-center here */}
                                    <FontAwesomeIcon
                                        icon={faLocationDot}
                                        className="text-teal-400 w-4 h-4" // ✅ Fixed size
                                    />
                                    <span className="ml-2">{plan?.city}, {plan?.country}</span>
                                </div>
                                <span className="text-sm text-gray-400 ml-6">{plan?.location}</span> {/* Added ml-6 for alignment */}
                            </div>
                        </div>
                        <p className="text-gray-400 max-w-2xl">{plan?.description || "A beautifully furnished apartment with modern amenities, perfect for your stay."}</p>
                    </div>
                    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
                        <div className="text-2xl font-bold text-teal-400">₹{plan.price}<span className="text-sm font-normal text-gray-400"> / day</span></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeaderSection;