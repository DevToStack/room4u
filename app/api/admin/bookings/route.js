import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { updateBookingStatus } from '@/lib/updateBookingStatus';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');

        const offset = (page - 1) * limit;

        // build WHERE conditions dynamically
        let whereConditions = ['1=1'];
        let queryParams = [];

        if (status) {
            whereConditions.push('b.status = ?');
            queryParams.push(status);
        }

        if (start_date) {
            whereConditions.push('b.start_date >= DATE(?)');
            queryParams.push(start_date);
        }

        if (end_date) {
            whereConditions.push('b.end_date <= DATE(?)');
            queryParams.push(end_date);
        }

        if (search) {
            whereConditions.push('(u.name LIKE ? OR u.email LIKE ? OR a.title LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // 1. Count total records (NO limit/offset here)
        const countQuery = `
            SELECT COUNT(*) as total
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN apartments a ON b.apartment_id = a.id
            WHERE ${whereClause}
        `;
        const countResult = await query(countQuery, queryParams);
        const total = countResult[0]?.total ?? 0;

        // 2. Fetch paginated bookings
        const bookingsQuery = `
            SELECT 
                b.*,
                u.name as user_name,
                u.email as user_email,
                u.phone_number as user_phone,
                a.title as apartment_title,
                a.price_per_night,
                a.location,
                a.max_guests,
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.address1')) AS apartment_address,
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.city')) AS apartment_city,
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.state')) AS apartment_state,
                JSON_UNQUOTE(JSON_EXTRACT(a.location_data, '$.pincode')) AS apartment_zip,
                p.amount as paid_amount,
                p.status as payment_status,
                p.method as payment_method,
                p.paid_at,
                p.razorpay_payment_id,
                DATEDIFF(b.end_date, b.start_date) as total_nights,
                (DATEDIFF(b.end_date, b.start_date) * a.price_per_night) as total_amount,
                dv.document_type,
                dv.document_data,
                dv.status AS document_status,
                dv.review_message,
                dv.verification_notes
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN user_documents dv ON dv.booking_id = b.id
            LEFT JOIN apartments a ON b.apartment_id = a.id
            LEFT JOIN payments p ON b.id = p.booking_id 
              AND p.id = (SELECT MAX(id) FROM payments WHERE booking_id = b.id)
            WHERE ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        await updateBookingStatus()
        // 👇 Pass ALL params: filters + pagination
        const bookings = await query(bookingsQuery, queryParams);
        const formattedBookings = bookings.map(b => ({
            ...b,
            document: b.document_type
                ? {
                    type: b.document_type,
                    status: b.document_status,
                    data: typeof b.document_data === 'string'
                        ? JSON.parse(b.document_data)
                        : b.document_data,
                    reviewMessage: b.review_message,
                    notes: b.verification_notes
                }
                : null
        }));
        
        return NextResponse.json({
            success: true,
            data: formattedBookings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('❌ Error fetching bookings:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching bookings' },
            { status: 500 }
        );
    }
}
