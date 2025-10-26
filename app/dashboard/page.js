// app/dashboard/page.js
import { Suspense } from 'react';
import DashboardClient from './components/DashboardClient';
import { getDashboardData } from '@/lib/data';

export default async function DashboardPage() {
    const initialData = await getDashboardData();

    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
                <DashboardClient initialData={initialData} />
            </Suspense>
        </div>
    );
}