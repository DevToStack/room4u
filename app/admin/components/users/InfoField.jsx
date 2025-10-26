import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserShield } from '@fortawesome/free-solid-svg-icons';

export default function InfoField({ label, value, important = false, badge = false, badgeColor = "gray", mono = false }) {
    const badgeColors = {
        gray: "bg-neutral-700 text-gray-200",
        green: "bg-emerald-600 text-white",
        blue: "bg-blue-600 text-white",
        purple: "bg-purple-600 text-white",
        red: "bg-red-600 text-white",
        yellow: "bg-yellow-500 text-black",
    };

    return (
        <div>
            <label className="text-xs text-neutral-500 block mb-1">{label}</label>
            {badge ? (
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${badgeColors[badgeColor]}`}>
                    <FontAwesomeIcon
                        icon={value === "admin" ? faUserShield : faUser}
                        className="mr-1"
                    />
                    {value}
                </span>
            ) : (
                <p
                    className={`${important ? "font-medium text-white" : "text-neutral-300"} ${mono ? "font-mono text-sm" : ""
                        }`}
                >
                    {value || "—"}
                </p>
            )}
        </div>
    );
}