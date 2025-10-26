// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";
import { verifyAdmin } from "@/lib/adminAuth";
import { parseCookies } from "@/lib/cookies";

// GET all users with complete information
export async function GET(req) {
    try {
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Verify admin
        const { valid, error } = await verifyAdmin(token);
        if (!valid) return NextResponse.json({ error }, { status: 401 });

        const users = await query(`
            SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.alternate_email, 
            u.phone_number, 
            u.alternate_phone,
            u.role,
            u.created_at,
            COUNT(DISTINCT b.id) AS total_bookings,
            COUNT(DISTINCT p.id) AS total_payments,
            COUNT(DISTINCT r.id) AS total_reviews,
            COUNT(DISTINCT s.id) AS active_sessions,
            COALESCE((
                SELECT SUM(amount)
                FROM payments p2
                INNER JOIN bookings b2 ON b2.id = p2.booking_id
                WHERE b2.user_id = u.id AND p2.status='paid'
            ),0) AS total_spent
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id
        LEFT JOIN payments p ON b.id = p.booking_id
        LEFT JOIN reviews r ON u.id = r.user_id
        LEFT JOIN sessions s ON u.id = s.user_id AND s.expires_at > NOW()
        GROUP BY u.id
        ORDER BY u.created_at DESC
        
        `);

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}


// POST - Create new user
export async function POST(req) {
    try {
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Verify admin
        const { valid, error } = await verifyAdmin(token);
        if (!valid) return NextResponse.json({ error }, { status: 401 });

        const { name, email, alternate_email, phone_number, alternate_phone, role = 'guest' } = await req.json();

        const result = await query(
            `INSERT INTO users (name, email, alternate_email, phone_number, alternate_phone, role, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, alternate_email, phone_number, alternate_phone, role, 'temporary_password']
        );

        return NextResponse.json({
            message: "User created successfully",
            userId: result.insertId
        });
    } catch (error) {
        console.error("Error creating user:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
