'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import NextImage from "next/image";
import Header from '@/components/Header';

// Updated Skeleton with new design
const ApartmentCardSkeleton = () => {
    return (
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-pulse border border-neutral-700/50">
            <div className="h-64 bg-neutral-800 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-neutral-700 w-20 h-7 rounded-full"></div>
            </div>
            <div className="p-6">
                <div className="h-7 bg-neutral-700 rounded-lg mb-4 w-3/4"></div>
                <div className="flex items-center mb-4">
                    <div className="h-4 w-4 bg-neutral-700 rounded-full mr-2"></div>
                    <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                        <div className="h-5 w-5 bg-neutral-700 rounded-full mr-1"></div>
                        <div className="h-4 bg-neutral-700 rounded w-8 ml-1"></div>
                        <div className="h-4 bg-neutral-700 rounded w-12 ml-1"></div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="h-6 bg-neutral-700 rounded-full w-16"></div>
                    ))}
                </div>
                <div className="w-full bg-gradient-to-r from-neutral-700 to-neutral-800 h-12 rounded-xl"></div>
            </div>
        </div>
    );
};

// Offer Tag Component
const OfferTag = ({ offer }) => {
    return (
        <div className="absolute top-4 left-4 z-20">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={solidIcons.faTag} className="h-3 w-3 text-white" />
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                            {offer.discount_percentage}% OFF
                        </span>
                    </div>
                </div>
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block">
                    <div className="bg-neutral-900/95 backdrop-blur-sm text-white text-xs rounded-lg p-3 w-48 shadow-xl border border-neutral-700">
                        <div className="font-bold text-yellow-400 mb-1">{offer.title}</div>
                        <p className="text-gray-300 mb-2">{offer.description}</p>
                        <div className="text-xs text-gray-400">
                            Valid until: {new Date(offer.valid_until).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Updated ApartmentImage with original + discounted price display
const ApartmentImage = ({ apartment, index, offer }) => {
    const [imageError, setImageError] = useState(false);

    // Calculate discounted price
    const finalPrice = offer
        ? (apartment.price - (apartment.price * Number(offer.discount_percentage) / 100)).toFixed(2)
        : apartment.price;

    const hasDiscount = offer !== null;

    // PRICE UI BLOCK (used in both image cases)
    const PriceTag = () => (
        <div className="absolute bottom-4 right-4 z-20 flex items-end">
            {hasDiscount ? (
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-1 rounded-full text-sm font-bold text-black shadow-md">
                    <span className="text-sm line-through font-medium mr-3">
                        ${apartment.price}
                    </span>

                    ${finalPrice}/night
                </span>
            ) : (
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 rounded-full text-sm font-bold text-black shadow-lg">
                    ${apartment.price}/night
                </div>
            )}
        </div>
    );

    // ========= NO IMAGE CASE ==========
    if (!apartment?.image || imageError) {
        return (
            <div className="h-64 relative flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700 group-hover:from-neutral-700 group-hover:to-neutral-600 transition-all duration-300">

                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={solidIcons.faHome} className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Image not available</p>
                </div>

                {offer && <OfferTag offer={offer} />}

                <PriceTag />
            </div>
        );
    }

    // ========= NORMAL IMAGE CASE ==========
    return (
        <div className="h-64 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/20 to-transparent z-10"></div>

            <NextImage
                src={apartment.image}
                alt={apartment.title || 'Apartment'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={() => setImageError(true)}
                priority={index <= 2}
            />

            {offer && <OfferTag offer={offer} />}

            <PriceTag />
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
                                            {feature}
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
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        features: [],
        locations: [],
        priceRanges: [],
        rating: []
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Set client-side flag safely
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch apartments and offers
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Fetch apartments
                const aptRes = await fetch('/api/apartment');
                if (!aptRes.ok) throw new Error('Failed to fetch apartments');
                const aptData = await aptRes.json();
                setApartments(Array.isArray(aptData) ? aptData : []);

                // Fetch offers
                const offersRes = await fetch('/api/offers');
                if (offersRes.ok) {
                    const offersData = await offersRes.json();
                    setOffers(offersData.offers || []);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setApartments([]);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Function to get offer for a specific apartment
    const getApartmentOffer = (apartmentId) => {
        if (!offers.length) return null;

        const now = new Date();

        return offers.find(offer => {
            const validFrom = new Date(offer.valid_from);
            const validUntil = new Date(offer.valid_until);

            // Offer must be within valid date range
            if (now < validFrom || now > validUntil) return false;

            // If null -> offer applies to ALL apartments
            if (offer.apartment_ids === null) {
                return true;
            }

            let apartmentIds = offer.apartment_ids;

            // If value is a string, parse it
            if (typeof apartmentIds === "string") {
                try {
                    apartmentIds = JSON.parse(apartmentIds);
                } catch {
                    return false;
                }
            }

            // Must be an array & include the apartmentId
            return Array.isArray(apartmentIds) && apartmentIds.includes(apartmentId);
        });
    };

    // Memoized filtered apartments with safe access
    const filteredApartments = useMemo(() => {
        if (!Array.isArray(apartments)) return [];

        return apartments
            .filter(a => {
                if (!a) return false;

                // Filter by features
                if (filters.features.length > 0) {
                    if (!Array.isArray(a.feature_texts)) return false;
                    return filters.features.every(feature => a.feature_texts.includes(feature));
                }
                return true;
            })
            .filter(a => {
                if (!a) return false;

                // Filter by price ranges
                if (filters.priceRanges.length > 0) {
                    const price = Number(a.price) || 0;
                    return filters.priceRanges.some(range =>
                        price >= range.min && price <= range.max
                    );
                }
                return true;
            })
            .filter(a => {
                if (!a) return false;

                // Filter by rating
                if (filters.rating.length > 0) {
                    const rating = Math.floor(a.reviews?.rating || 0);
                    return filters.rating.includes(rating);
                }
                return true;
            })
            .filter(a => {
                if (!a) return false;

                // Filter by locations
                if (filters.locations.length > 0) {
                    const city = a.city || a.location || '';
                    return filters.locations.includes(city);
                }
                return true;
            })
            .filter(a => {
                if (!a) return false;
                if (searchQuery === '') return true;

                const query = searchQuery.toLowerCase();
                return (
                    (a.title || '').toLowerCase().includes(query) ||
                    (a.city || '').toLowerCase().includes(query) ||
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
            Array.isArray(a.feature_texts) ? a.feature_texts : []
        );
        return Array.from(new Set(features)).filter(Boolean);
    }, [apartments]);

    const allLocations = useMemo(() => {
        if (!Array.isArray(apartments)) return [];
        const locations = apartments.map(a => a.city || a.location).filter(Boolean);
        return Array.from(new Set(locations));
    }, [apartments]);

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
            priceRanges: [],
            rating: []
        });
        setSearchQuery('');
    };

    // Apartments to display
    const visibleApartments = useMemo(() => {
        if (!isClient || loading) {
            return [...Array(8)].map((_, i) => ({ id: `skeleton-${i}` }));
        }
        return filteredApartments;
    }, [isClient, loading, filteredApartments]);

    return (
        <div className="min-h-screen bg-neutral-900">
            <Header />

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Search and Filter Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-10 mb-5">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-2/3">
                            <div className="relative">
                                <FontAwesomeIcon
                                    icon={solidIcons.faSearch}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                                />
                                <input
                                    type="text"
                                    placeholder="Search apartments by name, location, or features..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-neutral-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={openFilterModal}
                                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-neutral-900 font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={solidIcons.faFilter} className="h-4 w-4" />
                                <span>Filters</span>
                            </button>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 border border-neutral-700"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {((filters.features.length > 0) || (filters.locations.length > 0) || (filters.priceRanges.length > 0) || (filters.rating.length > 0)) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {filters.features.length > 0 && (
                                <span className="bg-teal-400/20 text-teal-300 px-3 py-1 rounded-lg text-sm">
                                    Features: {filters.features.length}
                                </span>
                            )}
                            {filters.locations.length > 0 && (
                                <span className="bg-purple-400/20 text-purple-300 px-3 py-1 rounded-lg text-sm">
                                    Locations: {filters.locations.length}
                                </span>
                            )}
                            {filters.priceRanges.length > 0 && (
                                <span className="bg-blue-400/20 text-blue-300 px-3 py-1 rounded-lg text-sm">
                                    Price Ranges: {filters.priceRanges.length}
                                </span>
                            )}
                            {filters.rating.length > 0 && (
                                <span className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-lg text-sm">
                                    Rating: {filters.rating.map(r => `${r}+`).join(', ')}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Apartment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading || !isClient
                        ? [...Array(6)].map((_, idx) => (
                            <ApartmentCardSkeleton key={`skeleton-${idx}`} />
                        ))
                        : visibleApartments.map((apartment, index) => {
                            const offer = getApartmentOffer(apartment.id);

                            return (
                                <div
                                    key={apartment.id}
                                    className="group relative"
                                >
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500 group-hover:duration-200"></div>

                                    <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl overflow-hidden shadow-2xl border border-neutral-700/50 group-hover:border-teal-400/30 transition-all duration-500 transform group-hover:-translate-y-2">
                                        <ApartmentImage
                                            apartment={apartment}
                                            index={index}
                                            offer={offer}
                                        />

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-white text-xl line-clamp-1">
                                                    {apartment.title || 'Untitled Apartment'}
                                                </h3>
                                                {offer && (
                                                    <div className="flex-shrink-0 ml-2">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur"></div>
                                                            <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                                SAVE {offer.discount_percentage}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center text-gray-300 mb-4">
                                                <FontAwesomeIcon
                                                    icon={solidIcons.faMapMarkerAlt}
                                                    className="h-4 w-4 mr-2 text-teal-400"
                                                />
                                                <span className="text-sm">{apartment.location || apartment.city || 'Location not specified'}</span>
                                            </div>

                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center">
                                                    <div className="flex items-center">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur"></div>
                                                            <div className="relative flex items-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full">
                                                                <FontAwesomeIcon
                                                                    icon={solidIcons.faStar}
                                                                    className="h-3 w-3 mr-1"
                                                                />
                                                                <span className="text-sm font-bold">
                                                                    {apartment.reviews?.rating || '4.5'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="ml-2 text-sm text-gray-400">
                                                            ({apartment.reviews?.totalReviews || 0} reviews)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {Array.isArray(apartment.feature_texts) ? apartment.feature_texts.slice(0, 6).map((feat, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-1.5 bg-neutral-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-700/50"
                                                    >
                                                        <span className="text-xs text-gray-300 capitalize">
                                                            {feat}
                                                        </span>
                                                    </div>
                                                )) : null}
                                            </div>

                                            <button
                                                onClick={() => apartment.id && router.push(`/booking/${apartment.id}`)}
                                                className="w-full group relative overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center shadow-lg hover:shadow-xl"
                                                disabled={!apartment.id}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                <span className="relative z-10 font-bold text-black text-lg flex items-center gap-2">
                                                    Book now
                                                    {offer && (
                                                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full">
                                                            -{offer.discount_percentage}%
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* No Results */}
                {isClient && !loading && filteredApartments.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-10 border border-neutral-700/50 backdrop-blur-sm max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon
                                    icon={solidIcons.faSearch}
                                    className="h-10 w-10 text-teal-400"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">No apartments found</h3>
                            <p className="text-gray-400 mb-6">
                                {searchQuery
                                    ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                                    : "No apartments match your current filters. Try adjusting your criteria."}
                            </p>
                            <button
                                onClick={resetFilters}
                                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-neutral-900 font-bold rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
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