import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";

const {
    faXmark,
    faUser,
    faMapMarkerAlt,
    faMoneyBillWave,
    faCheck,
    faTimes,
    faInfoCircle,
} = solidIcons;

const ApartmentDetailsModal = ({ apartment, isOpen, onClose, getImageUrl }) => {
    if (!isOpen || !apartment) return null;

    // Utility: safely truncate long text
    const truncateText = (text, maxLength = 150) => {
        if (!text) return "Not specified";
        return text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;
    };

    // Utility: normalize items to always have { icon, text }
    const normalizeArray = (arr = [], defaultIcon = faCheck, defaultColor = "text-neutral-300") =>
        arr.map((item) => {
            if (typeof item === "string") {
                return { icon: defaultIcon, text: item, color: defaultColor };
            }
            const iconObj =
                (item.icon && solidIcons[item.icon]) ||
                defaultIcon;
            return { icon: iconObj, text: item.text || "Not specified", color: defaultColor };
        });

    const features = normalizeArray(apartment.features, faCheck, "text-green-400");
    const inclusions = normalizeArray(apartment.inclusions, faCheck, "text-blue-400");
    const rules = normalizeArray(apartment.rules, faInfoCircle, "text-yellow-400");
    const whyBook = normalizeArray(apartment.whyBook, faCheck, "text-green-400");

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-neutral-700 sticky top-0 bg-neutral-900">
                    <h2 className="text-xl font-semibold text-neutral-50">
                        {apartment.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-50 p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image + Basic Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <img
                                src={getImageUrl(apartment)}
                                alt={apartment.title}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-medium text-neutral-50 mb-2">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <FontAwesomeIcon
                                            icon={faMoneyBillWave}
                                            className="text-green-400 w-4 h-4"
                                        />
                                        <span className="text-neutral-400">Price:</span>
                                        <span className="text-neutral-50">
                                            ₹{apartment.price_per_night?.toLocaleString()}/night
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-sm">
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="text-blue-400 w-4 h-4"
                                        />
                                        <span className="text-neutral-400">Max Guests:</span>
                                        <span className="text-neutral-50">
                                            {apartment.max_guests}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-sm">
                                        <FontAwesomeIcon
                                            icon={faMapMarkerAlt}
                                            className="text-red-400 w-4 h-4"
                                        />
                                        <span className="text-neutral-400">Location:</span>
                                        <span className="text-neutral-50">
                                            {apartment.location || "Not specified"}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-sm">
                                        <FontAwesomeIcon
                                            icon={apartment.available ? faCheck : faTimes}
                                            className={
                                                apartment.available
                                                    ? "text-green-400 w-4 h-4"
                                                    : "text-red-400 w-4 h-4"
                                            }
                                        />
                                        <span className="text-neutral-400">Available:</span>
                                        <span
                                            className={
                                                apartment.available
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }
                                        >
                                            {apartment.available ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-medium text-neutral-50 mb-2">
                                    Description
                                </h3>
                                <p className="text-neutral-300 text-sm leading-relaxed">
                                    {truncateText(apartment.description, 300)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features / Inclusions / Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Features */}
                        {features.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-neutral-50 mb-3">
                                    Features
                                </h3>
                                <div className="space-y-2">
                                    {features.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-2 text-sm">
                                            <FontAwesomeIcon icon={item.icon} className={`${item.color} w-3 h-3`} />
                                            <span className="text-neutral-300">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inclusions */}
                        {inclusions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-neutral-50 mb-3">
                                    Inclusions
                                </h3>
                                <div className="space-y-2">
                                    {inclusions.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-2 text-sm">
                                            <FontAwesomeIcon icon={item.icon} className={`${item.color} w-3 h-3`} />
                                            <span className="text-neutral-300">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rules */}
                        {rules.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-neutral-50 mb-3">
                                    Rules
                                </h3>
                                <div className="space-y-2">
                                    {rules.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-2 text-sm">
                                            <FontAwesomeIcon icon={item.icon} className={`${item.color} w-3 h-3`} />
                                            <span className="text-neutral-300">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Policies */}
                    {(apartment.policies?.cancellation || apartment.policies?.booking) && (
                        <div>
                            <h3 className="text-lg font-medium text-neutral-50 mb-3">Policies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {apartment.policies.cancellation && (
                                    <div>
                                        <h4 className="text-sm font-medium text-neutral-400 mb-2">
                                            Cancellation Policy
                                        </h4>
                                        <p className="text-neutral-300 text-sm">
                                            {apartment.policies.cancellation}
                                        </p>
                                    </div>
                                )}
                                {apartment.policies.booking && (
                                    <div>
                                        <h4 className="text-sm font-medium text-neutral-400 mb-2">
                                            Booking Policy
                                        </h4>
                                        <p className="text-neutral-300 text-sm">
                                            {apartment.policies.booking}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Why Book */}
                    {whyBook.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-neutral-50 mb-3">
                                Why Book This Apartment
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {whyBook.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-2 text-sm">
                                        <FontAwesomeIcon icon={item.icon} className={`${item.color} w-4 h-4 mt-0.5`} />
                                        <span className="text-neutral-300">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-neutral-700 sticky bottom-0 bg-neutral-900">
                    <button
                        onClick={onClose}
                        className="bg-neutral-800 hover:bg-neutral-700 px-6 py-2 rounded-lg text-neutral-50 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApartmentDetailsModal;
