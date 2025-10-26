import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function GET() {
    try {
        const stats = await query(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as totalRefunds,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as successfulPayments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failedPayments,
        COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refundedPayments
      FROM payments
      WHERE paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

        // Recent payments for activity
        const recentPayments = await query(`
      SELECT 
        p.*,
        u.name as user_name,
        a.title as apartment_title
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN apartments a ON b.apartment_id = a.id
      ORDER BY p.paid_at DESC
      LIMIT 5
    `);

        // Monthly revenue data
        const monthlyRevenue = await query(`
      SELECT 
        DATE_FORMAT(paid_at, '%Y-%m') as month,
        SUM(amount) as revenue,
        COUNT(*) as payment_count
      FROM payments 
      WHERE status = 'paid' 
        AND paid_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
      ORDER BY month
    `);

        return NextResponse.json({
            overview: stats[0],
            recentPayments,
            monthlyRevenue
        });
    } catch (error) {
        console.error('Error fetching payment stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment statistics' },
            { status: 500 }
        );
    }
}