// app/api/dashboard/bookings/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        // === 2. AUTHENTICATION ===
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

        const [booking] = await connection.execute(`
      SELECT 
        b.*,
        a.title as apartment_title,
        a.location as apartment_location,
        a.price_per_night,
        u.name as guest_name,
        u.email as guest_email,
        u.phone_number as guest_phone,
        p.amount,
        p.method as payment_method,
        p.paid_at,
        p.razorpay_payment_id,
        p.refund_id,
        p.refund_time
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.id = ? AND b.user_id = ?
    `, [id, userId]);

        connection.release();

        if (booking.length === 0) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(booking[0]);
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { error: 'Failed to fetch booking' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { start_date, end_date, guests } = body;
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
        const connection = await pool.getConnection();

        try {
            // Verify booking belongs to user and get apartment_id
            const [existing] = await connection.execute(
                `SELECT id, apartment_id, start_date as current_start, end_date as current_end 
                 FROM bookings WHERE id = ? AND user_id = ?`,
                [id, userId]
            );

            if (existing.length === 0) {
                return NextResponse.json(
                    { error: 'Booking not found' },
                    { status: 404 }
                );
            }

            const booking = existing[0];
            const apartmentId = booking.apartment_id;

            let updateFields = [];
            let updateValues = [];

            // Validate and add fields
            if (start_date) {
                updateFields.push('start_date = ?');
                updateValues.push(start_date);
            }
            if (end_date) {
                updateFields.push('end_date = ?');
                updateValues.push(end_date);
            }
            if (guests) {
                updateFields.push('guests = ?');
                updateValues.push(guests);
            }

            // If dates are being updated, check for conflicts
            if (start_date || end_date) {
                const finalStartDate = start_date || booking.current_start;
                const finalEndDate = end_date || booking.current_end;

                // Validate date order
                if (new Date(finalStartDate) >= new Date(finalEndDate)) {
                    return NextResponse.json(
                        { error: 'End date must be after start date' },
                        { status: 400 }
                    );
                }

                // Check for date conflicts with other bookings (excluding current booking)
                const [conflicts] = await connection.execute(
                    `SELECT id, start_date, end_date 
                     FROM bookings 
                     WHERE apartment_id = ? 
                     AND id != ? 
                     AND status IN ('confirmed', 'pending', 'paid')
                     AND (
                         (start_date BETWEEN ? AND DATE_SUB(?, INTERVAL 1 DAY)) OR
                         (end_date BETWEEN DATE_ADD(?, INTERVAL 1 DAY) AND ?) OR
                         (? BETWEEN start_date AND DATE_SUB(end_date, INTERVAL 1 DAY)) OR
                         (? BETWEEN DATE_ADD(start_date, INTERVAL 1 DAY) AND end_date)
                     )`,
                    [
                        apartmentId,
                        id, // exclude current booking
                        finalStartDate, finalEndDate, // first condition
                        finalStartDate, finalEndDate, // second condition  
                        finalStartDate, // third condition
                        finalEndDate // fourth condition
                    ]
                );

                if (conflicts.length > 0) {
                    return NextResponse.json(
                        {
                            error: 'Date conflict: The selected dates are already booked',
                            code: 'DATE_CONFLICT',
                            conflictingDates: {
                                requested: { start: finalStartDate, end: finalEndDate },
                                conflicts: conflicts.map(c => ({
                                    id: c.id,
                                    start: c.start_date,
                                    end: c.end_date
                                }))
                            }
                        },
                        { status: 409 }
                    );
                }
            }

            // Validate guests count
            if (guests) {
                const [apartment] = await connection.execute(
                    'SELECT max_guests FROM apartments WHERE id = ?',
                    [apartmentId]
                );
                if (apartment.length > 0 && guests > apartment[0].max_guests) {
                    return NextResponse.json(
                        { error: `Number of guests exceeds maximum capacity of ${apartment[0].max_guests}` },
                        { status: 400 }
                    );
                }
            }

            if (updateFields.length > 0) {
                // Add WHERE clause parameters
                updateValues.push(id, userId);

                await connection.execute(
                    `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
                    updateValues
                );

                // Log activity
                await connection.execute(
                    'INSERT INTO user_activity (user_id, message) VALUES (?, ?)',
                    [userId, `Updated booking #${id}`]
                );
            }

            return NextResponse.json({ success: true, message: 'Booking updated successfully' });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
        );
    }
}