'use client';
import { useState, useEffect } from 'react';
import ApartmentsManager from '@/app/admin/components/apartment/ApartmentManagement';

export default function ApartmentsPage() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchApartments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/apartments', {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setApartments(data.apartments || []);
            }
        } catch (err) {
            console.error('Failed to fetch apartments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApartments();
    }, []);

    return (
        <ApartmentsManager
            apartments={apartments}
            loading={loading}
            onRefresh={fetchApartments}
        />
    );
}