import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyAdmin } from '@/lib/adminAuth';

// ✅ Cookie parser
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, v] = c.trim().split('=');
            return [k, decodeURIComponent(v)];
        })
    );
}

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const cookieHeader = request.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }
        const bookingQuery = `
            SELECT 
                b.*,
                u.name AS user_name,
                u.email AS user_email,
                u.phone AS user_phone,
                a.title AS apartment_title,
                a.description AS apartment_description,
                a.address AS apartment_address,
                a.city AS apartment_city,
                a.price_per_night,
                a.images AS apartment_images,
                p.amount AS paid_amount,
                p.status AS payment_status,
                p.method AS payment_method,
                p.paid_at,
                p.razorpay_payment_id,
                p.refund_id,
                p.refund_time,
                DATEDIFF(b.end_date, b.start_date) AS total_nights,
                (DATEDIFF(b.end_date, b.start_date) * a.price_per_night) AS total_amount
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN apartments a ON b.apartment_id = a.id
            LEFT JOIN payments p ON b.id = p.booking_id
            WHERE b.id = ?
        `;

        const bookings = await query(bookingQuery, [id]);

        if (bookings.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: bookings[0],
        });

    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching booking' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        const cookieHeader = request.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }
        // Check if booking exists
        const bookings = await query('SELECT * FROM bookings WHERE id = ?', [id]);

        if (bookings.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Delete related payments first (foreign key constraints)
        await query('DELETE FROM payments WHERE booking_id = ?', [id]);

        // Delete booking
        await query('DELETE FROM bookings WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Booking deleted successfully',
        });

    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json(
            { success: false, message: 'Error deleting booking' },
            { status: 500 }
        );
    }
}
