import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE admin_notifications SET is_read = 1 WHERE id = ?`,
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Marked as read" });

    } catch (err) {
        console.error("❌ Mark Read Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
