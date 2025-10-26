import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper"; // your DB helper
import { verifyToken } from '@/lib/jwt';

export async function POST(req) {
    try {
        const { apartment_id, check_in, check_out } = await req.json();

        if (!apartment_id || !check_in || !check_out) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ Extract token from cookies
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verify token using custom helper
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json(
                { error: error || 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // ✅ Extract user_id from decoded token
        const user_id = decoded.id;

        // ✅ Fetch user profile from DB (extra safety check)
        const [user] = await query(
            'SELECT id, name, email, alternate_phone, alternate_email, phone_number, created_at FROM users WHERE id = ?',
            [user_id]
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Check for overlapping bookings (both pending + approved/confirmed)
        const conflicts = await query(
            `SELECT * FROM bookings
       WHERE apartment_id = ?
       AND status IN('pending', 'approved', 'confirmed')
       AND (start_date < ? AND end_date > ?)`,
            [apartment_id, check_out, check_in]
        );

        if (conflicts.length > 0) {
            return NextResponse.json(
                { error: "Apartment not available for selected dates" },
                { status: 409 }
            );
        }

        // 2. Insert booking as "pending"
        const result = await query(
            `INSERT INTO bookings(apartment_id, user_id, start_date, end_date, status)
       VALUES(?, ?, ?, ?, 'pending')`,
            [apartment_id, user_id, check_in, check_out]
        );

        return NextResponse.json({
            success: true,
            booking_id: result.insertId,
            message: "Booking request created. Waiting for admin approval.",
        });
    } catch (err) {
        console.error("❌ Booking API error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
