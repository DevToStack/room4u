'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import NextImage from "next/image";
import Link from 'next/link';

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



export default function FeaturedApartments() {
    const router = useRouter();
    const [apartments, setApartments] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
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
                    console.log(offersData.offers)
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
    

    // Featured apartments (first 3)
    const featuredApartments = useMemo(() => {
        if (!Array.isArray(apartments)) return [];
        return apartments.slice(0, 3);
    }, [apartments]);

    return (
        <section className="relative w-full bg-neutral-950 py-16 sm:py-20 lg:py-24 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-400/5 to-emerald-400/5 rounded-full blur-3xl"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.1)_25px,transparent_26px)] bg-[length:26px_100%]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_24px,rgba(255,255,255,0.1)_25px,transparent_26px)] bg-[length:100%_26px]"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block relative mb-6">
                        <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur opacity-30"></div>
                        <h2 className="relative text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Featured Apartments
                        </h2>
                    </div>
                    <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
                        Experience luxury living in our handpicked premium apartments
                    </p>
                </div>

                {/* Apartment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {loading || !isClient
                        ? [...Array(3)].map((_, idx) => (
                            <ApartmentCardSkeleton key={`skeleton-${idx}`} />
                        ))
                        : featuredApartments.map((apartment, index) => {
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
                                                <span className="text-sm">{apartment.location || 'Location not specified'}</span>
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
                                                {Array.isArray(apartment.feature_texts) ? apartment.feature_texts.slice(0, 3).map((feat, idx) => (
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
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* View All Apartments Link */}
                {isClient && !loading && apartments.length >= 3 && (
                    <div className="text-center mt-16">
                        <Link
                            href="/apartments"
                            className="group relative inline-flex items-center gap-3 border-2 border-teal-400/20 hover:border-teal-400/40 text-teal-400 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-neutral-900/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <span className="relative z-10 text-sm font-bold">Explore All Properties</span>
                            <FontAwesomeIcon
                                icon={solidIcons.faChevronRight}
                                className="relative z-10 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                            />
                        </Link>
                    </div>
                )}

                {/* No Apartments Message */}
                {isClient && !loading && featuredApartments.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-10 border border-neutral-700/50 backdrop-blur-sm max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon
                                    icon={solidIcons.faHome}
                                    className="h-10 w-10 text-teal-400"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">No Featured Apartments</h3>
                            <p className="text-gray-400">
                                Check back soon for our exclusive collection of premium apartments.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}