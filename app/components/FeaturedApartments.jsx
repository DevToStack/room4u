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
        <div className="bg-neutral-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg animate-pulse group">
            <div className="h-56 bg-neutral-700/50 relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-neutral-600 px-3 py-1 rounded-full text-sm font-semibold shadow w-20 h-6"></div>
            </div>
            <div className="p-4 sm:p-6">
                <div className="h-6 bg-neutral-700/50 rounded mb-3 w-3/4"></div>
                <div className="flex items-center mb-3">
                    <div className="h-4 w-4 bg-neutral-700/50 rounded mr-2"></div>
                    <div className="h-4 bg-neutral-700/50 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-4 w-4 bg-neutral-700/50 rounded mr-1"></div>
                        <div className="h-4 bg-neutral-700/50 rounded w-8 ml-1"></div>
                        <div className="h-4 bg-neutral-700/50 rounded w-12 ml-1"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50 flex-wrap">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                            <div className="h-4 w-4 bg-neutral-700/50 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="w-full mt-6 bg-neutral-700/50 h-12 rounded-xl"></div>
            </div>
        </div>
    );
};

// Updated ApartmentImage with new design
const ApartmentImage = ({ apartment, index }) => {
    const [imageError, setImageError] = useState(false);

    if (!apartment?.image || imageError) {
        return (
            <div className="h-56 bg-neutral-700/50 relative flex items-center justify-center group-hover:bg-neutral-600/50 transition-colors duration-300">
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
        <div className="h-56 bg-neutral-700/50 relative overflow-hidden">
            <NextImage
                src={apartment.image}
                alt={apartment.title || 'Apartment'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
                priority={index <= 2}
            />
            <div className="absolute top-3 right-3 bg-teal-400/90 px-3 py-1 rounded-full text-sm font-semibold shadow text-neutral-900">
                ${apartment.price}/night
            </div>
            <button className="absolute top-3 left-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <FontAwesomeIcon icon={solidIcons.faHeart} className="text-white text-sm" />
            </button>
        </div>
    );
};

export default function FeaturedApartments() {
    const router = useRouter();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
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
                setApartments(Array.isArray(data) ? data.slice(0, 3) : []);
            } catch (err) {
                setApartments([]);
            } finally {
                setLoading(false);
            }
        }
        fetchApartments();
    }, []);

    // Featured apartments (first 3)
    const featuredApartments = useMemo(() => {
        if (!Array.isArray(apartments)) return [];
        return apartments.slice(0, 3);
    }, [apartments]);

    return (
        <section className="relative w-full bg-neutral-900 py-16 sm:py-20 lg:py-24 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 bg-teal-400/10 rounded-full blur-2xl sm:blur-3xl opacity-100"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-teal-400/5 rounded-full blur-2xl sm:blur-3xl opacity-100"></div>
                <div className="absolute -bottom-16 -left-16 w-40 h-40 sm:w-60 sm:h-60 bg-teal-400/5 rounded-full blur-2xl sm:blur-3xl opacity-100"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:50px_50px] lg:bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="overflow-hidden">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 opacity-100 translate-y-0">
                            Featured <span className="text-teal-400">Apartments</span>
                        </h2>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto opacity-100 translate-y-0">
                            Handpicked apartments for an unforgettable stay
                        </p>
                    </div>
                </div>

                {/* Apartment Grid - Always 3 cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {loading || !isClient
                        ? [...Array(3)].map((_, idx) => (
                            <ApartmentCardSkeleton key={`skeleton-${idx}`} />
                        ))
                        : featuredApartments.map((apartment, index) => (
                            <div
                                key={apartment.id}
                                className="bg-neutral-800/30 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50 hover:border-teal-400/50 transition-all duration-500 transform hover:scale-105 cursor-pointer group relative overflow-hidden opacity-100 translate-y-0"
                            >
                                {/* Teal Background Effect on Hover */}
                                <div className="absolute inset-0 bg-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10">
                                    <ApartmentImage
                                        apartment={apartment}
                                        index={index}
                                    />

                                    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                                        <h3 className="font-bold text-white text-lg sm:text-xl">
                                            {apartment.title || 'Untitled Apartment'}
                                        </h3>

                                        <div className="flex items-center text-gray-300">
                                            <FontAwesomeIcon
                                                icon={solidIcons.faMapMarkerAlt}
                                                className="h-4 w-4 mr-2 text-teal-400"
                                            />
                                            <span className="text-sm sm:text-base">{apartment.location || 'Location not specified'}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <FontAwesomeIcon
                                                    icon={solidIcons.faStar}
                                                    className="h-4 w-4 text-teal-400"
                                                />
                                                <span className="ml-2 text-sm sm:text-base font-semibold text-white">
                                                    {apartment.reviews?.rating || 0}
                                                </span>
                                                <span className="ml-1 text-sm sm:text-base text-gray-400">
                                                    ({apartment.reviews?.totalReviews || 0})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50 flex-wrap">
                                            {Array.isArray(apartment.features) ? apartment.features.slice(0, 4).map((feat, idx) => (
                                                <div key={idx} className="flex items-center gap-1 text-gray-300">
                                                    <FontAwesomeIcon
                                                        icon={solidIcons[feat]}
                                                        className="w-4 h-4 text-teal-400"
                                                    />
                                                </div>
                                            )) : null}
                                        </div>

                                        <button
                                            onClick={() => apartment.id && router.push(`/booking/${apartment.id}`)}
                                            className="w-full mt-4 sm:mt-6 group relative bg-teal-400 hover:bg-teal-500 text-neutral-900 font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-xl"
                                            disabled={!apartment.id}
                                        >
                                            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <span className="relative z-10 font-semibold text-sm sm:text-base">Book Now</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {/* View All Apartments Link */}
                {isClient && !loading && apartments.length >= 3 && (
                    <div className="text-center mt-12 sm:mt-16 opacity-100 translate-y-0">
                        <Link
                            href="/apartments"
                            className="group relative border border-teal-400 hover:border-teal-500 text-teal-400 font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm mx-auto w-fit"
                        >
                            <div className="absolute inset-0 bg-teal-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 text-sm sm:text-base">View All Apartments</span>
                            <FontAwesomeIcon
                                icon={solidIcons.faArrowRight}
                                className="relative z-10 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                            />
                        </Link>
                    </div>
                )}

                {/* No Apartments Message */}
                {isClient && !loading && featuredApartments.length === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-neutral-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
                            <FontAwesomeIcon
                                icon={solidIcons.faHome}
                                className="h-16 w-16 text-gray-400 mb-4"
                            />
                            <h3 className="text-xl font-semibold text-white mb-2">No Featured Apartments</h3>
                            <p className="text-gray-300">
                                Check back later for our handpicked featured apartments.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}