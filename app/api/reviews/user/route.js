// app/api/reviews/user/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';

export async function GET(req) {
    try {
        // ✅ Read token from cookies
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verify token
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: error || 'Invalid or expired token' }, { status: 401 });
        }

        //fetch user name and id
        const users = await query(`SELECT id, name from users WHERE id = ?`,[decoded.id]);
        // ✅ Fetch reviews by this user
        const reviews = await query(`
            SELECT r.id, r.rating, r.comment, r.created_at
            FROM reviews r
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [decoded.id]);

        return NextResponse.json({ reviews, users });

    } catch (err) {
        console.error('GET user reviews error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
