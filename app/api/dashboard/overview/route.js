// app/api/dashboard/overview/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const connection = await pool.getConnection();

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

        // Total bookings (last 30 days)
        const [totalBookings] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE user_id = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [userId]);

        // Total payments breakdown
      const [paymentStats] = await connection.execute(`
          SELECT 
            SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) AS paid,
            SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END) AS refunded
          FROM payments p
          JOIN bookings b ON p.booking_id = b.id
          WHERE b.user_id = ?
        `, [userId]);
        

        // Last booking
        const [lastBooking] = await connection.execute(`
      SELECT 
        b.id,
        a.title as apartment,
        b.start_date as checkIn,
        b.end_date as checkOut,
        b.status,
        b.guests,
        p.amount
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 1
    `, [userId]);

        // Next booking
        const [nextBooking] = await connection.execute(`
      SELECT 
        b.id,
        a.title as apartment,
        b.start_date as checkIn,
        DATEDIFF(b.start_date, CURDATE()) as daysUntil
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      WHERE b.user_id = ? 
      AND b.start_date >= CURDATE()
      AND b.status IN ('confirmed', 'paid')
      ORDER BY b.start_date ASC
      LIMIT 1
    `, [userId]);

        // Upcoming check-ins (next 7 days)
        const [upcomingCheckins] = await connection.execute(`
      SELECT 
        b.id,
        a.title as apartment,
        u.name as guestName,
        b.start_date as checkIn,
        b.end_date as checkOut,
        b.nights,
        p.amount,
        DATEDIFF(b.start_date, CURDATE()) <= 2 as dueSoon
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND b.status IN ('confirmed', 'paid')
      ORDER BY b.start_date ASC
    `);

        connection.release();

        const overviewData = {
            totalBookings: totalBookings[0]?.count || 0,
            totalPayments: paymentStats[0]?.paid || 0,
            paidPayments: paymentStats[0]?.paid || 0,
            refundedPayments: paymentStats[0]?.refunded || 0,
            lastBooking: lastBooking[0] || null,
            nextBooking: nextBooking[0] || { daysUntil: 0, apartment: 'No upcoming bookings' },
            upcomingCheckins: upcomingCheckins || []
        };

        return NextResponse.json(overviewData);
    } catch (error) {
        console.error('Error fetching overview data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch overview data' },
            { status: 500 }
        );
    }
}