import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faUserShield,
    faCalendarCheck,
    faFilter,
    faClipboardList,
    faMoneyBill,
    faStar,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    users: faUsers,
    userShield: faUserShield,
    calendarCheck: faCalendarCheck,
    filter: faFilter,
    clipboardList: faClipboardList,
    moneyBill: faMoneyBill,
    star: faStar,
    creditCard: faCreditCard
};

export default function CompactStatCard({ title, value, icon, color, description }) {
    const colorClasses = {
        blue: "text-blue-400 bg-blue-500/10",
        purple: "text-purple-400 bg-purple-500/10",
        green: "text-green-400 bg-green-500/10",
        orange: "text-orange-400 bg-orange-500/10",
    };

    return (
        <div className="bg-neutral-800 rounded-lg p-3 flex items-center gap-3 border border-neutral-700/50">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <FontAwesomeIcon icon={iconMap[icon]} className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-lg">{value}</div>
                <div className="text-gray-400 text-xs truncate">{title}</div>
                {description && (
                    <div className="text-gray-500 text-xs truncate">{description}</div>
                )}
            </div>
        </div>
    );
}