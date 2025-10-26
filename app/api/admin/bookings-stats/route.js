import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function GET() {
    try {
        const statsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE booking_id = bookings.id AND status = 'paid') ELSE 0 END) as total_revenue,
        COUNT(DISTINCT user_id) as unique_customers
      FROM bookings
    `;

        const stats = await query(statsQuery);

        // Recent bookings for dashboard
        const recentQuery = `
      SELECT 
        b.*,
        u.name as user_name,
        a.title as apartment_title,
        p.status as payment_status
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN apartments a ON b.apartment_id = a.id
      LEFT JOIN payments p ON b.id = p.booking_id
      ORDER BY b.created_at DESC
      LIMIT 5
    `;

        const recentBookings = await query(recentQuery);

        return NextResponse.json({
            success: true,
            data: {
                overview: stats[0],
                recentBookings,
            },
        });

    } catch (error) {
        console.error('Error fetching booking stats:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error fetching booking statistics',
            },
            { status: 500 }
        );
    }
}