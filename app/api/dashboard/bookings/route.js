// ✅ app/api/dashboard/bookings/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { updateBookingStatus } from '@/lib/updateBookingStatus';

function safeGuestDetails(value) {
    // If value is already an object or array → return as-is
    if (typeof value === "object" && value !== null) return value;

    // If value is null/empty → return empty array
    if (!value) return [];

    // If value is a string → try parsing
    try {
        return JSON.parse(value);
    } catch (e) {
        console.warn("⚠ Invalid guest_details JSON:", value);
        return [];
    }
}

export async function GET(request) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const search = searchParams.get('search') || '';
        const page = Number.parseInt(searchParams.get('page') || '1', 10);
        const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
        const offset = (page - 1) * limit;

        const safeLimit = Math.max(1, Number(limit) || 10);
        const safeOffset = Math.max(0, Number(offset) || 0);

        const cookieStore = await cookies();
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
        connection = await pool.getConnection();

        // Dynamic WHERE
        let whereClause = 'WHERE b.user_id = ?';
        const params = [userId];

        if (status !== 'all') {
            whereClause += ' AND b.status = ?';
            params.push(status);
        }

        if (search) {
            whereClause += ' AND (a.title LIKE ? OR u.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const finalParams = [...params, safeLimit, safeOffset];

        // === MAIN QUERY (WITH GUEST DETAILS) ===
        const [bookings] = await connection.query(
            `
            SELECT 
                b.id,
                b.status,
                a.title AS apartment,
                a.price_per_night as price,
                u.name AS guestName,
                u.email AS guestEmail,
                b.start_date AS checkIn,
                b.end_date AS checkOut,
                b.nights,
                b.guests,
                b.total_amount AS total,
                p.status AS paymentStatus,
                b.created_at,
                b.guest_details  -- <-- ✅ return guest details JSON
            FROM bookings b
            JOIN apartments a ON b.apartment_id = a.id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN payments p ON p.booking_id = b.id
            ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
            `,
            finalParams
        );

        // Convert guest_details from JSON string → JS object
        const formattedBookings = bookings.map(b => ({
            ...b,
            guest_details: safeGuestDetails(b.guest_details)
        }));
        await updateBookingStatus()
        // === COUNT QUERY ===
        const [totalCount] = await connection.query(
            `
            SELECT COUNT(*) as total
            FROM bookings b
            JOIN apartments a ON b.apartment_id = a.id
            JOIN users u ON b.user_id = u.id
            ${whereClause}
            `,
            params
        );

        connection.release();

        return NextResponse.json({
            bookings: formattedBookings,
            pagination: {
                page,
                limit: safeLimit,
                total: totalCount[0]?.total || 0,
                totalPages: Math.ceil((totalCount[0]?.total || 0) / safeLimit)
            }
        });
    } catch (error) {
        console.error('❌ Error fetching bookings:', error);
        if (connection) connection.release();
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

// ===============================================================
// POST — NOW SUPPORTS GUEST DETAILS
// ===============================================================

export async function POST(request) {
    let connection;
    try {
        const body = await request.json();
        const { apartment_id, start_date, end_date, guests, total_amount, guest_details } = body;

        const cookieStore = await cookies();
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

        if (!apartment_id || !start_date || !end_date || !guests || !total_amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        connection = await pool.getConnection();

        const nights = Math.ceil(
            (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
        );

        if (nights <= 0) {
            connection.release();
            return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
        }

        // === INSERT INCLUDING GUEST INFO ===
        const [result] = await connection.execute(
            `
            INSERT INTO bookings 
                (user_id, apartment_id, start_date, end_date, guests, total_amount, nights, status, guest_details)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            `,
            [
                userId,
                apartment_id,
                start_date,
                end_date,
                guests,
                total_amount,
                nights,
                JSON.stringify(guest_details || [])
            ]
        );

        // Log user activity
        await connection.execute(
            `INSERT INTO user_activity (user_id, message) VALUES (?, ?)`,
            [userId, `Created new booking #${result.insertId}`]
        );

        connection.release();

        return NextResponse.json({
            success: true,
            bookingId: result.insertId,
            message: 'Booking created successfully'
        });
    } catch (error) {
        console.error('❌ Error creating booking:', error);
        if (connection) connection.release();
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
