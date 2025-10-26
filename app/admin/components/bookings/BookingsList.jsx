import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCheckCircle, faBan, faTrash, faTimes, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const BookingsList = ({
    bookings,
    loading,
    pagination,
    onPageChange,
    onViewBooking,
    onStatusUpdate,
    onDeleteBooking,
}) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: "bg-yellow-500/20 text-yellow-400",
            confirmed: "bg-green-500/20 text-green-400",
            cancelled: "bg-red-500/20 text-red-400",
            expired: "bg-gray-500/20 text-gray-400",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-500/20 text-gray-400"
                    }`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const paymentColors = {
            paid: "bg-green-500/20 text-green-400",
            failed: "bg-red-500/20 text-red-400",
            refunded: "bg-blue-500/20 text-blue-400",
            cancelled: "bg-gray-500/20 text-gray-400",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[paymentStatus] || "bg-gray-500/20 text-gray-400"
                    }`}
            >
                {paymentStatus
                    ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
                    : "N/A"}
            </span>
        );
    };

    const handleQuickStatusUpdate = async (bookingId, newStatus) => {
        if (newStatus === "cancelled") {
            setSelectedBooking(bookingId);
            setCancelReason("");
            setShowCancelModal(true);
        } else if (newStatus === "confirmed") {
            setSelectedBooking(bookingId);
            setShowConfirmModal(true);
        } else {
            await onStatusUpdate(bookingId, newStatus);
        }
    };

    const handleConfirmBooking = async () => {
        if (selectedBooking) {
            setActionLoading(true);
            try {
                await onStatusUpdate(selectedBooking, "confirmed");
                setShowConfirmModal(false);
                setSelectedBooking(null);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleConfirmCancel = async () => {
        if (selectedBooking && cancelReason.trim()) {
            setActionLoading(true);
            try {
                await onStatusUpdate(selectedBooking, "cancelled", cancelReason);
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason("");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleDeleteClick = (bookingId) => {
        setSelectedBooking(bookingId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedBooking) {
            setActionLoading(true);
            try {
                await onDeleteBooking(selectedBooking);
                setShowDeleteModal(false);
                setSelectedBooking(null);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const closeModals = () => {
        setShowCancelModal(false);
        setShowDeleteModal(false);
        setShowConfirmModal(false);
        setSelectedBooking(null);
        setCancelReason("");
        setActionLoading(false);
    };

    const ActionButton = ({
        onClick,
        icon,
        label,
        variant = "default",
        disabled = false
    }) => {
        const variants = {
            default: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
            confirm: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
            cancel: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
            delete: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`flex items-center px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
            >
                <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-2" />
                {label}
            </button>
        );
    };

    if (bookings.length === 0 && !loading) {
        return (
            <div className="bg-neutral-900 rounded-xl shadow p-8 text-center border border-neutral-800">
                <p className="text-neutral-400 text-lg">No bookings found</p>
                <p className="text-neutral-500 mt-2">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-neutral-800 rounded-xl shadow-sm overflow-hidden border border-neutral-700">
                {/* Scrollable Table */}
                <div
                    className="overflow-y-auto overflow-x-auto"
                    style={{ maxHeight: "calc(100vh - 400px)", minHeight: "200px" }}
                >
                    <table className="w-full text-left border-collapse text-neutral-50 min-w-[1024px]">
                        <thead className="bg-neutral-700 sticky top-0 z-20 text-sm">
                            <tr>
                                {[
                                    "Booking ID",
                                    "User",
                                    "Apartment",
                                    "Dates",
                                    "Status",
                                    "Payment",
                                    "Amount",
                                    "Actions",
                                ].map((th, idx) => (
                                    <th
                                        key={idx}
                                        className="p-4 text-left font-semibold text-neutral-300 uppercase tracking-wide"
                                    >
                                        {th}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-700">
                            {bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-neutral-800 transition duration-150"
                                >
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            #{booking.id}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            {booking.user_name}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.user_email}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.user_phone}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            {booking.apartment_title}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.total_nights} nights
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm text-neutral-200">
                                            {new Date(booking.start_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-neutral-500 text-center">
                                            to
                                        </div>
                                        <div className="text-sm text-neutral-200">
                                            {new Date(booking.end_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {getPaymentBadge(booking.payment_status)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            ₹{booking.total_amount || booking.paid_amount || "0"}
                                        </div>
                                        {booking.paid_amount && (
                                            <div className="text-xs text-neutral-400">
                                                Paid: ₹{booking.paid_amount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            <ActionButton
                                                onClick={() => onViewBooking(booking)}
                                                icon={faEye}
                                                label="View"
                                                variant="default"
                                            />

                                            {booking.status === "pending" && (
                                                <ActionButton
                                                    onClick={() => handleQuickStatusUpdate(booking.id, "confirmed")}
                                                    icon={faCheckCircle}
                                                    label="Confirm"
                                                    variant="confirm"
                                                />
                                            )}

                                            {booking.status !== "cancelled" && booking.status !== "confirmed" && (
                                                <ActionButton
                                                    onClick={() => handleQuickStatusUpdate(booking.id, "cancelled")}
                                                    icon={faBan}
                                                    label="Cancel"
                                                    variant="cancel"
                                                />
                                            )}

                                            <ActionButton
                                                onClick={() => handleDeleteClick(booking.id)}
                                                icon={faTrash}
                                                label="Delete"
                                                variant="delete"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination?.pages > 1 && (
                    <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between border-t border-neutral-800 sm:px-6">
                        <div className="flex justify-between sm:justify-start space-x-2 w-full">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 transition"
                            >
                                Previous
                            </button>

                            <div className="flex space-x-1">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                                    (pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${pageNum === pagination.page
                                                ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                                                } transition`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {/* Confirm Booking Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Confirm Booking
                            </h3>
                        </div>
                        <p className="text-neutral-400 mb-6">
                            Are you sure you want to confirm this booking? This will update the booking status to confirmed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                                        Confirming...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                                        Confirm Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faBan} className="w-6 h-6 text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Cancel Booking
                            </h3>
                        </div>
                        <p className="text-neutral-400 mb-4">
                            Please provide a reason for cancellation:
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            rows="3"
                        />
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={!cancelReason.trim() || actionLoading}
                                className="flex items-center px-4 py-2 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faBan} className="w-4 h-4 mr-2" />
                                        Confirm Cancellation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Delete Booking
                            </h3>
                        </div>
                        <p className="text-neutral-400 mb-6">
                            Are you sure you want to delete this booking? This action cannot be undone and all booking data will be permanently removed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
                                        Delete Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingsList;