// app/api/dashboard/activity/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;
        
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

        const [activities] = await connection.execute(`
      SELECT message, date
      FROM user_activity
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

        const [totalCount] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM user_activity
      WHERE user_id = ?
    `, [userId]);

        connection.release();

        return NextResponse.json({
            activities,
            pagination: {
                page,
                limit,
                total: totalCount[0]?.total || 0,
                totalPages: Math.ceil(totalCount[0]?.total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}