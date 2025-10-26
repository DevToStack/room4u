'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

function ExtraInfoSection({ whyBookWithUs = [], policy = {} }) {
    // ✅ Default fallback data
    const defaultWhyBookWithUs = [
        { icon: "faHeadset", text: "24/7 Customer Support" },
        { icon: "faTag", text: "Best Price Guarantee" },
        { icon: "faShieldHalved", text: "Verified Property" }
    ];

    const defaultPolicy = {
        text: "Free cancellation up to 48 hours before check-in.",
        link: "/cancellation-policy"
    };

    // ✅ Always produce valid arrays/objects
    const displayWhyBookWithUs =
        Array.isArray(whyBookWithUs) && whyBookWithUs.length > 0
            ? whyBookWithUs
            : defaultWhyBookWithUs;

    const displayPolicy =
        policy && typeof policy === "object" && Object.keys(policy).length > 0
            ? policy
            : defaultPolicy;

    // ✅ Safe icon rendering
    const renderIcon = (iconName) => {
        const icon =
            typeof iconName === "string" && solidIcons[iconName]
                ? solidIcons[iconName]
                : solidIcons.faCheckCircle;
        return <FontAwesomeIcon icon={icon} className="text-teal-400 mr-2" />;
    };

    return (
        <div className="space-y-6">
            {/* Why Book With Us */}
            <div className="bg-neutral-800/50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">Why Book With Us?</p>
                <ul className="text-sm text-gray-400 space-y-2">
                    {displayWhyBookWithUs.map((reason, index) => (
                        <li
                            key={index}
                            className="flex items-center bg-neutral-900/40 p-2 rounded-md"
                        >
                            {renderIcon(reason?.icon)}
                            <span>{reason?.text || "Benefit available"}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-neutral-800/50 p-4 rounded-lg">
                <p className="font-semibold mb-1">Cancellation Policy</p>
                <p className="text-sm text-gray-400">
                    {displayPolicy?.cancellation ||
                        displayPolicy?.text ||
                        "Policy details not available."}
                </p>
                {displayPolicy?.link && (
                    <a
                        href={displayPolicy.link}
                        className="text-teal-400 text-sm hover:underline ml-1"
                    >
                        Read more
                    </a>
                )}
            </div>
        </div>
    );
}

export default ExtraInfoSection;
