import { Suspense } from 'react';
import Bookings from '../components/Bookings';

export async function getBookingsData(page = 1, limit = 10) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/bookings?page=${page}&limit=${limit}`,
            { cache: 'no-store' }
        ).then(res => res.json());

        return {
            bookings: response.bookings || [],
            pagination: response.pagination || {},
        };
    } catch (error) {
        console.error('Error fetching bookings data:', error);
        return {
            bookings: [],
            pagination: {},
        };
    }
}
export default async function BookingsPage() {

    return (
        <div className="min-h-screen bg-neutral-900">
            <Suspense fallback={
                <div className="h-screen text-white p-6 flex items-center justify-center"
                    style={{ maxHeight: 'calc(100vh - 96px)' }}
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            }>
                <Bookings />
            </Suspense>
        </div>
    );
}