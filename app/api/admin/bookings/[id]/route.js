import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyAdmin } from '@/lib/adminAuth';
import { createNotification } from '@/lib/notification-service';

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

// ✅ Parse JSON column safely
function parseJSONColumn(jsonString) {
    if (!jsonString) return null;
    try {
        return typeof jsonString === 'string'
            ? JSON.parse(jsonString)
            : jsonString;
    } catch (error) {
        console.error('Error parsing JSON column:', error);
        return null;
    }
}

// ✅ Format booking data with guest details
function formatBookingData(booking) {
    if (!booking) return null;

    return {
        ...booking,
        guest_details: parseJSONColumn(booking.guest_details),
        apartment_images: parseJSONColumn(booking.apartment_images),
        total_nights: booking.total_nights || booking.nights,
        total_amount: booking.total_amount || (booking.price_per_night * (booking.nights || 1)),
        // Calculate age for each guest if age is available in guest_details
        guests_info: parseJSONColumn(booking.guest_details)?.map(guest => ({
            ...guest,
            is_adult: guest.age >= 18, // Example business logic
            age_group: guest.age < 12 ? 'child' : guest.age < 18 ? 'teen' : 'adult'
        })) || []
    };
}

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const cookieHeader = request.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        // Verify admin access
        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        // Check if user is admin
        const decoded = await adminCheck;
        if (decoded.decoded?.role !== "admin") {
            return NextResponse.json({ error: "Access Denied" }, { status: 401 });
        }

        // Enhanced booking query with guest_details and all relevant information
        const bookingQuery = `
            SELECT 
                b.id,
                b.user_id,
                b.apartment_id,
                DATE(b.start_date) as start_date,
                DATE(b.end_date) as end_date,
                b.guests,
                b.nights,
                b.total_amount as booking_total,
                b.status as booking_status,
                b.expires_at,
                b.created_at,
                b.updated_at,
                b.guest_details,
                
                -- User details
                u.id as user_id,
                u.name AS user_name,
                u.email AS user_email,
                u.phone AS user_phone,
                u.avatar AS user_avatar,
                
                -- Apartment details
                a.id as apartment_id,
                a.title AS apartment_title,
                a.description AS apartment_description,
                -- JSON extracted fields
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.address1')) AS apartment_address,
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.city')) AS apartment_city,
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.state')) AS apartment_state,
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.pincode')) AS apartment_zip,
                a.price_per_night,
                a.max_guests AS max_guests,
                a.amenities AS apartment_amenities,
                a.images AS apartment_images,
                a.status AS apartment_status,
                
                -- Payment details
                p.id as payment_id,
                p.amount AS paid_amount,
                p.status AS payment_status,
                p.method AS payment_method,
                p.paid_at,
                p.razorpay_payment_id,
                p.refund_id,
                p.refund_time,
                p.refund_amount,
                
                -- Calculations
                DATEDIFF(b.end_date, b.start_date) AS calculated_nights,
                (DATEDIFF(b.end_date, b.start_date) * a.price_per_night) AS calculated_total,
                a.price_per_night * b.guests AS per_night_with_guests,
                
                -- Additional useful info
                CASE 
                    WHEN b.status = 'ongoing' AND CURDATE() BETWEEN b.start_date AND b.end_date THEN 'currently_staying'
                    WHEN b.status = 'confirmed' AND CURDATE() < b.start_date THEN 'upcoming'
                    WHEN b.status = 'confirmed' AND CURDATE() > b.end_date THEN 'completed'
                    WHEN b.status = 'cancelled' THEN 'cancelled'
                    ELSE 'other'
                END AS booking_timeline_status,
                
                CASE
                    WHEN b.guest_details IS NOT NULL AND JSON_LENGTH(b.guest_details) > 0 
                    THEN JSON_LENGTH(b.guest_details)
                    ELSE b.guests
                END AS actual_guests_count

            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN apartments a ON b.apartment_id = a.id
            LEFT JOIN payments p ON b.id = p.booking_id
            WHERE b.id = ?
            LIMIT 1
        `;

        const bookings = await query(bookingQuery, [id]);

        if (bookings.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        const formattedBooking = formatBookingData(bookings[0]);
        return NextResponse.json({
            success: true,
            data: formattedBooking,
            meta: {
                has_guest_details: formattedBooking.guest_details && formattedBooking.guest_details.length > 0,
                guest_count: formattedBooking.guests,
                detailed_guests_count: formattedBooking.guest_details?.length || 0,
                price_breakdown: {
                    per_night: formattedBooking.price_per_night,
                    nights: formattedBooking.nights || formattedBooking.calculated_nights,
                    subtotal: formattedBooking.price_per_night * (formattedBooking.nights || formattedBooking.calculated_nights),
                    total: formattedBooking.total_amount || formattedBooking.booking_total
                }
            }
        });

    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching booking', error: error.message },
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

        // Verify admin access
        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        // Check if user is admin
        const decoded = await adminCheck;
        if (decoded.decoded?.role !== "admin") {
            return NextResponse.json({ error: "Access Denied" }, { status: 401 });
        }

        // Get booking details before deletion for logging/reference
        const bookingDetails = await query(`
            SELECT 
                b.*,
                u.email as user_email,
                a.title as apartment_title,
                p.razorpay_payment_id,
                p.status as payment_status
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN apartments a ON b.apartment_id = a.id
            LEFT JOIN payments p ON b.id = p.booking_id
            WHERE b.id = ?
        `, [id]);

        if (bookingDetails.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        const booking = bookingDetails[0];

        // Check if booking can be deleted (business rules)
        if (booking.booking_status === 'ongoing') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cannot delete an ongoing booking. Please cancel instead.'
                },
                { status: 400 }
            );
        }

        // If payment was successful, consider refund logic
        if (booking.payment_status === 'success' || booking.payment_status === 'completed') {
            // You might want to handle refunds here or prevent deletion
            // For now, we'll just log this information
            console.log(`Deleting booking with successful payment: ${booking.razorpay_payment_id}`);
        }

        // Start transaction for data integrity
        await query('START TRANSACTION');

        try {
            // Delete related payments first (foreign key constraints)
            await query('DELETE FROM payments WHERE booking_id = ?', [id]);

            // Delete booking
            const deleteResult = await query('DELETE FROM bookings WHERE id = ?', [id]);

            // Log the deletion (you could insert into an audit_log table here)
            console.log(`Booking ${id} deleted by admin. Details:`, {
                user_email: booking.user_email,
                apartment_title: booking.apartment_title,
                guest_details: parseJSONColumn(booking.guest_details),
                total_amount: booking.total_amount,
                status: booking.status
            });

            await createNotification({
                type: 'booking',
                title: 'Document Approved',
                content: `The user ${user.name} has been cancelled booking during booking confirmation.`,
                userId: adminId,
                bookingId: id,
                meta: {
                    status: 'done',
                },
                level: 'info'
            });

            await query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Booking deleted successfully',
                deleted_booking_id: id,
                meta: {
                    had_payment: !!booking.razorpay_payment_id,
                    payment_status: booking.payment_status,
                    guest_count: booking.guests,
                    total_amount: booking.total_amount
                }
            });

        } catch (transactionError) {
            await query('ROLLBACK');
            throw transactionError;
        }

    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error deleting booking',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// Optional: Add PATCH/PUT endpoint to update booking (including guest_details)
export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        const cookieHeader = request.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        // Verify admin access
        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const decoded = await adminCheck;
        if (decoded.decoded?.role !== "admin") {
            return NextResponse.json({ error: "Access Denied" }, { status: 401 });
        }

        // Check if booking exists
        const existingBooking = await query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (existingBooking.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Prepare update fields
        const allowedFields = ['status', 'guests', 'total_amount', 'guest_details', 'expires_at'];
        const updates = {};
        const values = [];

        // Build dynamic update query
        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key)) {
                // Handle JSON field specifically
                if (key === 'guest_details' && value) {
                    updates[key] = '?';
                    values.push(JSON.stringify(value));
                } else {
                    updates[key] = '?';
                    values.push(value);
                }
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, message: 'No valid fields to update' },
                { status: 400 }
            );
        }

        // Add id to values
        values.push(id);

        // Build and execute update query
        const setClause = Object.keys(updates)
            .map(field => `${field} = ${updates[field]}`)
            .join(', ');

        const updateQuery = `UPDATE bookings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

        await query(updateQuery, values);

        // Fetch updated booking
        const updatedBooking = await query('SELECT * FROM bookings WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Booking updated successfully',
            data: formatBookingData(updatedBooking[0])
        });

    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json(
            { success: false, message: 'Error updating booking' },
            { status: 500 }
        );
    }
}