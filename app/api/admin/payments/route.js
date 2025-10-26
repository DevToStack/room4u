import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];

        if (status && status !== 'all') {
            whereConditions.push('p.status = ?');
            queryParams.push(status);
        }

        if (search) {
            whereConditions.push('(u.name LIKE ? OR u.email LIKE ? OR p.razorpay_payment_id LIKE ? OR p.id = ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, isNaN(search) ? 0 : parseInt(search));
        }

        if (startDate) {
            whereConditions.push('DATE(p.paid_at) >= ?');
            queryParams.push(startDate);
        }

        if (endDate) {
            whereConditions.push('DATE(p.paid_at) <= ?');
            queryParams.push(endDate);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Get payments with pagination
        const payments = await query(`
            SELECT 
              p.*,
              b.id as booking_id,
              b.start_date,
              b.end_date,
              b.status as booking_status,
              u.name as user_name,
              u.email as user_email,
              a.title as apartment_title,
              a.price_per_night
            FROM payments p
            LEFT JOIN bookings b ON p.booking_id = b.id
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN apartments a ON b.apartment_id = a.id
            ${whereClause}
            ORDER BY p.paid_at DESC
            LIMIT ${offset}, ${limit}
          `, queryParams);
          

        // Get total count for pagination
        const countResult = await query(`
      SELECT COUNT(*) as total
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      ${whereClause}
    `, queryParams);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            payments,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { action, paymentId, refundAmount, reason } = await request.json();

        if (action === 'refund') {
            // Get payment details
            const payments = await query(
                'SELECT * FROM payments WHERE id = ? AND status = "paid"',
                [paymentId]
            );

            if (payments.length === 0) {
                throw new Error('Payment not found or not eligible for refund');
            }

            const payment = payments[0];

            // Calculate refund amount (full or partial)
            const actualRefundAmount = refundAmount || payment.amount;

            if (actualRefundAmount > payment.amount) {
                throw new Error('Refund amount cannot exceed payment amount');
            }

            // Update payment status
            const refundId = `ref_${Date.now()}`;
            await query(
                `UPDATE payments 
         SET status = 'refunded', 
             refund_id = ?,
             refund_time = NOW(),
             amount = ?
         WHERE id = ?`,
                [refundId, actualRefundAmount, paymentId]
            );

            // Update booking status to cancelled if full refund
            if (actualRefundAmount === payment.amount) {
                await query(
                    'UPDATE bookings SET status = "cancelled" WHERE id = ?',
                    [payment.booking_id]
                );
            }

            // Log refund activity (assuming admin user ID is 1 for now)
            await query(
                'INSERT INTO user_activity (user_id, message) VALUES (?, ?)',
                [1, `Refund processed for payment ${paymentId}. Amount: ${actualRefundAmount}. Reason: ${reason}`]
            );

            return NextResponse.json({
                success: true,
                message: 'Refund processed successfully',
                refundId
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error processing payment action:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process payment action' },
            { status: 500 }
        );
    }
}