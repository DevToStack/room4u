import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';

export default function MessageModal({ title, message, type = "info", onClose }) {
    const icons = {
        success: faCheck,
        error: faTimes,
        warning: faExclamationTriangle,
        info: faInfoCircle
    };

    const colors = {
        success: "text-green-500",
        error: "text-red-500",
        warning: "text-yellow-500",
        info: "text-blue-500"
    };

    return (
        <Modal title={title} size="sm">
            <div className="text-center">
                <FontAwesomeIcon
                    icon={icons[type]}
                    className={`w-12 h-12 mx-auto mb-4 ${colors[type]}`}
                />
                <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                    OK
                </button>
            </div>
        </Modal>
    );
}