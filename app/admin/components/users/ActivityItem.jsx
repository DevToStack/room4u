import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';

export default function ActivityItem({ activity }) {
    return (
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3 last:border-b-0">
            <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faCircleDot} className="text-blue-400" />
                <p className="text-neutral-300">{activity.message}</p>
            </div>
            <span className="text-sm text-neutral-500 whitespace-nowrap">
                {new Date(activity.date).toLocaleString()}
            </span>
        </div>
    );
}