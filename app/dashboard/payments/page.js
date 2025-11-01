import { Suspense } from 'react';
import Payments from '../components/Payments';

export async function getPaymentsData(page = 1, limit = 10) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/payments?page=${page}&limit=${limit}`,
            { cache: 'no-store' }
        ).then(res => res.json());

        return {
            payments: response.payments || [],
            pagination: response.pagination || {},
        };
    } catch (error) {
        console.error('Error fetching payments data:', error);
        return {
            payments: [],
            pagination: {},
        };
    }
}

export default async function PaymentsPage() {

    return (
        <div className="min-h-screen bg-neutral-900">
            <Suspense fallback={
                <div className="h-screen text-white p-6 flex items-center justify-center"
                    style={{ maxHeight: 'calc(100vh - 96px)' }}
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            }>
                <Payments />
            </Suspense>
        </div>
    );
}