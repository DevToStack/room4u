"use client";
import { useState, useEffect } from 'react';

/**
 * Utility to normalize apartment_ids into an array of numbers.
 * Supports: null, array, JSON string, comma-separated string.
 */
function normalizeApartmentIds(apartment_ids) {
    if (apartment_ids === null) return null; // Global offer

    // Already an array
    if (Array.isArray(apartment_ids)) return apartment_ids.map(Number);

    // Try JSON.parse
    if (typeof apartment_ids === "string") {
        try {
            const parsed = JSON.parse(apartment_ids);
            if (Array.isArray(parsed)) return parsed.map(Number);
        } catch { }

        // Fallback: comma separated string → "1,2,3"
        return apartment_ids
            .split(',')
            .map(id => Number(id.trim()))
            .filter(n => !isNaN(n));
    }

    return null;
}

export function useOffers(apartmentId = null) {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('/api/offers');
                if (!response.ok) throw new Error('Failed to fetch offers');

                const data = await response.json();

                if (data.success) {
                    let filtered = data.offers || [];

                    if (apartmentId) {
                        filtered = filtered.filter(offer => {
                            const ids = normalizeApartmentIds(offer.apartment_ids);

                            if (ids === null) return true; // global offer

                            return ids.includes(Number(apartmentId));
                        });
                    }

                    setOffers(filtered);
                }
            } catch (err) {
                console.error('Error fetching offers:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [apartmentId]);

    return { offers, loading, error };
}

/**
 * Calculates the best discounted price for an apartment.
 */
export function applyOffer(price, offers, apartmentId = null) {
    if (!offers || offers.length === 0 || price === 0) return price;

    const now = new Date();

    const applicable = offers.filter(offer => {
        if (offer.is_active !== 1) return false;

        const from = new Date(offer.valid_from);
        const to = new Date(offer.valid_until);
        if (now < from || now > to) return false;

        const ids = normalizeApartmentIds(offer.apartment_ids);

        // global offer
        if (ids === null) return true;

        // apartment specific
        return ids.includes(Number(apartmentId));
    });

    if (applicable.length === 0) return price;

    // best (highest %) discount
    applicable.sort((a, b) => Number(b.discount_percentage) - Number(a.discount_percentage));

    const best = applicable[0];

    const discount = price * (Number(best.discount_percentage) / 100);
    const finalPrice = price - discount;

    return Math.max(finalPrice, 0);
}

/**
 * Return all valid offers for display.
 */
export function getApplicableOffers(offers, apartmentId = null) {
    if (!offers || offers.length === 0) return [];

    const now = new Date();

    return offers.filter(offer => {
        if (offer.is_active !== 1) return false;

        const from = new Date(offer.valid_from);
        const to = new Date(offer.valid_until);
        if (now < from || now > to) return false;

        const ids = normalizeApartmentIds(offer.apartment_ids);

        if (ids === null) return true; // global offer
        if (!apartmentId) return true; // no specific apartment requested

        return ids.includes(Number(apartmentId));
    });
}
