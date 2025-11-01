import { useState } from 'react';

const BookingDetails = ({ booking, onBack, onStatusUpdate, onDeleteBooking }) => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-500/20 text-yellow-400',
            confirmed: 'bg-green-500/20 text-green-400',
            cancelled: 'bg-red-500/20 text-red-400',
            expired: 'bg-gray-500/20 text-gray-400',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const paymentColors = {
            paid: 'bg-green-500/20 text-green-400',
            failed: 'bg-red-500/20 text-red-400',
            refunded: 'bg-blue-500/20 text-blue-400',
            cancelled: 'bg-gray-500/20 text-gray-400',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentColors[paymentStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                {paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : 'N/A'}
            </span>
        );
    };

    const handleStatusUpdate = async () => {
        await onStatusUpdate(booking.id, selectedStatus, adminNotes);
        setShowStatusModal(false);
        setSelectedStatus('');
        setAdminNotes('');
    };

    const openStatusModal = (status) => {
        setSelectedStatus(status);
        setShowStatusModal(true);
    };

    return (
        <div className="bg-neutral-900 text-neutral-200 rounded-xl shadow-lg border border-neutral-800">
            {/* Header */}
            <button
                onClick={onBack}
                className="text-neutral-200 hover:text-white transition rounded-lg p-2 bg-neutral-800 mt-1 ml-1"
            >
                Back to List
            </button>
            <div className="px-6 py-4 border-b border-neutral-800 flex flex-col min-sm:flex-row items-center justify-between space-y-4 min-sm:space-y-0">
                
                <h2 className="text-xl max-sm:text-sm sm:font-semibold text-white">
                    Booking #{booking.id}
                </h2>
                <div className="flex space-x-2">
                    
                    {booking.status === 'pending' && (
                        <button
                            onClick={() => openStatusModal('confirmed')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                            Confirm
                        </button>
                    )}
                    {booking.status !== 'cancelled' && (
                        <button
                            onClick={() => openStatusModal('cancelled')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => onDeleteBooking(booking.id)}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Booking Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Booking Info</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Status:</span>
                                {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Created:</span>
                                <span>{new Date(booking.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Check-in:</span>
                                <span>{new Date(booking.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Check-out:</span>
                                <span>{new Date(booking.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Total Nights:</span>
                                <span>{booking.total_nights}</span>
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">User Info</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Name:</span>
                                <span>{booking.user_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Email:</span>
                                <span>{booking.user_email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Phone:</span>
                                <span>{booking.user_phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Apartment Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Apartment Info</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Title:</span>
                                <span>{booking.apartment_title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Price per night:</span>
                                <span>₹{booking.price_per_night}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Location:</span>
                                <span>{booking.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Payment Info</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Payment Status:</span>
                                {getPaymentBadge(booking.payment_status)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Total Amount:</span>
                                <span className="font-semibold text-white">₹{booking.total_amount || '0'}</span>
                            </div>
                            {booking.paid_amount && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Paid Amount:</span>
                                    <span>₹{booking.paid_amount}</span>
                                </div>
                            )}
                            {booking.payment_method && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Method:</span>
                                    <span className="capitalize">{booking.payment_method}</span>
                                </div>
                            )}
                            {booking.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Paid at:</span>
                                    <span>{new Date(booking.paid_at).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Update Booking → {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                        </h3>

                        {selectedStatus === 'cancelled' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-neutral-400 mb-2">
                                    Cancellation Reason (optional):
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter reason..."
                                />
                            </div>
                        )}

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetails;
