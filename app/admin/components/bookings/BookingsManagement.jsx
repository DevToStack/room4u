'use client';

import { useState, useEffect } from 'react';
import BookingsList, { TableSkeleton } from './BookingsList';
import BookingDetails from './BookingDetails';
import BookingsStats from './BookingsStats';
import Toast from '@/components/toast';
import BookingSearchBar, { BookingFiltersSkeleton } from './BookingFilters';

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openFilters, setFiltersOpen] = useState(false);
    // Track if it's initial load or search/filter
    const [isInitialLoad, setIsInitialLoad] = useState(true);

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

    const handleOpenFilters = () => setFiltersOpen(!openFilters);

    // 🔵 Fetch bookings normally only on filter / page change
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
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
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
    };

    // 🔥 FIXED: Update without full reload
    const handleStatusUpdate = async (bookingId, newStatus, adminNotes = '') => {
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, admin_notes: adminNotes }),
            });

            const result = await response.json();

            if (!result.success) {
                return setError(result.message || 'Failed to update booking status');
            }

            const updated = result.data;

            setSuccess(`Booking ${newStatus} successfully!`);

            // 🔵 Update only the modified booking in the list
            setBookings(prev =>
                prev.map(b => (b.id === bookingId ? { ...b, ...updated } : b))
            );

            // 🔵 If in details view, update selectedBooking too
            if (view === 'details' && selectedBooking?.id === bookingId) {
                setSelectedBooking(updated);
            }

        } catch (err) {
            setError('Error updating booking status');
        }
    };

    // 🔥 FIXED: Delete without full reload
    const handleDeleteBooking = async (bookingId) => {
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const result = await response.json();

            if (!result.success) {
                return setError(result.error || 'Failed to delete booking');
            }
            fetchBookings();
            setSuccess('Booking deleted successfully!');

            // 🔵 Remove only the deleted booking
            setBookings(prev => prev.filter(b => b.id !== bookingId));

            // If deleted from details view → go back
            if (view === 'details' && selectedBooking?.id === bookingId) {
                handleBackToList();
            }

        } catch (err) {
            setError('Error deleting booking');
        }
    };

    // Loading state
    if (loading && isInitialLoad) {
        return (
            <div className='p-6'>
                <BookingFiltersSkeleton />
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="h-full min-h-screen p-4 sm:p-6 max-sm:pb-16 bg-gradient-to-r from-neutral-900 to-neutral-950 text-neutral-200">

            {error && <Toast message={error} onClose={() => setError('')} />}
            {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}
            {view === 'list' && (
                <>
                    <BookingSearchBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <BookingsList
                        bookings={bookings}
                        loading={loading} // Pass false since we're handling skeleton above
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
                    onStatusUpdate={handleStatusUpdate}
                    onDeleteBooking={handleDeleteBooking}
                    onBack={handleBackToList}
                />
            )}
        </div>
    );
};

export default BookingsManagement;
