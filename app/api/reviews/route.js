// app/api/user/reviews/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';

export async function GET(req) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { valid, decoded } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const reviews = await query(`
            SELECT
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                a.title AS apartment_name
            FROM reviews r
            JOIN apartments a ON r.apartment_id = a.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [decoded.id]);

        return NextResponse.json({ reviews });

    } catch (err) {
        console.error("GET user reviews error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
