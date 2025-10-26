import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';

export default function ConfirmationModal({
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    onClose,  // This prop is received but not used properly
    type = "danger"
}) {
    const buttonColors = {
        danger: "bg-red-600 hover:bg-red-700",
        warning: "bg-yellow-600 hover:bg-yellow-700",
        primary: "bg-blue-600 hover:bg-blue-700"
    };

    // Use onClose if provided, otherwise fall back to onCancel
    const handleClose = onClose || onCancel;

    return (
        <Modal title={title} size="sm" onClose={handleClose}>  {/* Pass handleClose here */}
            <div className="text-center">
                <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-5xl text-yellow-500"
                />
                <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}