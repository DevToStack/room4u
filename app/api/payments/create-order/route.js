import Razorpay from "razorpay";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { booking_id } = await req.json();
    if (!booking_id)
        return Response.json({ success: false, error: "Booking ID missing" });

    const connection = await pool.getConnection();
    try {
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
        
        //check user is exists
        const [user] = await connection.query(`
            SELECT id FROM users WHERE id = ?
        `, [userId]);

        if (user.length === 0) {    
            return NextResponse.json(
                { error: 'User not found', code: 'USER_NOT_FOUND' },
                { status: 404 }
            );
        }

        const [row] = await connection.query(`
            SELECT status FROM payments WHERE booking_id = ?
        `, [booking_id]);
        if (row.length > 0) {
            return Response.json({ success: false, error: "For this booking, a payment has already been initiated." });
        }
        
        const [rows] = await connection.execute(
            `SELECT total_amount FROM bookings WHERE id = ? AND status = 'confirmed'`,
            [booking_id]
        );

        if (rows.length === 0)
            return Response.json({ success: false, error: "Booking not found or not confirmed" });

        const amount = rows[0].total_amount;
        console.log("Creating Razorpay order for amount:", amount);
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `booking_${booking_id}`,
        });

        return Response.json({
            success: true,
            order_id: order.id,
            amount,
        });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
}
