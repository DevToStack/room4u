'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faFilter,
    faEdit,
    faBan,
    faEnvelope,
    faReceipt,
    faCreditCard,
    faTrash,
    faCalendar,
    faRupeeSign,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import FilterPills from './FilterPills';
import Card from './Card';
import BookingUpdateModal from './EditBooking';
import { loadRazorpay, createRazorpayOrder } from '@/utils/razorpay' // Adjust path as needed

const DEFAULT_DATA = { bookings: [] };

const getSafeData = (data) => {
    if (!data || typeof data !== 'object') return DEFAULT_DATA;
    return { bookings: Array.isArray(data.bookings) ? data.bookings : [] };
};

export default function Bookings() {
    const [bookingsData, setBookingsData] = useState(DEFAULT_DATA);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ For resend button
    const [resendingId, setResendingId] = useState(null);
    const [resendMessage, setResendMessage] = useState("");

    // ✅ For payment processing
    const [processingPayment, setProcessingPayment] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState("");

    // ✅ For date range filter
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ✅ Initialize Razorpay
    useEffect(() => {
        loadRazorpay();
    }, []);

    // ✅ Cancel booking handler
    const handleCancelBooking = async (booking) => {
        if (!confirm(`Are you sure you want to cancel booking #${booking.id}?`)) {
            return;
        }

        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    booking_id: booking.id // Make sure this field exists in your booking data
                }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                // Show success message
                setPaymentMessage(`✅ Booking #${booking.id} cancelled successfully`);
                // Refresh bookings to update status
                await fetchBookings();
            } else {
                setPaymentMessage(`❌ Failed to cancel booking: ${result.error}`);
            }
        } catch (error) {
            setPaymentMessage('❌ Failed to cancel booking. Please try again.');
        } finally {
            // Auto-hide message after 1 seconds
            setTimeout(() => setPaymentMessage(""), 1000);
        }
    };

    // ✅ Razorpay payment handler
    const handlePayment = async (booking) => {
        setProcessingPayment(booking.id);
        setPaymentMessage("");

        try {
            // Create order
            const order = await createRazorpayOrder(booking.id);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Rooms4U",
                description: `Payment for Booking #${booking.id}`,
                order_id: order.order_id,
                handler: async function (response) {
                    // Verify payment on server
                    const verifyResponse = await fetch('/api/payments/verify-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: booking.id,
                            amount: order.amount,
                            method: 'razorpay' // You can get this from response if available
                        }),
                    });

                    const result = await verifyResponse.json();

                    if (result.success) {
                        setPaymentMessage(`✅ Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                        // Refresh bookings to update status
                        await fetchBookings();
                    } else {
                        setPaymentMessage(`❌ Payment verification failed: ${result.error}`);
                    }
                },
                prefill: {
                    name: booking.guestName,
                    email: booking.guestEmail,
                    contact: booking.guestPhone || '' // Add phone if available
                },
                notes: {
                    bookingId: booking.id.toString(),
                    apartment: booking.apartment
                },
                theme: {
                    color: '#10b981' // Teal color to match your theme
                }
            };

            const razorpayInstance = new window.Razorpay(options);

            razorpayInstance.on('payment.failed', function (response) {
                setPaymentMessage(`❌ Payment failed: ${response.error.description}`);
            });

            razorpayInstance.open();

        } catch (error) {
            console.error('Payment initiation error:', error);
            setPaymentMessage('❌ Failed to initiate payment. Please try again.');
        } finally {
            setProcessingPayment(null);
            // Auto-hide message after 5 seconds
            setTimeout(() => setPaymentMessage(""), 5000);
        }
    };

    // ✅ Function to trigger the resend email API
    const handleResendEmail = async (booking) => {
        setResendingId(booking.id);
        setResendMessage("");

        try {
            const res = await fetch("/api/notify/to-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    customerName: booking.guestName,
                    customerEmail: booking.guestEmail,
                    apartmentName: booking.apartment,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    totalPrice: booking.total,
                }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setResendMessage(`✅ Email resent successfully for Booking #${booking.id}`);
            } else {
                setResendMessage(`⚠️ ${result.error || "Could not resend email"}`);
            }
        } catch (error) {
            console.error("Error resending email:", error);
            setResendMessage("❌ Failed to resend email. Try again later.");
        } finally {
            setResendingId(null);
            setTimeout(() => setResendMessage(""), 5000);
        }
    };

    // ✅ Fetch bookings securely
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dashboard/bookings', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                console.error('Failed to fetch bookings:', res.status);
                return;
            }

            const json = await res.json();
            setBookingsData(getSafeData(json));
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateSuccess = async () => {
        await fetchBookings();
    };

    // ✅ Date range filter functions
    const handleDateRangeApply = () => {
        setShowDatePicker(false);
    };

    const handleDateRangeClear = () => {
        setDateRange({ startDate: '', endDate: '' });
        setShowDatePicker(false);
    };

    const isDateInRange = (dateString, startDate, endDate) => {
        if (!startDate && !endDate) return true;

        const date = new Date(dateString);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
            return date >= start && date <= end;
        } else if (start) {
            return date >= start;
        } else if (end) {
            return date <= end;
        }
        return true;
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'expired', label: 'Expired' },
    ];

    const filteredBookings = bookingsData.bookings.filter((b) => {
        if (!b || typeof b !== 'object') return false;

        // Filter by status
        const matchesFilter = filter === 'all' || b.status === filter;

        // Filter by search term
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            !searchLower ||
            (b.apartment && b.apartment.toLowerCase().includes(searchLower)) ||
            (b.guestName && b.guestName.toLowerCase().includes(searchLower));

        // Filter by date range
        const matchesDateRange =
            isDateInRange(b.checkIn, dateRange.startDate, dateRange.endDate) ||
            isDateInRange(b.checkOut, dateRange.startDate, dateRange.endDate);

        return matchesFilter && matchesSearch && matchesDateRange;
    });

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            expired: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // ✅ Helper function to determine which buttons to show based on booking status
    const getActionButtons = (booking) => {
        const { status, paymentStatus } = booking;

        const buttons = [
            // Edit button - subtle blue accent
            {
                key: 'edit',
                icon: faEdit,
                label: 'Edit',
                onClick: () => {
                    setSelectedBooking(booking);
                    setModalOpen(true);
                },
                className:
                    "flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-gray-300 hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-400 transition-all duration-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-blue-500/10 active:scale-[0.97]",
                show: status === 'pending',
            },

            // Cancel button - amber warning tone
            {
                key: 'cancel',
                icon: faBan,
                label: 'Cancel',
                onClick: () => { handleCancelBooking(booking); },
                className:
                    "flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-gray-300 hover:bg-rose-600/20 hover:border-rose-500 hover:text-rose-400 transition-all duration-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-rose-500/10 active:scale-[0.97]",
                show: status !== 'cancelled' && status !== 'expired',
            },

            // Resend button - teal accent
            {
                key: 'resend',
                icon: faEnvelope,
                label: resendingId === booking.id ? 'Sending...' : 'Resend',
                onClick: () => handleResendEmail(booking),
                disabled: resendingId === booking.id,
                className:
                    resendingId === booking.id
                        ? "flex items-center gap-2 bg-teal-900/50 border border-teal-700/40 text-gray-500 cursor-not-allowed px-4 py-2 rounded-lg shadow-sm"
                        : "flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-gray-300 hover:bg-teal-600/20 hover:border-teal-500 hover:text-teal-400 transition-all duration-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-teal-500/10 active:scale-[0.97]",
                show: status === 'pending',
            },

            // Pay button - strong green action button
            {
                key: 'pay',
                icon: faCreditCard,
                label: processingPayment === booking.id ? 'Processing...' : 'Pay',
                onClick: () => handlePayment(booking),
                disabled: processingPayment === booking.id,
                className:
                    processingPayment === booking.id
                        ? "flex items-center gap-2 bg-green-800/50 border border-green-700/40 text-gray-500 cursor-not-allowed px-4 py-2 rounded-lg shadow-sm"
                        : "flex items-center gap-2 bg-green-700 border border-green-600 text-white hover:bg-green-600 hover:border-green-500 transition-all duration-300 px-4 py-2 rounded-lg shadow-lg hover:shadow-green-500/20 active:scale-[0.97]",
                show: status === 'confirmed' && paymentStatus !== 'paid',
            },

            // Delete button - red danger button
            {
                key: 'delete',
                icon: faTrash,
                label: 'Delete',
                onClick: () => { },
                className:
                    "flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-gray-300 hover:bg-red-600/20 hover:border-red-500 hover:text-red-400 transition-all duration-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-red-500/10 active:scale-[0.97]",
                show: status === 'expired',
            },
        ];

        return buttons.filter(button => button.show);
    };

    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-neutral-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <h1 className="text-2xl font-bold text-gray-100 mb-4 lg:mb-0 hover:translate-x-1 transition-transform duration-300">
                    Bookings
                </h1>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative group">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-teal-400 transition-colors duration-300"
                        />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-64 bg-neutral-800 text-gray-200 placeholder-gray-400 transition-all duration-300 hover:border-gray-600 hover:bg-neutral-750"
                        />
                    </div>

                    {/* Date Range Filter */}
                    <div className="relative">
                        <button
                            className="flex items-center justify-center px-4 py-2 border border-gray-700 rounded-2xl hover:bg-neutral-800 text-gray-200 transition-all duration-300 hover:border-gray-600 hover:scale-105 active:scale-95 group"
                            type="button"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <FontAwesomeIcon
                                icon={faFilter}
                                className="text-gray-400 mr-2 group-hover:text-teal-400 transition-colors duration-300"
                            />
                            Date Range
                            {(dateRange.startDate || dateRange.endDate) && (
                                <span className="ml-2 w-2 h-2 bg-teal-500 rounded-full"></span>
                            )}
                        </button>

                        {/* Date Range Picker Dropdown */}
                        {showDatePicker && (
                            <div className="absolute top-full right-0 mt-2 bg-neutral-800 border border-gray-700 rounded-2xl p-4 shadow-2xl z-50 min-w-80 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-200 font-semibold">Filter by Date Range</h3>
                                    <button
                                        onClick={() => setShowDatePicker(false)}
                                        className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.startDate}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-xl bg-neutral-700 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.endDate}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-xl bg-neutral-700 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                                    <button
                                        onClick={handleDateRangeClear}
                                        className="flex-1 px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:bg-neutral-700 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleDateRangeApply}
                                        className="flex-1 px-4 py-2 text-sm bg-teal-600 text-white hover:bg-teal-500 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                                    >
                                        Apply
                                    </button>
                                </div>

                                {/* Active Filter Indicator */}
                                {(dateRange.startDate || dateRange.endDate) && (
                                    <div className="mt-3 p-2 bg-teal-900/20 border border-teal-700/30 rounded-lg">
                                        <p className="text-xs text-teal-400 text-center">
                                            {dateRange.startDate && dateRange.endDate
                                                ? `Showing bookings between ${dateRange.startDate} and ${dateRange.endDate}`
                                                : dateRange.startDate
                                                    ? `Showing bookings from ${dateRange.startDate} onwards`
                                                    : `Showing bookings until ${dateRange.endDate}`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FilterPills filters={filters} activeFilter={filter} onFilterChange={setFilter} />

            {/* Active Date Range Filter Pill */}
            {(dateRange.startDate || dateRange.endDate) && (
                <div className="flex items-center gap-2 bg-teal-900/20 border border-teal-700/30 rounded-full px-4 py-2 w-fit">
                    <span className="text-teal-400 text-sm">
                        {dateRange.startDate && dateRange.endDate
                            ? `${dateRange.startDate} to ${dateRange.endDate}`
                            : dateRange.startDate
                                ? `From ${dateRange.startDate}`
                                : `Until ${dateRange.endDate}`
                        }
                    </span>
                    <button
                        onClick={handleDateRangeClear}
                        className="text-teal-400 hover:text-teal-300 transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                </div>
            )}

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <Card className="p-8 text-center bg-neutral-800/50 border-neutral-700/50 backdrop-blur-sm rounded-xl hover:shadow-2xl hover:shadow-black/20 transition-all duration-500 ease-out animate-fade-in">
                    <div className="max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-500 ease-out group hover:from-neutral-600 hover:to-neutral-700 animate-soft-float">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="text-gray-400 text-3xl group-hover:text-teal-400 transition-colors duration-500 ease-out"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-white transition-colors duration-500">
                            No bookings found
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
                            {dateRange.startDate || dateRange.endDate
                                ? "Try adjusting your date range or search criteria."
                                : "Try adjusting your search criteria or filters to find what you're looking for."
                            }
                        </p>
                        {(dateRange.startDate || dateRange.endDate) && (
                            <button
                                onClick={handleDateRangeClear}
                                className="mt-4 px-4 py-2 text-teal-400 hover:text-teal-300 text-sm transition-colors duration-300"
                            >
                                Clear date filter
                            </button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBookings.map((booking, index) => {
                        const actionButtons = getActionButtons(booking);

                        return (
                            <Card
                                key={booking.id}
                                className="group bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 hover:border-neutral-600/50 hover:bg-neutral-800/70 hover:shadow-xl hover:shadow-black/10 backdrop-blur-sm transition-all duration-500 ease-out animate-fade-in-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-teal-400 font-bold text-lg truncate mb-1 group-hover:text-teal-300 transition-colors duration-500">
                                            {booking.apartment}
                                        </h3>
                                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-500">
                                            Booking #{booking.id}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-500 hover:scale-105 ${getStatusColor(
                                            booking.status
                                        )}`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>

                                {/* Guest Info */}
                                <div className="flex items-center gap-3 mb-2 p-3 bg-neutral-700/30 rounded-lg group-hover:bg-neutral-700/50 transition-all duration-500 hover:scale-[1.02]">
                                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-black font-semibold text-sm transition-all duration-500 group-hover:bg-teal-400 group-hover:scale-110">
                                        {booking.guestName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 font-medium text-sm truncate group-hover:text-white transition-colors duration-500">
                                            {booking.guestName}
                                        </p>
                                        <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors duration-500">
                                            {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="mb-6 bg-neutral-700/20 rounded-lg group-hover:bg-neutral-700/30 transition-colors duration-500">
                                    {[
                                        { label: 'Check-in', value: booking.checkIn, color: 'emerald', icon: faCalendar },
                                        { label: 'Check-out', value: booking.checkOut, color: 'rose', icon: faCalendar },
                                        { label: 'Total', value: `₹${booking.total}`, color: 'amber', icon: faRupeeSign }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-neutral-600/20 rounded-lg transition-all duration-300 hover:translate-x-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 bg-${item.color}-500/10 rounded-lg flex items-center justify-center group-hover:bg-${item.color}-500/20 transition-all duration-500 hover:scale-110`}>
                                                    <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                                                </div>
                                                <span className="text-gray-400 text-sm">{item.label}</span>
                                            </div>
                                            <span className={`text-${item.label === 'Total' ? 'lg' : 'sm'} text-gray-200 font-medium`}>
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    {actionButtons.map((button) => (
                                        <button
                                            key={button.key}
                                            className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 font-medium backdrop-blur-sm ${button.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700/50 active:bg-neutral-700/70 hover:scale-105'} ${button.className}`}
                                            onClick={button.onClick}
                                            disabled={button.disabled}
                                        >
                                            <FontAwesomeIcon
                                                icon={button.icon}
                                                className={`mr-2 transition-colors duration-500 ${button.disabled ? 'opacity-60' : 'text-gray-200'}`}
                                            />
                                            {button.label}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Messages */}
            {resendMessage && (
                <div className="fixed bottom-4 right-4 text-center mt-4 p-3 bg-neutral-800 border border-teal-700 rounded-xl text-teal-300 text-sm font-medium shadow hover:scale-105 hover:shadow-lg transition-all duration-300">
                    {resendMessage}
                </div>
            )}

            {paymentMessage && (
                <div className={`fixed bottom-4 right-4 text-center mt-4 p-3 bg-neutral-800 border rounded-xl text-sm font-medium shadow hover:scale-105 hover:shadow-lg transition-all duration-300 ${paymentMessage.includes('✅')
                    ? 'border-green-700 text-green-300'
                    : 'border-red-700 text-red-300'
                    }`}>
                    {paymentMessage}
                </div>
            )}

            {/* Modal */}
            {selectedBooking && (
                <BookingUpdateModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}