import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { emailService } from "@/services/email/Service";
import pool from "@/lib/db";

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map();

/**
 * Rate limiting function - prevents sending emails more than once per hour
 * @param {string} userId - User identifier
 * @returns {Object} - { allowed: boolean, timeLeft: number }
 */
function checkRateLimit(userId) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    const lastRequest = rateLimitMap.get(userId);

    if (!lastRequest) {
        // First request from this user
        rateLimitMap.set(userId, now);
        return { allowed: true, timeLeft: 0 };
    }

    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < oneHour) {
        // Too soon - calculate time left
        const timeLeft = Math.ceil((oneHour - timeSinceLastRequest) / 1000 / 60); // in minutes
        return { allowed: false, timeLeft };
    }

    // Enough time has passed - update timestamp and allow
    rateLimitMap.set(userId, now);
    return { allowed: true, timeLeft: 0 };
}

/**
 * Clean up old entries from rate limit map to prevent memory leaks
 */
function cleanupRateLimitMap() {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();

    for (const [userId, timestamp] of rateLimitMap.entries()) {
        if (now - timestamp > oneHour * 24) { // Remove entries older than 24 hours
            rateLimitMap.delete(userId);
        }
    }
}

// Run cleanup periodically (every 6 hours)
setInterval(cleanupRateLimitMap, 6 * 60 * 60 * 1000);

export async function POST(req) {
    try {
        const body = await req.json();
        const { customerName, customerEmail, apartmentName, checkIn, checkOut, totalPrice } = body;

        // ✅ Get session token from cookies
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('token')?.value;
        if (!sessionToken) {
            return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        // ✅ Verify token
        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json({ error: 'Invalid or expired session', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        // ✅ Check rate limit using user ID from token
        const rateLimitCheck = checkRateLimit(tokenResult.decoded.userId || tokenResult.decoded.email);
        if (!rateLimitCheck.allowed) {
            return NextResponse.json({
                error: `Rate limit exceeded. Please try again in ${rateLimitCheck.timeLeft} minutes.`,
                code: 'RATE_LIMIT_EXCEEDED',
                timeLeft: rateLimitCheck.timeLeft
            }, { status: 429 });
        }

        // ✅ Fetch all admin emails from DB
        const [admins] = await pool.query("SELECT email FROM users WHERE role = 'admin'");
        const adminEmails = admins.map(a => a.email); // Array of emails

        await pool.query(
            `INSERT INTO messages (senderName, subject, body)
             VALUES (?, ?, ?)`,
            [customerName, "New Booking Request", "A new booking has been made. For details, please check your admin dashboard."]
        );
        // ✅ Send email via EmailService (handles fallback if empty)
        await emailService.sendAdminBookingEmail({
            customerName,
            customerEmail,
            apartmentName,
            checkIn,
            checkOut,
            totalPrice,
            adminEmails,
        });

        return NextResponse.json({
            success: true,
            recipients: adminEmails.length > 0 ? adminEmails : [process.env.MAIL_USER],
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error("❌ Error sending admin booking email:", error);
        return NextResponse.json({ error: 'Failed to send email', code: 'EMAIL_ERROR' }, { status: 500 });
    }
}