'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

function HouseRulesSection({
    rules = [],
    title = "House Rules",
    iconColor = "text-teal-400",
    className = ""
}) {
    // Default rules if none provided
    const defaultRules = [
        { text: "Check-in: After 2:00 PM", icon: "faClock" },
        { text: "Check-out: Before 11:00 AM", icon: "faClock" },
        { text: "No smoking inside the apartment", icon: "faSmoking" },
        { text: "No pets allowed", icon: "faPaw" },
        { text: "No parties or events", icon: "faMusic" }
    ];

    // Use API-provided rules if available
    const displayRules = rules.length > 0 ? rules : defaultRules;

    return (
        <div className={`bg-neutral-900 rounded-xl p-6 border border-white/10 shadow-lg ${className}`}>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <ul className="space-y-3 text-gray-300">
                {displayRules.map((rule, index) => {
                    const iconName = typeof rule === "string" ? "faCheck" : rule.icon || "faCheck";
                    const icon = solidIcons[iconName];

                    return (
                        <li key={index} className="flex items-start gap-2">
                            {icon ? (
                                <FontAwesomeIcon
                                    icon={icon}
                                    className={`${iconColor} mt-0.5 flex-shrink-0`}
                                />
                            ) : (
                                <span className={`${iconColor} mt-0.5 flex-shrink-0`}>•</span>
                            )}

                            <span>
                                {typeof rule === "string" ? rule : rule.text || ""}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default HouseRulesSection;
