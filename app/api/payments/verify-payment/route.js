import crypto from "crypto";
import pool from "@/lib/db";
import { emailService } from "@/services/email/Service";

export async function POST(req) {
    const {
        bookingId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return Response.json({ success: false, error: "Invalid signature" });
    }

    try {
        // ✅ Fetch payment details from Razorpay
        const paymentRes = await fetch(
            `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
            {
                headers: {
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
                        ).toString("base64"),
                },
            }
        );

        const paymentData = await paymentRes.json();

        if (!paymentData || paymentData.error) {
            throw new Error("Failed to fetch payment details from Razorpay");
        }

        // ✅ Extract method (upi, card, netbanking, wallet, etc.)
        const paymentMethod = paymentData.method || "unknown";
        const amount = paymentData.amount / 100; // Convert from paise to rupees

        const connection = await pool.getConnection();
        try {
            await connection.query("START TRANSACTION");

            await connection.execute(
                `UPDATE bookings SET status = 'confirmed' WHERE id = ?`,
                [bookingId]
            );

            await connection.execute(
                `INSERT INTO payments (booking_id, amount, method, razorpay_payment_id, status)
                 VALUES (?, ?, ?, ?, 'paid')`,
                [bookingId, amount, paymentMethod, razorpay_payment_id]
            );

            await connection.query("COMMIT");

            // Query to get payment details with joins
            const [paymentRows] = await pool.execute(`
            SELECT 
                u.name AS customer_name,
                u.email AS customer_email,
                a.title AS apartment_name,
                b.start_date AS check_in,
                b.end_date AS check_out,
                b.total_amount AS total_price,
                p.razorpay_payment_id,
                p.paid_at AS payment_date
            FROM payments p
            INNER JOIN bookings b ON p.booking_id = b.id
            INNER JOIN users u ON b.user_id = u.id
            INNER JOIN apartments a ON b.apartment_id = a.id
            WHERE p.razorpay_payment_id = ?
        `, [razorpay_payment_id]);

            if (paymentRows.length === 0) {
                console.error('❌ Payment not found:', razorpay_payment_id);
                return;
            }

            const paymentData = paymentRows[0];

            // Format dates if needed
            const formatDate = (dateString) => {
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };
            // ✅ Fetch all admin emails from DB
            const [admins] = await pool.execute(`SELECT email FROM users WHERE role = 'admin'`);
            const adminEmails = admins.map(a => a.email); // Array of emails

            await pool.execute(
                `INSERT INTO messages (senderName, subject, body)
                 VALUES (?, ?, ?)`,
                [paymentData.customer_name, "Payment Received", "A new payment has been made. For details, please check your admin dashboard."]
            );
            

            return Response.json({
                success: true,
                method: paymentMethod,
                amount,
            });
        } catch (error) {
            await connection.query("ROLLBACK");
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        return Response.json({ success: false, error: error.message });
    }
}
