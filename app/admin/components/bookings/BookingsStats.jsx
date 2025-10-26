import { useState, useEffect } from 'react';

const BookingsStats = ({ onBack }) => {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Tailwind-safe color mapping
    const colorClasses = {
        blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
        green: { bg: 'bg-green-500/20', text: 'text-green-400' },
        yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
        red: { bg: 'bg-red-500/20', text: 'text-red-400' },
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/bookings-stats');
            const result = await response.json();

            if (result.success) {
                setStats(result.data.overview);
                setRecentBookings(result.data.recentBookings);
            } else {
                setError(result.message || 'Failed to fetch statistics');
            }
        } catch (err) {
            setError('Error fetching statistics');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badgeColors = {
            confirmed: 'bg-green-500/20 text-green-400',
            pending: 'bg-yellow-500/20 text-yellow-400',
            cancelled: 'bg-red-500/20 text-red-400',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[status] || 'bg-gray-500/20 text-gray-400'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-800 border border-red-600 text-red-400 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-200">Booking Statistics</h2>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-700 text-neutral-200 rounded-md hover:bg-gray-600 transition"
                >
                    Back to List
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Bookings', value: stats.total_bookings, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2', color: 'blue' },
                    { label: 'Confirmed', value: stats.confirmed_bookings, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
                    { label: 'Pending', value: stats.pending_bookings, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'yellow' },
                    { label: 'Cancelled', value: stats.cancelled_bookings, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'red' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-neutral-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${colorClasses[stat.color].bg}`}>
                                <svg
                                    className={`w-6 h-6 ${colorClasses[stat.color].text}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
                                <p className="text-2xl font-semibold text-neutral-200">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${stats.total_revenue || '0'}` },
                    { label: 'Unique Customers', value: stats.unique_customers },
                    { label: 'Expired Bookings', value: stats.expired_bookings },
                ].map((stat) => (
                    <div key={stat.label} className="bg-neutral-800 p-6 rounded-lg shadow">
                        <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
                        <p className="text-2xl font-semibold text-neutral-200">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-neutral-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-200">Recent Bookings</h3>
                </div>
                <div className="p-6">
                    {recentBookings.length === 0 ? (
                        <p className="text-neutral-400 text-center py-4">No recent bookings</p>
                    ) : (
                        <div className="space-y-4">
                                {recentBookings.map((booking, index) => (
                                    <div
                                        key={`${booking.id}-${index}`} // ensures uniqueness
                                        className="flex items-center justify-between p-4 border border-neutral-700 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-neutral-200">
                                                #{booking.id} - {booking.user_name}
                                            </p>
                                            <p className="text-sm text-neutral-400">{booking.apartment_title}</p>
                                            <p className="text-sm text-neutral-500">
                                                {new Date(booking.start_date).toLocaleDateString()} -{' '}
                                                {new Date(booking.end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(booking.status)}
                                            <p className="text-sm text-neutral-400 mt-1">
                                                {booking.payment_status ? `Payment: ${booking.payment_status}` : 'No payment'}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingsStats;
