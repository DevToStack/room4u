import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import Card from './Card';

export default function UserActivity({ activities }) {
    return (
        <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                <button className="text-teal-400 hover:text-teal-300 font-medium transition-colors duration-200">
                    See All Activity →
                </button>
            </div>

            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-gray-700/50 transition-colors duration-200"
                    >
                        <FontAwesomeIcon
                            icon={faCircle}
                            className="text-teal-400 text-xs mt-2 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-white">{activity.message}</p>
                            <p className="text-sm text-gray-400 mt-1">{activity.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}