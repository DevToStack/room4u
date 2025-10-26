import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

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
        
        connection = await pool.getConnection();

        let whereClause = 'WHERE b.user_id = ?';
        const params = [userId];

        if (status !== 'all') {
            whereClause += ' AND p.status = ?';
            params.push(status);
        }

        // ✅ Use escaped LIMIT and OFFSET instead of placeholders
        const [payments] = await connection.execute(`
            SELECT 
                p.id,
                p.booking_id,
                p.amount,
                p.method,
                p.status,
                p.paid_at,
                p.razorpay_payment_id AS gatewayId,
                p.refund_id,
                p.refund_time,
                a.title AS apartment_title,
                b.start_date,
                b.end_date
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN apartments a ON b.apartment_id = a.id
            ${whereClause}
            ORDER BY p.paid_at DESC
            LIMIT ${connection.escape(Number(limit))} OFFSET ${connection.escape(Number(offset))}
        `, params);

        // ✅ Count total
        const [totalCount] = await connection.execute(`
            SELECT COUNT(*) AS total
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            ${whereClause}
        `, params);

        connection.release();

        return NextResponse.json({
            payments,
            pagination: {
                page,
                limit,
                total: totalCount[0]?.total || 0,
                totalPages: Math.ceil((totalCount[0]?.total || 0) / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        if (connection) connection.release();
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
