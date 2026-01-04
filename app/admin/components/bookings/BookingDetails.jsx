import { useState } from 'react';
import { Calendar, User, Home, CreditCard, Users, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faList, faListUl } from '@fortawesome/free-solid-svg-icons';

const BookingDetails = ({ booking, onStatusUpdate, onDeleteBooking, onBack }) => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    // Parse guest details safely
    const guestDetails = booking?.guest_details && typeof booking.guest_details === 'string'
        ? JSON.parse(booking.guest_details)
        : booking?.guest_details || [];

    // Get timeline status
    const getTimelineStatus = () => {
        const today = new Date();
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);

        if (booking.status === 'cancelled') return { label: 'Cancelled', color: 'bg-red-500' };
        if (booking.status === 'expired') return { label: 'Expired', color: 'bg-gray-500' };

        if (today < startDate) return { label: 'Upcoming', color: 'bg-blue-500' };
        if (today >= startDate && today <= endDate) return { label: 'Ongoing', color: 'bg-green-500' };
        if (today > endDate) return { label: 'Completed', color: 'bg-purple-500' };

        return { label: booking.status, color: 'bg-yellow-500' };
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
            expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            ongoing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };

        return (
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[status] || 'bg-gray-500/20'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const paymentColors = {
            success: 'bg-green-500/20 text-green-400 border-green-500/30',
            failed: 'bg-red-500/20 text-red-400 border-red-500/30',
            refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };

        return (
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${paymentColors[paymentStatus] || 'bg-gray-500/20'}`}>
                {paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : 'Pending'}
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDocLabel = (key) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };
    
    const calculateStayDuration = () => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return nights;
    };

    const timelineStatus = getTimelineStatus();

    return (
        <div className="bg-neutral-900 text-neutral-200 rounded-xl shadow-lg border border-neutral-800 overflow-y-auto max-h-[700px]">
            {/* Header with Timeline Status */}
            <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-800">
                <div className="px-6 py-8 pt-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            Booking #{booking.id}
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${timelineStatus.color}/20 text-${timelineStatus.color.replace('bg-', '')} border border-${timelineStatus.color.replace('bg-', '')}/30`}>
                                {timelineStatus.label}
                            </div>
                            <div className="text-neutral-400 text-sm flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(booking.created_at).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-800/50 flex justify-between items-center">
                <div className='flex'>
                    <button
                        onClick={() => onBack()}
                        className="px-6 py-3 bg-neutral-900/40 hover:bg-neutral-800/60 text-neutral-200 hover:text-white rounded-xl transition-all duration-300 font-semibold flex items-center gap-3 border border-neutral-600/30 hover:border-neutral-400/50 shadow-lg hover:shadow-neutral-900/40 backdrop-blur-md group"
                    >
                        <FontAwesomeIcon
                            icon={faListUl}
                            className="text-neutral-300/80 group-hover:text-neutral-100 transition-all duration-300 group-hover:scale-105"
                        />
                        Back to List
                    </button>
                </div>

                <div className="flex gap-2 justify-end">
                    {booking.status !== 'cancelled' && booking.status !== 'expired' && (
                        <button
                            onClick={() => openStatusModal('cancelled')}
                            className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition font-medium flex items-center gap-2"
                        >
                            ✗ Cancel Booking
                        </button>
                    )}
                    <button
                        onClick={() => onDeleteBooking(booking.id)}
                        className="px-4 py-2 bg-neutral-800 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition font-medium flex items-center gap-2 border border-red-900/30"
                    >
                        🗑️ Delete Booking
                    </button>

                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Booking & Timeline */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Booking Summary Card */}
                        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Calendar size={20} />
                                Booking Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-400">Booking Status:</span>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Check-in:</span>
                                        <span className="font-medium text-white">
                                            {new Date(booking.start_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Check-out:</span>
                                        <span className="font-medium text-white">
                                            {new Date(booking.end_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Total Nights:</span>
                                        <span className="font-semibold text-white">{calculateStayDuration()} nights</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Total Guests:</span>
                                        <span className="font-medium text-white">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Booking ID:</span>
                                        <span className="font-mono text-white">#{booking.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Apartment Details Card */}
                        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Home size={20} />
                                Apartment Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-white">{booking.apartment_title}</h4>
                                        <p className="text-sm text-neutral-400 mt-1">{booking.apartment_description?.substring(0, 100)}...</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{formatCurrency(booking.price_per_night)}</div>
                                        <div className="text-sm text-neutral-400">per night</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-neutral-500" />
                                        <span className="text-neutral-400">Location:</span>
                                        <span className="ml-auto text-white">{booking.apartment_city}, {booking.apartment_state}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-neutral-500" />
                                        <span className="text-neutral-400">Max Guests:</span>
                                        <span className="ml-auto text-white">{booking.max_guests || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-neutral-400">Address:</span>
                                        <span className="ml-auto text-white text-right">{booking.apartment_address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-neutral-400">Zip Code:</span>
                                        <span className="ml-auto text-white">{booking.apartment_zip || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Document Details */}
                        {booking.document?.data && (
                            <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-indigo-400">
                                    <FontAwesomeIcon icon={faAddressCard} />
                                    Document Details ({booking.document.type.toUpperCase()})
                                </h3>

                                {/* Status */}
                                <div className="mb-4 text-sm">
                                    <span className="text-gray-400">Status: </span>
                                    <span
                                        className={`font-semibold ${booking.document.status === "approved"
                                            ? "text-green-400"
                                            : booking.document.status === "rejected"
                                                ? "text-red-400"
                                                : "text-yellow-400"
                                            }`}
                                    >
                                        {booking.document.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Document Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                                    {Object.entries(booking.document.data).map(([key, value]) => {
                                        if (key.includes("image")) return null;

                                        return (
                                            <div
                                                key={key}
                                                className="p-3 bg-neutral-900/50 border border-neutral-700 rounded-xl"
                                            >
                                                <p className="text-xs text-gray-400">{formatDocLabel(key)}</p>
                                                <p className="text-sm break-all">{value}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Images */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                                    {booking.document.data.front_image_url && (
                                        <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-3">
                                            <p className="text-xs text-gray-400 mb-2">Front Image</p>
                                            <img
                                                src={booking.document.data.front_image_url}
                                                alt="Document Front"
                                                className="rounded-lg w-full object-cover max-h-48"
                                            />
                                        </div>
                                    )}

                                    {booking.document.data.back_image_url && (
                                        <div className="bg-neutral-900/40 border border-neutral-700 rounded-xl p-3">
                                            <p className="text-xs text-gray-400 mb-2">Back Image</p>
                                            <img
                                                src={booking.document.data.back_image_url}
                                                alt="Document Back"
                                                className="rounded-lg w-full object-cover max-h-48"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Reviewer Message */}
                                {booking.document.reviewMessage && (
                                    <div className="mt-4 p-3 bg-neutral-900/60 border border-neutral-700 rounded-xl text-sm text-gray-300">
                                        <p className="text-xs text-gray-400 mb-1">Reviewer Note</p>
                                        {booking.document.reviewMessage}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - User & Payment Info */}
                    <div className="space-y-8">
                        {/* User Information Card */}
                        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <User size={20} />
                                User Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <User size={24} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{booking.user_name}</h4>
                                        <p className="text-sm text-neutral-400">User ID: #{booking.user_id}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-neutral-500" />
                                        <span className="text-neutral-400">Email:</span>
                                        <span className="ml-auto text-white text-sm">{booking.user_email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-neutral-500" />
                                        <span className="text-neutral-400">Phone:</span>
                                        <span className="ml-auto text-white text-sm">{booking.user_phone || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Guest Details Card */}
                        {guestDetails.length > 0 && (
                            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Users size={20} />
                                    Guest Details
                                </h3>
                                <div className="space-y-4">
                                    {guestDetails.map((guest, index) => (
                                        <div key={index} className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                        <User size={18} className="text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-white">{guest.name}</h4>
                                                        <p className="text-sm text-neutral-400">Guest {index + 1}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${guest.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                                                    {guest.gender?.charAt(0).toUpperCase() + guest.gender?.slice(1)}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-neutral-400">Age:</span>
                                                    <span className="ml-2 text-white">{guest.age} years</span>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-400">Phone:</span>
                                                    <span className="ml-2 text-white">{guest.phone}</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-neutral-700">
                                                <div className="text-xs text-neutral-400">
                                                    <span className={`inline-block px-2 py-1 rounded ${guest.age >= 18 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {guest.age >= 18 ? 'Adult' : 'Minor'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Payment Information Card */}
                        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <CreditCard size={20} />
                                Payment Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-400">Payment Status:</span>
                                    {getPaymentBadge(booking.payment_status)}
                                </div>
                                <div className="pt-4 border-t border-neutral-700">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Price per night:</span>
                                            <span>{formatCurrency(booking.price_per_night)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">× {calculateStayDuration()} nights:</span>
                                            <span>{formatCurrency(booking.price_per_night * calculateStayDuration())}</span>
                                        </div>
                                        {booking.guests > 1 && (
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400">× {booking.guests} guests:</span>
                                                <span>{formatCurrency(booking.price_per_night * calculateStayDuration() * booking.guests)}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-neutral-700">
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span className="text-white">Total Amount:</span>
                                                <span className="text-white">{formatCurrency(booking.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {booking.payment_method && (
                                    <div className="pt-4 border-t border-neutral-700">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400">Payment Method:</span>
                                                <span className="text-white capitalize">{booking.payment_method}</span>
                                            </div>
                                            {booking.paid_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-400">Paid at:</span>
                                                    <span className="text-white">
                                                        {new Date(booking.paid_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {booking.razorpay_payment_id && (
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-400">Payment ID:</span>
                                                    <span className="text-white font-mono text-xs">{booking.razorpay_payment_id}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{booking.guests}</div>
                                    <div className="text-xs text-neutral-400 mt-1">Guests</div>
                                </div>
                                <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{calculateStayDuration()}</div>
                                    <div className="text-xs text-neutral-400 mt-1">Nights</div>
                                </div>
                                <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">
                                        {guestDetails.filter(g => g.age >= 18).length}
                                    </div>
                                    <div className="text-xs text-neutral-400 mt-1">Adults</div>
                                </div>
                                <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">
                                        {guestDetails.filter(g => g.age < 18).length}
                                    </div>
                                    <div className="text-xs text-neutral-400 mt-1">Minors</div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Update Booking Status
                        </h3>
                        <p className="text-neutral-400 text-sm mb-6">
                            Changing status to: <span className="font-medium text-white capitalize">{selectedStatus}</span>
                        </p>

                        {selectedStatus === 'cancelled' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-neutral-400 mb-2">
                                    Cancellation Reason (optional):
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter reason for cancellation..."
                                />
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                className={`px-4 py-2 text-white rounded-lg transition font-medium ${selectedStatus === 'cancelled'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BookingDetails;