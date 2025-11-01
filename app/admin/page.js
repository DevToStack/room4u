'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardStats from '@/app/admin/components/stats/adminDashboard';

export default function OverviewPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard', {
                    cache: 'no-store',
                    credentials: 'include',
                });

                if (!res.ok) {
                    router.push('/signin');
                    return;
                }
                const data = await res.json();
                setDashboardData(data);
            } catch (err) {
                console.error('Admin dashboard fetch error:', err);
                router.push('/signin');
            }
        };

        fetchDashboardData();
    }, [router]);

    if (!dashboardData) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return <AdminDashboardStats />;
}