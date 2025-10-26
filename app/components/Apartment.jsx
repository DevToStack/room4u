'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import NextImage from "next/image";

// Skeleton Loader Component
const ApartmentCardSkeleton = () => {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg animate-pulse">
            <div className="h-56 bg-gray-700 relative">
                <div className="absolute top-3 right-3 bg-gray-600 px-3 py-1 rounded-full text-sm font-semibold shadow w-20 h-6"></div>
            </div>
            <div className="p-6">
                <div className="h-6 bg-gray-700 rounded mb-3 w-3/4"></div>
                <div className="flex items-center mb-3">
                    <div className="h-4 w-4 bg-gray-700 rounded mr-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-4 w-4 bg-gray-700 rounded mr-1"></div>
                        <div className="h-4 bg-gray-700 rounded w-8 ml-1"></div>
                        <div className="h-4 bg-gray-700 rounded w-12 ml-1"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-white/10 flex-wrap">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                            <div className="h-4 w-4 bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="w-full mt-6 bg-gray-700 h-12 rounded-2xl"></div>
            </div>
        </div>
    );
};

// Updated AmenityIcon component to handle dynamic icon names from API
const AmenityIcon = ({ type }) => {
    if (!type) return null;

    // If type is already an icon object (from API), use it directly
    if (typeof type === 'object' && type.iconName) {
        return <FontAwesomeIcon icon={type} className="text-teal-400 h-4 w-4" />;
    }

    // If type is a string like "faTv", look it up in solidIcons
    if (typeof type === 'string') {
        const iconName = type.startsWith('fa') ? type : `fa${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const icon = solidIcons[iconName];

        if (icon) {
            return <FontAwesomeIcon icon={icon} className="text-teal-400 h-4 w-4" />;
        }
    }

    // Fallback icon
    return <FontAwesomeIcon icon={solidIcons.faHome} className="text-teal-400 h-4 w-4" />;
};

// Safe Image component with error handling
const ApartmentImage = ({ apartment, index, isFullScreen }) => {
    const [imageError, setImageError] = useState(false);

    // Show only first 3 images in home screen, all images in full screen
    const shouldShowImage = isFullScreen || (index !== undefined && index < 3);

    if (!shouldShowImage || !apartment?.image || imageError) {
        return (
            <div className="h-56 bg-gray-800 relative flex items-center justify-center">
                <div className="text-gray-400 text-center">
                    <FontAwesomeIcon icon={solidIcons.faImage} className="h-12 w-12 mb-2" />
                    <p className="text-sm">Image not available</p>
                </div>
                <div className="absolute top-3 right-3 bg-teal-400/90 px-3 py-1 rounded-full text-sm font-semibold shadow text-neutral-900">
                    ${apartment?.price || 0}/night
                </div>
            </div>
        );
    }

    return (
        <div className="h-56 bg-gray-800 relative">
            <NextImage
                src={apartment.image}
                alt={apartment.title || 'Apartment'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => setImageError(true)}
                priority={index <= 3}
            />
            <div className="absolute top-3 right-3 bg-teal-400/90 px-3 py-1 rounded-full text-sm font-semibold shadow text-neutral-900">
                ${apartment.price}/night
            </div>
        </div>
    );
};
// Filter Modal Component with Tab Layout - Responsive for Mobile
const FilterModal = ({ isOpen, onClose, filters, onFilterChange, allFeatures, allLocations }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("features");

    if (!isOpen) return null;

    // Filter features based on search
    const filteredFeatures = allFeatures.filter(feature =>
        feature.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: "features", label: "Features", icon: solidIcons.faList },
        { id: "location", label: "Location", icon: solidIcons.faMapMarkerAlt },
        { id: "price", label: "Price", icon: solidIcons.faDollarSign },
        { id: "rating", label: "Rating", icon: solidIcons.faStar }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "features":
                return (
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div>
                            <div className="relative">
                                <FontAwesomeIcon
                                    icon={solidIcons.faSearch}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                                />
                                <input
                                    type="text"
                                    placeholder="Search features..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
                                />
                            </div>
                        </div>

                        {/* Feature Filter */}
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-base">Select Feature</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <input
                                        type="radio"
                                        name="feature"
                                        value="all"
                                        checked={filters.feature === 'all'}
                                        onChange={(e) => onFilterChange('feature', e.target.value)}
                                        className="text-teal-400 focus:ring-teal-400 h-4 w-4"
                                    />
                                    <span className="text-gray-300 text-sm">All Features</span>
                                </label>
                                {filteredFeatures.map(feature => (
                                    <label key={feature} className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <input
                                            type="radio"
                                            name="feature"
                                            value={feature}
                                            checked={filters.feature === feature}
                                            onChange={(e) => onFilterChange('feature', e.target.value)}
                                            className="text-teal-400 focus:ring-teal-400 h-4 w-4"
                                        />
                                        <span className="text-gray-300 capitalize text-sm">
                                            {feature.charAt(0).toUpperCase() + feature.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "location":
                return (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-base">Select Location</h4>
                            <select
                                value={filters.location}
                                onChange={e => onFilterChange('location', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
                            >
                                <option value="all">All Locations</option>
                                {allLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location Preview */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <h5 className="text-white font-medium mb-2 text-sm">Selected Location</h5>
                            <p className="text-gray-300 text-sm">
                                {filters.location === 'all' ? 'All locations' : filters.location}
                            </p>
                        </div>
                    </div>
                );

            case "price":
                return (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-base">Price Range</h4>
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-3">
                                    <div className="w-full">
                                        <label className="text-gray-400 text-sm mb-2 block">Min Price</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={filters.minPrice || ''}
                                            onChange={e => onFilterChange('minPrice', e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label className="text-gray-400 text-sm mb-2 block">Max Price</label>
                                        <input
                                            type="number"
                                            placeholder="10000"
                                            value={filters.maxPrice || ''}
                                            onChange={e => onFilterChange('maxPrice', e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
                                        />
                                    </div>
                                </div>

                                {/* Price Range Display */}
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h5 className="text-white font-medium mb-2 text-sm">Selected Range</h5>
                                    <p className="text-gray-300 text-sm">
                                        ${filters.minPrice || 0} - ${filters.maxPrice || 10000}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "rating":
                return (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-base">Minimum Rating</h4>
                            <select
                                value={filters.rating}
                                onChange={e => onFilterChange('rating', Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
                            >
                                <option value={0}>All Ratings</option>
                                {[1, 2, 3, 4, 5].map(r => (
                                    <option key={r} value={r}>{r} ⭐ & Up</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating Preview */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <h5 className="text-white font-medium mb-2 text-sm">Selected Rating</h5>
                            <p className="text-gray-300 text-sm">
                                {filters.rating === 0 ? 'All ratings' : `${filters.rating} ⭐ & Up`}
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:items-center sm:p-4">
            <div className="bg-neutral-800 rounded-t-3xl sm:rounded-3xl w-full h-[80vh] sm:max-h-[90vh] sm:max-w-4xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/10">
                    <h3 className="text-lg sm:text-xl font-bold text-white">Filter Apartments</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                    >
                        <FontAwesomeIcon icon={solidIcons.faTimes} className="h-5 w-5" />
                    </button>
                </div>

                {/* Main Content - Mobile: Tabs on top, Desktop: Tabs on left */}
                <div className="flex flex-col sm:flex-row flex-1 min-h-0">
                    {/* Mobile Tabs - Horizontal */}
                    <div className="sm:hidden border-b border-white/10 bg-neutral-900/50 overflow-x-auto">
                        <div className="flex p-2 space-x-1 min-w-max">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-left transition-all duration-200 flex-shrink-0 ${activeTab === tab.id
                                        ? 'bg-teal-400 text-neutral-900 font-semibold'
                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        icon={tab.icon}
                                        className={`h-4 w-4 ${activeTab === tab.id ? 'text-neutral-900' : 'text-gray-400'}`}
                                    />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Tabs - Vertical */}
                    <div className="hidden sm:block w-48 border-r border-white/10 bg-neutral-900/50">
                        <div className="p-4 space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-teal-400 text-neutral-900 font-semibold'
                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        icon={tab.icon}
                                        className={`h-4 w-4 ${activeTab === tab.id ? 'text-neutral-900' : 'text-gray-400'}`}
                                    />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        {renderTabContent()}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-white/10 bg-neutral-900/50">
                    <button
                        onClick={() => {
                            onFilterChange('feature', 'all');
                            onFilterChange('location', 'all');
                            onFilterChange('minPrice', 0);
                            onFilterChange('maxPrice', 10000);
                            onFilterChange('rating', 0);
                            setSearchTerm("");
                            setActiveTab("features");
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium text-sm sm:text-base"
                    >
                        Reset All Filters
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-teal-400 text-neutral-900 font-semibold rounded-xl hover:bg-teal-500 transition-all duration-300 text-sm sm:text-base"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ApartmentShowcase() {
    const router = useRouter();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        feature: 'all',
        minPrice: 0,
        maxPrice: 10000,
        rating: 0,
        location: 'all'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Set client-side flag safely
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch apartments
    useEffect(() => {
        async function fetchApartments() {
            try {
                setLoading(true);
                const res = await fetch('/api/apartment');
                if (!res.ok) throw new Error('Failed to fetch apartments');
                const data = await res.json();
                setApartments(Array.isArray(data) ? data : []);
            } catch (err) {
                setApartments([]);
            } finally {
                setLoading(false);
            }
        }
        fetchApartments();
    }, []);

    // Handle Home Tab Clicks & Hash Change
    useEffect(() => {
        if (!isClient) return;

        const handleHomeClick = () => setIsFullScreen(false);
        const handleHashChange = () => {
            if (window.location.hash === '#home') handleHomeClick();
        };

        window.addEventListener('homeTabClicked', handleHomeClick);
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('homeTabClicked', handleHomeClick);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [isClient]);

    // Memoized filtered apartments with safe access
    const filteredApartments = useMemo(() => {
        if (!Array.isArray(apartments)) return [];

        return apartments
            .filter(a => {
                if (!a) return false;
                return filters.feature === 'all' || (Array.isArray(a.features) && a.features.includes(filters.feature));
            })
            .filter(a => {
                if (!a) return false;
                const price = Number(a.price) || 0;
                const minPrice = Number(filters.minPrice) || 0;
                const maxPrice = Number(filters.maxPrice) || 10000;
                return price >= minPrice && price <= maxPrice;
            })
            .filter(a => {
                if (!a) return false;
                const rating = a.reviews?.rating || 0;
                return rating >= (filters.rating || 0);
            })
            .filter(a => {
                if (!a) return false;
                return filters.location === 'all' || a.location === filters.location;
            })
            .filter(a => {
                if (!a) return false;
                if (searchQuery === '') return true;

                const query = searchQuery.toLowerCase();
                return (
                    (a.title || '').toLowerCase().includes(query) ||
                    (a.location || '').toLowerCase().includes(query) ||
                    (Array.isArray(a.features) && a.features.some(f =>
                        f.toLowerCase().includes(query)
                    ))
                );
            });
    }, [apartments, filters, searchQuery]);

    // Unique features and locations with safe access
    const allFeatures = useMemo(() => {
        if (!Array.isArray(apartments)) return [];
        const features = apartments.flatMap(a =>
            Array.isArray(a.features) ? a.features : []
        );
        return Array.from(new Set(features)).filter(Boolean);
    }, [apartments]);

    const allLocations = useMemo(() => {
        if (!Array.isArray(apartments)) return [];
        const locations = apartments.map(a => a?.location).filter(Boolean);
        return Array.from(new Set(locations));
    }, [apartments]);

    // Apartments to display - ensure consistent rendering
    const visibleApartments = useMemo(() => {
        if (!isClient || loading) {
            return [...Array(isFullScreen ? 12 : 3)].map((_, i) => ({ id: `skeleton-${i}` }));
        }
        return isFullScreen ? filteredApartments : filteredApartments.slice(0, 3);
    }, [isClient, loading, isFullScreen, filteredApartments]);

    // Handlers
    const handleViewAll = () => setIsFullScreen(true);
    const handleBackToNormal = () => setIsFullScreen(false);
    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const openFilterModal = () => setIsFilterModalOpen(true);
    const closeFilterModal = () => setIsFilterModalOpen(false);
    const handleSearchChange = e => setSearchQuery(e.target.value);

    // Reset filters function
    const resetFilters = () => {
        setFilters({
            feature: 'all',
            minPrice: 0,
            maxPrice: 10000,
            rating: 0,
            location: 'all'
        });
        setSearchQuery('');
    };

    // Always render the same structure on server and client
    return (
        <section
            id="apartments"
            className={`${isFullScreen
                ? 'fixed inset-0 z-50 bg-neutral-900 overflow-y-auto py-4'
                : 'py-24 bg-neutral-900 relative overflow-hidden'
                }`}
        >
            {!isFullScreen && (
                <>
                    <div className="absolute top-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </>
            )}

            <div className={`${isFullScreen ? 'min-h-full px-4 sm:px-6 lg:px-8' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'} relative z-10`}>
                {/* Header */}
                <div className={`${isFullScreen ? 'mb-8' : 'text-center mb-12'}`}>
                    {isFullScreen ? (
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={handleBackToNormal}
                                className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors p-2 rounded-lg hover:bg-white/10"
                            >
                                <FontAwesomeIcon icon={solidIcons.faArrowLeft} className="h-5 w-5" />
                                <span>Back to Home View</span>
                            </button>
                            {/* Search + Filter */}
                            <div className={`flex items-center justify-between mb-8 ${isFullScreen ? '' : 'max-w-4xl mx-auto'}`}>
                                <div className="flex-1 max-w-2xl">
                                    <div className="relative">
                                        <FontAwesomeIcon icon={solidIcons.faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search apartments by title, location, or features..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-md"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={openFilterModal}
                                    className="ml-4 p-4 bg-teal-400 hover:bg-teal-500 text-neutral-900 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
                                    title="Filter Apartments"
                                >
                                    <FontAwesomeIcon icon={solidIcons.faFilter} className="h-5 w-5" />
                                </button>
                            </div>
                            {/* Results Count */}
                            {isClient && !loading && (
                                <div className={`${isFullScreen ? 'mb-6' : 'text-center mb-8'}`}>
                                    <p className="text-gray-300">
                                        Showing {Math.min(visibleApartments.length, filteredApartments.length)} of {filteredApartments.length} apartments
                                        {searchQuery && ` for "${searchQuery}"`}
                                        {!isFullScreen && filteredApartments.length > 3 && ` (showing first 3, view all to see ${filteredApartments.length})`}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Apartments</h2>
                            <p className="text-lg md:text-xl text-gray-300">Handpicked apartments for an unforgettable stay</p>
                        </>
                    )}
                </div>

                

                {/* Apartment Grid */}
                <div className={`grid grid-cols-1 ${isFullScreen ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6 ${isFullScreen ? 'pb-8' : ''}`}>
                    {loading || !isClient
                        ? [...Array(isFullScreen ? 12 : 3)].map((_, idx) => (
                            <ApartmentCardSkeleton key={`skeleton-${idx}`} />
                        ))
                        : visibleApartments.map((apartment, index) => (
                            <div key={apartment.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300">
                                <ApartmentImage
                                    apartment={apartment}
                                    index={index}
                                    isFullScreen={isFullScreen}
                                />
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg text-white mb-2">
                                        {apartment.title || 'Untitled Apartment'}
                                    </h3>
                                    <div className="flex items-center text-gray-300 mb-2">
                                        <FontAwesomeIcon icon={solidIcons.faMapMarkerAlt} className="h-4 w-4 mr-1 text-teal-400" />
                                        <span className="text-sm">{apartment.location || 'Location not specified'}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={solidIcons.faStar} className="h-4 w-4 text-teal-400" />
                                            <span className="ml-1 text-sm font-semibold text-white">
                                                {apartment.reviews?.rating || 0}
                                            </span>
                                            <span className="ml-1 text-sm text-gray-400">
                                                ({apartment.reviews?.totalReviews || 0})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-3 border-t border-white/10 flex-wrap">
                                        {Array.isArray(apartment.features) ? apartment.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-gray-300">
                                                <FontAwesomeIcon
                                                    icon={solidIcons[feat]}  // ✅ Use feat directly if it's an icon object
                                                    className="w-4 h-4 text-emerald-400"
                                                />
                                            </div>
                                        )) : null}
                                    </div>
                                    <button
                                        onClick={() => apartment.id && router.push(`/booking/${apartment.id}`)}
                                        className="w-full mt-6 bg-teal-400 hover:bg-teal-500 text-neutral-900 font-semibold py-3 rounded-2xl hover:shadow-2xl transition-all duration-300"
                                        disabled={!apartment.id}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>

                {/* No Results */}
                {isClient && !loading && filteredApartments.length === 0 && (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={solidIcons.faSearch} className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No apartments found</h3>
                        <p className="text-gray-300">
                            {searchQuery
                                ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                                : "No apartments match your current filters. Try adjusting your criteria."}
                        </p>
                        <button
                            onClick={resetFilters}
                            className="mt-4 px-6 py-2 bg-teal-400 text-neutral-900 rounded-xl hover:bg-teal-500 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* View All Button */}
                {isClient && !loading && !isFullScreen && filteredApartments.length > 3 && (
                    <div className="text-center mt-16">
                        <button
                            className="bg-white/10 text-teal-400 border border-teal-400 px-8 py-3 rounded-2xl hover:bg-white/20 transition-all duration-300"
                            onClick={handleViewAll}
                        >
                            View All {filteredApartments.length} Apartments
                        </button>
                    </div>
                )}

                {/* Filter Modal */}
                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    filters={filters}
                    onFilterChange={filteredApartments}
                    allFeatures={allFeatures}
                    allLocations={allLocations}
                />
            </div>
        </section>
    );
}