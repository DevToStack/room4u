import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faTimesCircle, faBan, faSyncAlt, faWallet, faExclamationTriangle, faCircleDot } from '@fortawesome/free-solid-svg-icons';

export default function StatusBadge({ status, variants }) {
    const colorClasses = {
        green: "bg-emerald-600 text-white",
        blue: "bg-blue-600 text-white",
        yellow: "bg-yellow-500 text-black",
        red: "bg-red-600 text-white",
        gray: "bg-neutral-700 text-gray-200",
        purple: "bg-purple-600 text-white",
    };

    const icons = {
        confirmed: faCheckCircle,
        pending: faClock,
        cancelled: faTimesCircle,
        expired: faBan,
        refunded: faSyncAlt,
        paid: faWallet,
        failed: faExclamationTriangle,
    };

    return (
        <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 ${colorClasses[variants[status]] || colorClasses.gray
                }`}
        >
            <FontAwesomeIcon icon={icons[status] || faCircleDot} />
            {status}
        </span>
    );
}