// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies(); // ✅ await required in Next.js 13+
        const sessionToken = cookieStore.get('token')?.value;
        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired session', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;
        
        const connection = await pool.getConnection();

        // Quick stats for dashboard cards
        const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM bookings WHERE user_id = ?) as totalBookings,
        (SELECT COUNT(*) FROM bookings WHERE user_id = ? AND status = 'confirmed') as confirmedBookings,
        (SELECT COUNT(*) FROM bookings WHERE user_id = ? AND status = 'pending') as pendingBookings,
        (SELECT SUM(amount) FROM payments p 
         JOIN bookings b ON p.booking_id = b.id 
         WHERE b.user_id = ? AND p.status = 'paid') as totalRevenue,
        (SELECT COUNT(*) FROM bookings 
         WHERE user_id = ? AND start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)) as upcomingCheckins
    `, [userId, userId, userId, userId, userId]);

        connection.release();

        return NextResponse.json(stats[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}