import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";
import { verifyAdmin } from "@/lib/adminAuth";
import { parseCookies } from "@/lib/cookies";

// -------------------- GET single user with complete details --------------------
export async function GET(request, { params }) {
    try {
        const cookies = parseCookies(request.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Admin authentication
        const { valid, error } = await verifyAdmin(token);
        if (!valid) return NextResponse.json({ error }, { status: 401 });

        const { id } = await params; // <-- removed await

        // Get user basic info
        const userResult = await query(
            `SELECT 
         id, name, email, alternate_email, phone_number, alternate_phone,
         role, created_at
       FROM users 
       WHERE id = ?`,
            [id]
        );

        if (userResult.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userResult[0];

        // Get user's bookings with apartment details
        const bookings = await query(
            `SELECT 
         b.id, b.start_date, b.end_date, b.status, b.created_at AS booking_date,
         b.expires_at, a.title AS apartment_title, a.location AS apartment_location,
         a.price_per_night, DATEDIFF(b.end_date, b.start_date) AS nights,
         (a.price_per_night * DATEDIFF(b.end_date, b.start_date)) AS total_amount
       FROM bookings b
       LEFT JOIN apartments a ON b.apartment_id = a.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
            [id]
        );

        // Get user's payments (safe if user has no bookings)
        const payments = await query(
            `SELECT 
         p.id, p.amount, p.status, p.method, p.paid_at, p.razorpay_payment_id,
         p.refund_id, p.refund_time, b.id AS booking_id, a.title AS apartment_title
       FROM payments p
       INNER JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN apartments a ON b.apartment_id = a.id
       WHERE b.user_id = ?
       ORDER BY p.paid_at DESC`,
            [id]
        );

        // Get user's reviews
        const reviews = await query(
            `SELECT 
         r.id, r.rating, r.comment, r.created_at AS review_date, a.title AS apartment_title
       FROM reviews r
       LEFT JOIN apartments a ON r.apartment_id = a.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
            [id]
        );

        // Get user's sessions
        const sessions = await query(
            `SELECT id, ip_address, user_agent, created_at, expires_at
       FROM sessions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
            [id]
        );

        // Get user's recent activity
        const activities = await query(
            `SELECT id, message, date
       FROM user_activity
       WHERE user_id = ?
       ORDER BY date DESC
       LIMIT 10`,
            [id]
        );

        // Get statistics in one query
        const statsResult = await query(
            `SELECT 
         COUNT(DISTINCT b.id) AS total_bookings,
         COUNT(DISTINCT p.id) AS total_payments,
         COUNT(DISTINCT r.id) AS total_reviews,
         COALESCE(SUM(CASE WHEN p.status='paid' THEN p.amount ELSE 0 END),0) AS total_spent,
         COALESCE(AVG(r.rating),0) AS avg_rating
       FROM users u
       LEFT JOIN bookings b ON u.id = b.user_id
       LEFT JOIN payments p ON b.id = p.booking_id
       LEFT JOIN reviews r ON u.id = r.user_id
       WHERE u.id = ?`,
            [id]
        );

        const statistics = statsResult[0];

        // Return fully structured data with defaults
        return NextResponse.json({
            user: { ...user, statistics },
            bookings: bookings || [],
            payments: payments || [],
            reviews: reviews || [],
            sessions: sessions || [],
            activities: activities || [],
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }
}

// -------------------- PUT - Update user --------------------
export async function PUT(request, { params }) {
    try {
        const cookies = parseCookies(request.headers.get("cookie"));
        const token = cookies.token;

        const { valid, error } = await verifyAdmin(token);
        if (!valid) return NextResponse.json({ error }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { name, email, alternate_email, phone_number, alternate_phone, role } = body;

        // ✅ Basic validation
        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        // Check if user exists
        const [existingUsers] = await query('SELECT id FROM users WHERE id = ?', [id]);
        if (existingUsers.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update user
        await query(
            `UPDATE users 
       SET name = ?, email = ?, alternate_email = ?, phone_number = ?, alternate_phone = ?, role = ?
       WHERE id = ?`,
            [name, email, alternate_email, phone_number, alternate_phone, role, id]
        );

        // Log activity
        await query(
            `INSERT INTO user_activity (user_id, message) VALUES (?, ?)`,
            [id, `User profile updated by admin`]
        );

        return NextResponse.json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// -------------------- DELETE - Delete user --------------------
export async function DELETE(request, { params }) {
    try {
        const cookies = parseCookies(request.headers.get("cookie"));
        const token = cookies.token;

        const { valid, error } = await verifyAdmin(token);
        if (!valid) return NextResponse.json({ error }, { status: 401 });

        const { id } = await params;

        // Check if user exists
        const [existingUsers] = await query('SELECT id FROM users WHERE id = ?', [id]);
        if (existingUsers.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete user (ensure DB has CASCADE constraints)
        await query('DELETE FROM users WHERE id = ?', [id]);

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
