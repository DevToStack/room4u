'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import NextImage from "next/image";
import Header from '@/components/Header';

// Skeleton Loader Component
const ApartmentCardSkeleton = () => {
    return (
        <div className="bg-neutral-900/5 backdrop-blur-md border border-neutral-700 rounded-3xl overflow-hidden shadow-lg animate-pulse">
            <div className="h-56 bg-neutral-800 relative">
                <div className="absolute top-3 right-3 bg-neutral-700 px-3 py-1 rounded-full text-sm font-semibold shadow w-20 h-6"></div>
            </div>
            <div className="p-6">
                <div className="h-6 bg-neutral-700 rounded mb-3 w-3/4"></div>
                <div className="flex items-center mb-3">
                    <div className="h-4 w-4 bg-neutral-700 rounded mr-2"></div>
                    <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-4 w-4 bg-neutral-700 rounded mr-1"></div>
                        <div className="h-4 bg-neutral-700 rounded w-8 ml-1"></div>
                        <div className="h-4 bg-neutral-700 rounded w-12 ml-1"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-neutral-700 flex-wrap">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                            <div className="h-4 w-4 bg-neutral-700 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="w-full mt-6 bg-neutral-700 h-12 rounded-2xl"></div>
            </div>
        </div>

    );
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
    const [searchTerms, setSearchTerms] = useState({
        features: "",
        location: "",
        price: "",
        rating: ""
    });
    const [activeTab, setActiveTab] = useState("features");

    if (!isOpen) return null;

    // Filter features based on search
    const filteredFeatures = allFeatures.filter(feature =>
        feature.toLowerCase().includes(searchTerms.features.toLowerCase())
    );

    // Filter locations based on search
    const filteredLocations = allLocations.filter(location =>
        location.toLowerCase().includes(searchTerms.location.toLowerCase())
    );

    // Handle feature selection (multiple)
    const handleFeatureToggle = (feature) => {
        const currentFeatures = Array.isArray(filters.features) ? filters.features : [];
        const newFeatures = currentFeatures.includes(feature)
            ? currentFeatures.filter(f => f !== feature)
            : [...currentFeatures, feature];
        onFilterChange('features', newFeatures);
    };

    // Handle select all features
    const handleSelectAllFeatures = () => {
        if (Array.isArray(filters.features) && filters.features.length === filteredFeatures.length) {
            onFilterChange('features', []);
        } else {
            onFilterChange('features', filteredFeatures);
        }
    };

    const tabs = [
        { id: "features", label: "Features", icon: solidIcons.faList },
        { id: "location", label: "Location", icon: solidIcons.faMapMarkerAlt },
        { id: "price", label: "Price", icon: solidIcons.faDollarSign },
        { id: "rating", label: "Rating", icon: solidIcons.faStar }
    ];

    const updateSearchTerm = (tab, value) => {
        setSearchTerms(prev => ({ ...prev, [tab]: value }));
    };

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
                                    value={searchTerms.features}
                                    onChange={(e) => updateSearchTerm('features', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
                                />
                            </div>
                        </div>

                        {/* Feature Filter with Checkboxes */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-white font-semibold text-base">Select Features</h4>
                                <button
                                    onClick={handleSelectAllFeatures}
                                    className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                                >
                                    {Array.isArray(filters.features) && filters.features.length === filteredFeatures.length
                                        ? 'Deselect All'
                                        : 'Select All'}
                                </button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {filteredFeatures.map(feature => (
                                    <label key={feature} className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(filters.features) && filters.features.includes(feature)}
                                            onChange={() => handleFeatureToggle(feature)}
                                            className="text-teal-400 focus:ring-teal-400 h-4 w-4 rounded"
                                        />
                                        <span className="text-gray-300 capitalize text-sm">
                                            {feature.replace('fa', '').charAt(0).toUpperCase() + feature.replace('fa', '').slice(1)}
                                        </span>
                                    </label>
                                ))}
                                {filteredFeatures.length === 0 && (
                                    <p className="text-gray-400 text-sm text-center py-4">No features found</p>
                                )}
                            </div>
                        </div>

                        {/* Selected Features Preview */}
                        {Array.isArray(filters.features) && filters.features.length > 0 && (
                            <div className="bg-white/5 rounded-xl p-4">
                                <h5 className="text-white font-medium mb-2 text-sm">Selected Features ({filters.features.length})</h5>
                                <div className="flex flex-wrap gap-2">
                                    {filters.features.map(feature => (
                                        <span key={feature} className="bg-teal-400/20 text-teal-300 px-2 py-1 rounded-lg text-xs">
                                            {feature.replace('fa', '').charAt(0).toUpperCase() + feature.replace('fa', '').slice(1)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "location":
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
                                    placeholder="Search locations..."
                                    value={searchTerms.location}
                                    onChange={(e) => updateSearchTerm('location', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-3 text-base">Select Locations</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={filters.location === 'all' || (Array.isArray(filters.locations) && filters.locations.length === 0)}
                                        onChange={() => onFilterChange('locations', [])}
                                        className="text-teal-400 focus:ring-teal-400 h-4 w-4 rounded"
                                    />
                                    <span className="text-gray-300 text-sm">All Locations</span>
                                </label>
                                {filteredLocations.map(location => (
                                    <label key={location} className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(filters.locations) && filters.locations.includes(location)}
                                            onChange={() => {
                                                const currentLocations = Array.isArray(filters.locations) ? filters.locations : [];
                                                const newLocations = currentLocations.includes(location)
                                                    ? currentLocations.filter(l => l !== location)
                                                    : [...currentLocations, location];
                                                onFilterChange('locations', newLocations);
                                            }}
                                            className="text-teal-400 focus:ring-teal-400 h-4 w-4 rounded"
                                        />
                                        <span className="text-gray-300 text-sm">{location}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Location Preview */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <h5 className="text-white font-medium mb-2 text-sm">Selected Locations</h5>
                            <p className="text-gray-300 text-sm">
                                {(!Array.isArray(filters.locations) || filters.locations.length === 0)
                                    ? 'All locations'
                                    : `${filters.locations.length} location(s) selected`}
                            </p>
                            {Array.isArray(filters.locations) && filters.locations.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {filters.locations.map(location => (
                                        <span key={location} className="bg-teal-400/20 text-teal-300 px-2 py-1 rounded-lg text-xs">
                                            {location}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "price":
                return (
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold mb-3 text-base">Filter by Price Range</h4>
                        <div className="space-y-2">
                            {[
                                { min: 200, max: 500 },
                                { min: 501, max: 1000 },
                                { min: 1001, max: 2000 },
                                { min: 2001, max: 5000 },
                                { min: 5001, max: 10000 },
                                { min: 10001, max: 20000 },
                            ].map((range, index) => {
                                const label = `$${range.min} - $${range.max}`;
                                const isChecked =
                                    Array.isArray(filters.priceRanges) &&
                                    filters.priceRanges.some(
                                        (r) => r.min === range.min && r.max === range.max
                                    );

                                return (
                                    <label
                                        key={index}
                                        className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                                let updatedRanges = Array.isArray(filters.priceRanges)
                                                    ? [...filters.priceRanges]
                                                    : [];

                                                const exists = updatedRanges.some(
                                                    (r) => r.min === range.min && r.max === range.max
                                                );

                                                if (exists) {
                                                    updatedRanges = updatedRanges.filter(
                                                        (r) => !(r.min === range.min && r.max === range.max)
                                                    );
                                                } else {
                                                    updatedRanges.push(range);
                                                }

                                                onFilterChange("priceRanges", updatedRanges);
                                            }}
                                            className="w-5 h-5 rounded border-gray-400 text-teal-500 focus:ring-teal-500 bg-transparent"
                                        />
                                        <span>{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
                

            case "rating":
                return (
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold mb-3 text-base">Filter by Rating</h4>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((r) => (
                                <label
                                    key={r}
                                    className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        value={r}
                                        checked={Array.isArray(filters.rating) && filters.rating.includes(r)}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            const newRatings = Array.isArray(filters.rating)
                                                ? filters.rating.includes(value)
                                                    ? filters.rating.filter((v) => v !== value)
                                                    : [...filters.rating, value]
                                                : [value];
                                            onFilterChange('rating', newRatings);
                                        }}
                                        className="w-5 h-5 rounded border-gray-400 text-teal-500 focus:ring-teal-500 bg-transparent"
                                    />
                                    <span className="flex items-center gap-1">
                                        {[...Array(r)].map((_, i) => (
                                            <FontAwesomeIcon
                                                key={i}
                                                icon={solidIcons.faStar}
                                                className="text-yellow-400 h-4 w-4"
                                            />
                                        ))}
                                        <span className="text-sm text-gray-400">&nbsp;&up</span>
                                    </span>
                                </label>
                            ))}
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
                <div className="flex gap-4 sm:flex-row sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-white/10 bg-neutral-900/50">
                    <button
                        onClick={() => {
                            onFilterChange('features', []);
                            onFilterChange('locations', []);
                            onFilterChange('minPrice', 0);
                            onFilterChange('maxPrice', 10000);
                            onFilterChange('rating', 0);
                            setSearchTerms({ features: "", location: "", price: "", rating: "" });
                            setActiveTab("features");
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium text-sm sm:text-base"
                    >
                        Reset All Filters
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-teal-400 text-neutral-900 rounded-xl hover:bg-teal-500 transition-all duration-300 font-medium text-sm sm:text-base"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ApartmentsPage() {
    const router = useRouter();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        features: [],
        locations: [],
        minPrice: 0,
        maxPrice: 10000,
        rating: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
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
                console.log("Fetched apartments:", data);
            } catch (err) {
                setApartments([]);
            } finally {
                setLoading(false);
            }
        }
        console.log("Fetching apartments...", fetchApartments);
        fetchApartments();
    }, []);

    // Memoized filtered apartments with safe access
    const filteredApartments = useMemo(() => {
        if (!Array.isArray(apartments)) return [];

        return apartments
            .filter(a => {
                if (!a) return false;
                if (filters.features.length === 0) return true;
                return Array.isArray(a.features) && filters.features.some(feature =>
                    a.features.includes(feature)
                );
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
                if (filters.locations.length === 0) return true;
                return filters.locations.includes(a.city);
            })
            .filter(a => {
                if (!a) return false;
                if (searchQuery === '') return true;

                const query = searchQuery.toLowerCase();
                return (
                    (a.title || '').toLowerCase().includes(query) ||
                    (a.city || '').toLowerCase().includes(query) ||
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
        const locations = apartments.map(a => a?.city).filter(Boolean);
        return Array.from(new Set(locations));
    }, [apartments]);

    // Apartments to display
    const visibleApartments = useMemo(() => {
        if (!isClient || loading) {
            return [...Array(12)].map((_, i) => ({ id: `skeleton-${i}` }));
        }
        return filteredApartments;
    }, [isClient, loading, filteredApartments]);

    // Handlers
    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const openFilterModal = () => setIsFilterModalOpen(true);
    const closeFilterModal = () => setIsFilterModalOpen(false);
    const handleSearchChange = e => setSearchQuery(e.target.value);

    // Reset filters function
    const resetFilters = () => {
        setFilters({
            features: [],
            locations: [],
            minPrice: 0,
            maxPrice: 10000,
            rating: 0
        });
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-neutral-900 py-8">
            <Header />
            {/* Search and Filter Bar - Optimized for mobile */}
            <div className="fixed top-14 z-50 w-screen flex flex-row justify-center items-center gap-3 sm:gap-4 p-3 bg-neutral-900">
                <div className="flex-1 max-w-4xl">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={solidIcons.faSearch}
                            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                        />
                        <input
                            type="text"
                            placeholder="Search apartments..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm sm:text-md"
                        />
                    </div>
                </div>
                <button
                    onClick={openFilterModal}
                    className="px-1 sm:px-6 py-3 bg-teal-400 hover:bg-teal-500 text-neutral-900 font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 min-w-[50px]"
                >
                    <FontAwesomeIcon icon={solidIcons.faFilter} className="h-4 w-4" />
                    <span className='text-sm sm:text-base max-sm:hidden'>Filters</span>
                </button>
            </div>
            <div className="max-w-7xl mx-auto px-6 sm:px-4 lg:px-6 mt-25">

                {/* Apartment Grid - Optimized for showing 4+ cards on Android */}
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    {loading || !isClient
                        ? [...Array(8)].map((_, idx) => (
                            <ApartmentCardSkeleton key={`skeleton-${idx}`} />
                        ))
                        : visibleApartments.map((apartment, index) => (
                            <div 
                                key={apartment.id}
                                onClick={() => apartment.id && router.push(`/booking/${apartment.id}`)}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                            >
                                <ApartmentImage
                                    apartment={apartment}
                                    index={index}
                                    isFullScreen={true}
                                />
                                <div className="p-4 sm:p-5 lg:p-6">
                                    <h3 className="font-semibold text-base sm:text-lg text-white mb-2 line-clamp-2">
                                        {apartment.title || 'Untitled Apartment'}
                                    </h3>
                                    <div className="flex items-center text-gray-300 mb-2">
                                        <FontAwesomeIcon icon={solidIcons.faMapMarkerAlt} className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-teal-400" />
                                        <span className="text-xs sm:text-sm truncate">
                                            {apartment.city || 'City not specified'}, {apartment.country || 'Country not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={solidIcons.faStar} className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400" />
                                            <span className="ml-1 text-sm font-semibold text-white">
                                                {apartment.reviews?.rating || 0}
                                            </span>
                                            <span className="ml-1 text-xs sm:text-sm text-gray-400">
                                                ({apartment.reviews?.totalReviews || 0})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-3 border-t border-white/10 flex-wrap">
                                        {Array.isArray(apartment.features) ? apartment.features.slice(0, 3).map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-gray-300">
                                                <FontAwesomeIcon
                                                    icon={solidIcons[feat]}
                                                    className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400"
                                                />
                                            </div>
                                        )) : null}
                                        {Array.isArray(apartment.features) && apartment.features.length > 3 && (
                                            <span className="text-xs text-gray-400 ml-1">
                                                +{apartment.features.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            apartment.id && router.push(`/booking/${apartment.id}`);
                                        }}
                                        className="w-full mt-4 sm:mt-6 bg-teal-400 hover:bg-teal-500 text-neutral-900 font-semibold py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
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
                    <div className="text-center py-8 sm:py-12">
                        <FontAwesomeIcon icon={solidIcons.faSearch} className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No apartments found</h3>
                        <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto">
                            {searchQuery
                                ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                                : "No apartments match your current filters. Try adjusting your criteria."}
                        </p>
                        <button
                            onClick={resetFilters}
                            className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-teal-400 text-neutral-900 rounded-xl hover:bg-teal-500 transition-colors text-sm sm:text-base"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Filter Modal */}
                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={closeFilterModal}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    allFeatures={allFeatures}
                    allLocations={allLocations}
                />
            </div>
        </div>
    );
}