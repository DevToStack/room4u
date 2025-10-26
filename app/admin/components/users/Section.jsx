import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';

export default function Section({ title, children, action }) {
    return (
        <div className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 p-5">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-base text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faCircleDot} className="text-blue-400" />
                    {title}
                </h4>
                {action}
            </div>
            {children}
        </div>
    );
}