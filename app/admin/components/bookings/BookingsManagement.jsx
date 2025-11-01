'use client';

import { useState, useEffect } from 'react';
import BookingsList from './BookingsList';
import BookingDetails from './BookingDetails';
import BookingsStats from './BookingsStats';
import BookingFilters from './BookingFilters';
import Toast from '@/components/toast';
import { set } from 'zod';

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openFilters, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        search: '',
        start_date: '',
        end_date: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });
    const [view, setView] = useState('list'); // 'list', 'details', 'stats'
    const handleOpenFilters = () => {
        setFiltersOpen(!openFilters);
    }
    // Fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`/api/admin/bookings?${queryParams}`);
            const result = await response.json();

            if (result.success) {
                setBookings(result.data);
                setPagination(result.pagination);
            } else {
                setError(result.message || 'Failed to fetch bookings');
            }
        } catch (err) {
            setError('Error fetching bookings');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setView('details');
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedBooking(null);
        fetchBookings();
    };

    const handleStatusUpdate = async (bookingId, newStatus, adminNotes = '') => {
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, admin_notes: adminNotes }),
            });
            const result = await response.json();

            if (result.success) {
                setSuccess(`Booking ${newStatus} successfully!`);
                if (view === 'details' && selectedBooking?.id === bookingId) {
                    setSelectedBooking(result.data);
                }
                fetchBookings();
            } else {
                setError(result.message || 'Failed to update booking status');
            }
        } catch (err) {
            setError('Error updating booking status');
            console.error('Error:', err);
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.success) {
                setSuccess('Booking deleted successfully!');
                fetchBookings();
                if (view === 'details' && selectedBooking?.id === bookingId) handleBackToList();
            } else {
                setError(result.message || 'Failed to delete booking');
            }
        } catch (err) {
            setError('Error deleting booking');
            console.error('Error:', err);
        }
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
        <div className="h-full p-4 sm:p-6 max-sm:pb-16 bg-neutral-900 text-neutral-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg transition ${view === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-neutral-200 hover:bg-gray-600'
                            }`}
                    >
                        All Bookings
                    </button>
                    <button
                        onClick={() => setView('stats')}
                        className={`px-4 py-2 rounded-lg transition ${view === 'stats'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-neutral-200 hover:bg-gray-600'
                            }`}
                    >
                        Statistics
                    </button>
                    {view === 'list' && (
                        <button
                            onClick={() => handleOpenFilters()}
                            className={`px-4 py-2 rounded-lg transition ${openFilters
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-neutral-200 hover:bg-gray-600'
                                }`}
                        >
                            Filters
                        </button>
                    )}
                    
                </div>
            </div>

            {error && <Toast message={error} onClose={() => setError('')} />}
            {success && <Toast message={success} type='success' onClose={() => setSuccess('')} />}
            {view === 'stats' && <BookingsStats onBack={() => setView('list')} />}

            {view === 'list' && (
                <>
                    {
                        openFilters && (<BookingFilters filters={filters} onFilterChange={handleFilterChange} />
                    )}
                    
                    <BookingsList
                        bookings={bookings}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onViewBooking={handleViewBooking}
                        onStatusUpdate={handleStatusUpdate}
                        onDeleteBooking={handleDeleteBooking}
                    />
                </>
            )}

            {view === 'details' && selectedBooking && (
                <BookingDetails
                    booking={selectedBooking}
                    onBack={handleBackToList}
                    onStatusUpdate={handleStatusUpdate}
                    onDeleteBooking={handleDeleteBooking}
                />
            )}
        </div>
    );
};

export default BookingsManagement;
