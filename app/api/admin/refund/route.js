import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

export async function POST(req) {
    try {
        const { booking_id, user_id } = await req.json();

        if (!booking_id || !user_id) {
            return NextResponse.json(
                { error: "Booking ID and User ID required" },
                { status: 400 }
            );
        }

        // ✅ Check booking exists & belongs to user
        const rows = await query(
            `SELECT * FROM bookings WHERE id = ? AND user_id = ?`,
            [booking_id, user_id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Booking not found or unauthorized" },
                { status: 404 }
            );
        }

        const booking = rows[0];

        if (!["pending", "confirmed"].includes(booking.status)) {
            return NextResponse.json(
                { error: "This booking cannot be cancelled" },
                { status: 400 }
            );
        }

        // ✅ Cancel the booking
        await query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
            [booking_id]
        );

        // ✅ If there was a payment, mark refund as pending
        const payments = await query(
            `SELECT * FROM payments WHERE booking_id = ? AND status = 'paid' LIMIT 1`,
            [booking_id]
        );

        if (payments.length > 0) {
            await query(
                `UPDATE payments 
         SET status = 'refund_pending' 
         WHERE id = ?`,
                [payments[0].id]
            );

            // log activity for admin
            await query(
                `INSERT INTO user_activity (user_id, message) VALUES (?, ?)`,
                [user_id, `Requested refund for cancelled booking #${booking_id}`]
            );
        }

        return NextResponse.json({
            success: true,
            message: "Booking cancelled. Refund will be processed by admin.",
        });
    } catch (err) {
        console.error("❌ Cancel Booking API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
