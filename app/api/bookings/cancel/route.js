import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PATCH(req) {
    try {
        const { booking_id } = await req.json();
        const token = cookies().get("token")?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ success: false, error: error || "Invalid token" }, { status: 401 });
        }

        if (!booking_id) {
            return NextResponse.json(
                { success: false, error: "Missing booking_id" },
                { status: 400 }
            );
        }

        // ✅ Ensure user exists
        const [user] = await query(
            "SELECT id FROM users WHERE id = ?",
            [decoded.id]
        );

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // ✅ Validate booking belongs to user
        const [booking] = await query(
            "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
            [booking_id, decoded.id]
        );

        if (!booking) {
            return NextResponse.json(
                { success: false, error: "Booking not found or unauthorized" },
                { status: 404 }
            );
        }

        // ✅ Prevent duplicate cancel
        if (["cancelled", "expired"].includes(booking.status)) {
            return NextResponse.json(
                { success: false, error: `Booking already ${booking.status}` },
                { status: 400 }
            );
        }

        // ✅ Optional: check-in restriction
        if (booking.status === "confirmed") {
            const today = new Date();
            const checkInDate = new Date(booking.start_date);

            if (checkInDate <= today) {
                return NextResponse.json(
                    { success: false, error: "Cannot cancel after check-in" },
                    { status: 400 }
                );
            }
        }

        // ✅ Cancel booking
        await query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [booking_id]);

        return NextResponse.json({
            success: true,
            message: `Booking #${booking_id} cancelled successfully`,
            updatedStatus: "cancelled"
        });

    } catch (err) {
        console.error("❌ Cancel Booking API Error:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
