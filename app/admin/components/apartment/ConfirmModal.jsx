import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faXmark } from '@fortawesome/free-solid-svg-icons';

const ConfirmModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: "text-red-400",
            button: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        },
        warning: {
            icon: "text-yellow-400",
            button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
        },
        primary: {
            icon: "text-blue-400",
            button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }
    };

    const currentVariant = variantStyles[variant] || variantStyles.danger;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-md shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className={`w-5 h-5 ${currentVariant.icon}`}
                        />
                        <h3 className="text-lg font-semibold text-neutral-50">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="text-neutral-400 hover:text-neutral-50 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-neutral-300">{message}</p>
                </div>

                <div className="flex space-x-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white ${currentVariant.button} disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900`}
                    >
                        {loading ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;