import { useState } from 'react';

export default function BookingUpdateModal({
    isOpen,
    onClose,
    booking,
    onUpdateSuccess
}) {
    const [formData, setFormData] = useState({
        start_date: booking.checkIn,
        end_date: booking.checkOut,
        guests: booking.guests
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [dateConflict, setDateConflict] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setDateConflict(null);

        try {
            // Filter out undefined values
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([_, value]) => value !== undefined && value !== '')
            );

            // Convert dates to ISO string if they exist
            if (payload.start_date) {
                payload.start_date = new Date(payload.start_date).toISOString().split('T')[0];
            }
            if (payload.end_date) {
                payload.end_date = new Date(payload.end_date).toISOString().split('T')[0];
            }

            const response = await fetch(`/api/dashboard/bookings/${booking.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials:"include",
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.code === 'DATE_CONFLICT' && result.conflictingDates) {
                    setDateConflict(result.conflictingDates);
                    setError(result.error);
                } else {
                    setError(result.error || 'Failed to update booking');
                }
                return;
            }

            // Success
            onUpdateSuccess();
            onClose();
            setFormData({});

        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Update error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear errors when user makes changes
        if (error) setError(null);
        if (dateConflict) setDateConflict(null);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-neutral-800 text-gray-100 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-700 rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-teal-400">
                        Update Booking #{booking.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-teal-400 transition-colors text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Start Date Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={formData.start_date || booking.checkIn}
                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Current: {formatDate(booking.current_start)}
                        </p>
                    </div>

                    {/* End Date Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={formData.end_date || booking.checkOut}
                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            min={formData.start_date || booking.checkIn}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Current: {formatDate(booking.current_end)}
                        </p>
                    </div>

                    {/* Guests Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Number of Guests
                        </label>
                        <input
                            type="number"
                            value={formData.guests ?? booking.guests}
                            onChange={(e) =>
                                handleInputChange('guests', parseInt(e.target.value))
                            }
                            min="1"
                            max={booking.max_guests}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum: {booking.max_guests} guests
                        </p>
                    </div>

                    {/* Date Conflict Display */}
                    {dateConflict && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                            <h4 className="text-red-400 font-medium mb-2">Date Conflict</h4>
                            <p className="text-red-300 text-sm mb-3">
                                The selected dates conflict with existing bookings:
                            </p>
                            <div className="space-y-1">
                                {dateConflict.conflicts.map((conflict, index) => (
                                    <div key={index} className="text-red-300 text-sm">
                                        • Booking #{conflict.id}: {formatDate(conflict.start)} →{' '}
                                        {formatDate(conflict.end)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && !dateConflict && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-2 px-4 border border-neutral-600 rounded-lg text-gray-300 hover:bg-neutral-700 hover:text-teal-300 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
}