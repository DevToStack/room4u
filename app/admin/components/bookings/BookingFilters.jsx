import { useState, useEffect } from 'react';

const BookingFilters = ({ filters, onFilterChange, isOpen, onClose }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
        onClose();
    };

    const clearFilters = () => {
        const clearedFilters = {
            page: 1,
            limit: 10,
            status: '',
            search: '',
            start_date: '',
            end_date: '',
        };
        setLocalFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            {/* Backdrop click */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-neutral-900 w-full max-w-lg p-6 rounded-xl shadow-xl border border-neutral-700">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-200">
                        Booking Filters
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white text-xl"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="block text-neutral-400 mb-1">Search</label>
                        <input
                            type="text"
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search users, apartments..."
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                        />
                    </div>

                    <div>
                        <label className="block text-neutral-400 mb-1">Status</label>
                        <select
                            value={localFilters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-neutral-400 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={localFilters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                        />
                    </div>

                    <div>
                        <label className="block text-neutral-400 mb-1">End Date</label>
                        <input
                            type="date"
                            value={localFilters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                        />
                    </div>

                    <div>
                        <label className="block text-neutral-400 mb-1">Items Per Page</label>
                        <select
                            value={localFilters.limit}
                            onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800"
                    >
                        Clear
                    </button>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingFilters;
