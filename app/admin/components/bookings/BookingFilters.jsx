import { useState } from 'react';

const BookingFilters = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
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

    return (
        <div className="bg-neutral-800 p-6 rounded-xl shadow border border-neutral-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 text-sm">
                {/* Search */}
                <div>
                    <label className="block text-neutral-400 mb-1 font-medium">
                        Search
                    </label>
                    <input
                        type="text"
                        value={localFilters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Search users, apartments..."
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-neutral-400 mb-1 font-medium">
                        Status
                    </label>
                    <select
                        value={localFilters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-neutral-400 mb-1 font-medium">
                        Start Date From
                    </label>
                    <input
                        type="date"
                        value={localFilters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-neutral-400 mb-1 font-medium">
                        End Date To
                    </label>
                    <input
                        type="date"
                        value={localFilters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Limit */}
                <div>
                    <label className="block text-neutral-400 mb-1 font-medium">
                        Items Per Page
                    </label>
                    <select
                        value={localFilters.limit}
                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
                <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Clear Filters
                </button>
                <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default BookingFilters;
