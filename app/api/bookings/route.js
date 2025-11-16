import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        // 🔒 Read JWT from HTTP-only cookies
        const cookieStore = await cookies();
        const token =  cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // ✅ Verify JWT
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json(
                { success: false, message: 'Invalid token: ' + error },
                { status: 401 }
            );
        }

        const userId = decoded.id; // JWT payload must contain user ID
        const connection = await pool.getConnection();
        // === 0. CLEANUP EXPIRED TEMP BOOKINGS ===
        await connection.query(`
            UPDATE bookings
            SET status = 'expired',
                updated_at = NOW()
            WHERE status = 'pending'
            AND expires_at < NOW();
        `);
        // ✅ Correct query according to schema (added guests)
        const [bookings] = await connection.query(
            `
      SELECT 
        b.id,
        a.title AS apartment_title,
        a.location AS apartment_location,
        b.start_date,
        b.end_date,
        b.status,
        b.total_amount,
        b.nights,
        b.guests,                    -- ✅ included guest count
        b.created_at,
        COALESCE(p.status, 'pending') AS payment_status,
        p.method
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      `,
            [userId]
        );

        connection.release();

        return NextResponse.json({ success: true, bookings }, { status: 200 });
    } catch (err) {
        console.error('❌ Error fetching bookings:', err);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
