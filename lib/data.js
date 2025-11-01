import { cookies } from 'next/headers';

// Common function to get auth headers
async function getAuthHeaders() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    return {
        Cookie: `token=${token}`,
    };
}

function getBaseUrl() {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}









// Legacy function for backward compatibility (if needed)
export async function getDashboardData() {
    try {
        const headers = await getAuthHeaders();
        const baseUrl = getBaseUrl();

        const [overviewRes, bookingsRes, paymentsRes, settingsRes, statsRes] = await Promise.all([
            fetch(`${baseUrl}/api/dashboard/overview`, { headers, cache: 'no-store' }).then(res => res.json()),
            fetch(`${baseUrl}/api/dashboard/bookings`, { headers, cache: 'no-store' }).then(res => res.json()),
            fetch(`${baseUrl}/api/dashboard/payments`, { headers, cache: 'no-store' }).then(res => res.json()),
            fetch(`${baseUrl}/api/dashboard/settings`, { headers, cache: 'no-store' }).then(res => res.json()),
            fetch(`${baseUrl}/api/dashboard/stats`, { headers, cache: 'no-store' }).then(res => res.json()),
        ]);

        return {
            overview: overviewRes,
            bookings: bookingsRes,
            payments: paymentsRes,
            settings: settingsRes,
            stats: statsRes,
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            overview: {},
            bookings: { bookings: [], pagination: {} },
            payments: { payments: [], pagination: {} },
            settings: { profile: {}, preferences: {}, activities: [] },
            stats: {},
        };
    }
}