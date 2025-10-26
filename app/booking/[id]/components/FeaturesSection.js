'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

function FeaturesSection({ apartment }) {
    // Default features if API doesn't provide any
    const defaultFeatures = [
        { icon: "faSnowflake", text: "Air Conditioning" },
        { icon: "faFire", text: "Heating" },
        { icon: "faUtensils", text: "Kitchen" },
        { icon: "faTv", text: "TV" },
        { icon: "faSoap", text: "Washing Machine" },
        { icon: "faCar", text: "Free Parking" }
    ];

    const defaultWhatsInclude = [
        { icon: "faWifi", text: "Free WiFi" },
        { icon: "faCar", text: "Parking" },
        { icon: "faUtensils", text: "Kitchen" },
        { icon: "faUsers", text: "Max 4 Guests" }
    ];

    // Use API data if available, otherwise fallback
    const displayFeatures = Array.isArray(apartment?.features) && apartment.features.length > 0
        ? apartment.features
        : defaultFeatures;

    const displayWhatsInclude = Array.isArray(apartment?.whatsInclude) && apartment.whatsInclude.length > 0
        ? apartment.whatsInclude
        : defaultWhatsInclude;

    // Dynamically render FontAwesome icon
    const renderIcon = (iconName) => {
        const icon = solidIcons[iconName];
        if (!icon) {
            return <FontAwesomeIcon icon={solidIcons.faCheckCircle} className="text-teal-400 mb-2" />;
        }
        return <FontAwesomeIcon icon={icon} className="text-teal-400 mb-2" />;
    };

    return (
        <div className="space-y-8">
            {/* Features & Amenities */}
            <div className="bg-neutral-900 rounded-xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayFeatures.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50">
                            <span className="w-5 h-5">
                                {renderIcon(feature.icon)}
                            </span>
                            <span>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* What's Included */}
            <div className="bg-neutral-900 rounded-xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold mb-4">What&apos;s Included</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {displayWhatsInclude.map((item, index) => (
                        <div key={index} className="flex flex-col items-center p-3 bg-neutral-800/50 rounded-lg">
                            <span className="text-2xl">{renderIcon(item.icon)}</span>
                            <span className="text-sm text-center">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FeaturesSection;