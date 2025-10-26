import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const status = searchParams.get('status');

        let whereConditions = [];
        let queryParams = [];

        if (status && status !== 'all') {
            whereConditions.push('p.status = ?');
            queryParams.push(status);
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

        const payments = await query(`
      SELECT 
        p.id,
        p.razorpay_payment_id,
        p.amount,
        p.status,
        p.method,
        p.paid_at,
        p.refund_id,
        p.refund_time,
        u.name as user_name,
        u.email as user_email,
        a.title as apartment_title,
        b.id as booking_id,
        b.start_date,
        b.end_date
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN apartments a ON b.apartment_id = a.id
      ${whereClause}
      ORDER BY p.paid_at DESC
    `, queryParams);

        // Convert to CSV
        const headers = [
            'Payment ID',
            'Razorpay ID',
            'Amount',
            'Status',
            'Method',
            'Paid At',
            'Refund ID',
            'Refund Time',
            'User Name',
            'User Email',
            'Apartment',
            'Booking ID',
            'Start Date',
            'End Date'
        ];

        const csvData = payments.map(payment => [
            payment.id,
            payment.razorpay_payment_id || '',
            payment.amount,
            payment.status,
            payment.method,
            new Date(payment.paid_at).toLocaleString(),
            payment.refund_id || '',
            payment.refund_time ? new Date(payment.refund_time).toLocaleString() : '',
            payment.user_name,
            payment.user_email,
            payment.apartment_title,
            payment.booking_id,
            payment.start_date,
            payment.end_date
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.csv"`
            }
        });
    } catch (error) {
        console.error('Error exporting payments:', error);
        return NextResponse.json(
            { error: 'Failed to export payments' },
            { status: 500 }
        );
    }
}