import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const booking_id = searchParams.get("booking_id");
        const user_id = searchParams.get("user_id");
        const type = searchParams.get("type");
        const unread = searchParams.get("unread");
        const start_date = searchParams.get("start_date");
        const end_date = searchParams.get("end_date");

        let query = `SELECT * FROM admin_notifications WHERE 1=1`;
        let params = [];

        // FILTER: Booking ID
        if (booking_id) {
            query += ` AND booking_id = ?`;
            params.push(booking_id);
        }

        // FILTER: User ID
        if (user_id) {
            query += ` AND user_id = ?`;
            params.push(user_id);
        }

        // FILTER: Notification Type
        if (type) {
            query += ` AND type = ?`;
            params.push(type);
        }

        // FILTER: Unread Only
        if (unread === "true") {
            query += ` AND is_read = FALSE`;
        }

        // FILTER: Date range
        if (start_date && end_date) {
            query += ` AND created_at BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else if (start_date) {
            query += ` AND created_at >= ?`;
            params.push(start_date);
        } else if (end_date) {
            query += ` AND created_at <= ?`;
            params.push(end_date);
        }

        query += ` ORDER BY created_at DESC`;

        const [rows] = await pool.query(query, params);

        return NextResponse.json({ success: true, notifications: rows });
    } catch (error) {
        console.error("❌ Filter Notification Error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
