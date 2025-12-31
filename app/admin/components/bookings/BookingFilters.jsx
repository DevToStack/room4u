import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';

const BookingSearchBar = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showLimitDropdown, setShowLimitDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const statusRef = useRef(null);
    const dateRef = useRef(null);
    const limitRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                !statusRef.current?.contains(event.target) &&
                !dateRef.current?.contains(event.target) &&
                !limitRef.current?.contains(event.target)
            ) {
                setShowStatusDropdown(false);
                setShowDatePicker(false);
                setShowLimitDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);
        

    // Debounced search
    const handleSearchChange = useCallback((value) => {
        const newFilters = { ...localFilters, search: value, page: 1 };
        setLocalFilters(newFilters);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debouncing (300ms)
        searchTimeoutRef.current = setTimeout(() => {
            onFilterChange(newFilters);
        }, 300);
    }, [localFilters, onFilterChange]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value, page: 1 };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);

        // Close dropdowns after selection
        if (key === 'status') setShowStatusDropdown(false);
        if (key === 'limit') setShowLimitDropdown(false);
    };

    const handleDateChange = (type, date) => {
        const newFilters = { ...localFilters, [type]: date, page: 1 };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'Date';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Check if any filter is active
    const hasActiveFilters = localFilters.status || localFilters.start_date || localFilters.end_date || localFilters.search;

    return (
        <div className="w-full space-y-2 mb-4">
            {/* Main Search Bar Row */}
            <div className="flex items-center gap-2 p-2 bg-neutral-900 rounded-xl border border-neutral-700">
                {/* Search Input - Takes most space */}
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={localFilters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search users, apartments..."
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-neutral-200 placeholder-neutral-500 focus:outline-none"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative" ref={statusRef}>
                    <button
                        onClick={() => {
                            setShowStatusDropdown(!showStatusDropdown);
                            setShowDatePicker(false);
                            setShowLimitDropdown(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${localFilters.status
                                ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                                : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300'
                            }`}
                    >
                        <Filter size={16} />
                        <span className="text-sm whitespace-nowrap">
                            {localFilters.status ? localFilters.status.charAt(0).toUpperCase() + localFilters.status.slice(1) : 'Status'}
                        </span>
                    </button>

                    {showStatusDropdown && (
                        <div className="absolute right-0 top-full mt-1 z-10 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                            <div className="py-1">
                                {['', 'pending', 'confirmed', 'cancelled', 'expired','ongoing'].map((status) => (
                                    <button
                                        key={status || 'all'}
                                        onClick={() => handleFilterChange('status', status)}
                                        className={`w-full px-3 py-2 text-sm text-left hover:bg-neutral-800 transition-colors ${localFilters.status === status
                                                ? 'bg-blue-900/30 text-blue-300'
                                                : 'text-neutral-300'
                                            }`}
                                    >
                                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Status'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Range Picker */}
                <div className="relative" ref={dateRef}>
                    <button
                        onClick={() => {
                            setShowDatePicker(!showDatePicker);
                            setShowStatusDropdown(false);
                            setShowLimitDropdown(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${localFilters.start_date || localFilters.end_date
                                ? 'bg-purple-900/30 border-purple-700 text-purple-300'
                                : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300'
                            }`}
                    >
                        <Calendar size={16} />
                        <span className="text-sm whitespace-nowrap">
                            {localFilters.start_date && localFilters.end_date
                                ? `${formatDate(localFilters.start_date)} - ${formatDate(localFilters.end_date)}`
                                : 'Date Range'}
                        </span>
                    </button>

                    {showDatePicker && (
                        <div className="absolute right-0 top-full mt-1 z-10 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg p-3">
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.start_date}
                                        onChange={(e) => handleDateChange('start_date', e.target.value)}
                                        className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-sm text-neutral-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-400 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.end_date}
                                        onChange={(e) => handleDateChange('end_date', e.target.value)}
                                        className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-sm text-neutral-200"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        handleDateChange('start_date', '');
                                        handleDateChange('end_date', '');
                                    }}
                                    className="w-full mt-2 px-2 py-1.5 text-xs border border-neutral-700 text-neutral-400 rounded hover:bg-neutral-800"
                                >
                                    Clear Dates
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Per Page */}
                <div className="relative" ref={limitRef}>
                    <button
                        onClick={() => {
                            setShowLimitDropdown(!showLimitDropdown);
                            setShowStatusDropdown(false);
                            setShowDatePicker(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
                    >
                        <span className="text-sm whitespace-nowrap">
                            {localFilters.limit} per page
                        </span>
                    </button>

                    {showLimitDropdown && (
                        <div className="absolute right-0 top-full mt-1 z-10 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                            <div className="py-1">
                                {[10, 25, 50, 100].map((limit) => (
                                    <button
                                        key={limit}
                                        onClick={() => handleFilterChange('limit', limit)}
                                        className={`w-full px-3 py-2 text-sm text-left hover:bg-neutral-800 transition-colors ${localFilters.limit === limit
                                                ? 'bg-neutral-800 text-neutral-200'
                                                : 'text-neutral-300'
                                            }`}
                                    >
                                        {limit} per page
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors"
                        title="Clear all filters"
                    >
                        <X size={16} />
                        <span className="text-sm whitespace-nowrap">Clear</span>
                    </button>
                )}
            </div>

            {/* Active Filters Indicator */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>Active filters applied</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-500">
                        {localFilters.search && 'Search: ' + localFilters.search}
                        {localFilters.status && (localFilters.search ? ', ' : '') + 'Status: ' + localFilters.status}
                        {localFilters.start_date && (localFilters.search || localFilters.status ? ', ' : '') + 'From: ' + formatDate(localFilters.start_date)}
                        {localFilters.end_date && (localFilters.start_date ? ' to ' : '') + formatDate(localFilters.end_date)}
                    </span>
                </div>
            )}
        </div>
    );
};

export const BookingFiltersSkeleton = () => {
    return (
        <div className="w-full space-y-2 mb-4 animate-pulse">
            {/* Main Search Bar Skeleton */}
            <div className="flex items-center gap-2 p-2 bg-neutral-900 rounded-xl border border-neutral-700">

                {/* Search Input Skeleton */}
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded bg-neutral-700" />
                    <div className="w-full h-[42px] rounded-md bg-neutral-800" />
                </div>

                {/* Status Filter Skeleton */}
                <div className="w-[92px] h-[42px] rounded-lg bg-neutral-800 border border-neutral-700" />

                {/* Date Range Skeleton */}
                <div className="w-[140px] h-[42px] rounded-lg bg-neutral-800 border border-neutral-700" />

                {/* Limit Skeleton */}
                <div className="w-[110px] h-[42px] rounded-lg bg-neutral-800 border border-neutral-700" />

                {/* Clear Button Skeleton */}
                <div className="w-[70px] h-[42px] rounded-lg bg-neutral-800 border border-neutral-700" />
            </div>

            {/* Active Filters Indicator Skeleton */}
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neutral-600" />
                <div className="h-4 w-48 rounded bg-neutral-800" />
                <div className="h-4 w-64 rounded bg-neutral-800" />
            </div>
        </div>
    );
};

export default BookingSearchBar;