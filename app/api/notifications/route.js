import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import {EmailService} from "@/services/email/Service"
// ✅ In-memory store for cooldown (token → timestamp)
const COOLDOWN = new Map();

// ✅ Helper: Check 1-hour cooldown per user
function canSendEmail(token) {
    const now = Date.now();
    const cooldownPeriod = 60 * 60 * 1000; // 1 hour
    const lastSent = COOLDOWN.get(token);

    // if first time or cooldown expired
    if (!lastSent || now - lastSent > cooldownPeriod) {
        COOLDOWN.set(token, now);
        return true;
    }

    return false;
}

// ✅ Helper: Authenticate user via JWT in cookie
async function authenticate() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("token")?.value;

    if (!sessionToken)
        return { valid: false, error: "Authentication required", status: 401 };

    const tokenResult = verifyToken(sessionToken);
    if (!tokenResult.valid)
        return { valid: false, error: "Invalid or expired session", status: 401 };

    return { valid: true, user: tokenResult.user, token: sessionToken };
}

// ✅ API Route: Send booking email (with cooldown)
export async function POST(req) {
    try {
        const auth = await authenticate();
        if (!auth.valid) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        const { token } = auth;
        const body = await req.json();
        const { customerName, customerEmail, apartmentName, checkIn, checkOut, totalPrice } = body;

        if (!customerName || !customerEmail || !apartmentName) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ 1-hour cooldown check
        if (!canSendEmail(token)) {
            const nextAvailable =
                Math.ceil((60 * 60 * 1000 - (Date.now() - COOLDOWN.get(token))) / 60000);
            return NextResponse.json(
                {
                    success: false,
                    message: `Please wait ${nextAvailable} minutes before sending another request.`,
                },
                { status: 429 }
            );
        }

        // ✅ Send the email
        await EmailService.sendAdminBookingEmail({
            customerName,
            customerEmail,
            apartmentName,
            checkIn,
            checkOut,
            totalPrice,
        });

        return NextResponse.json({
            success: true,
            message: "Email sent successfully. You can send another after 1 hour.",
        });
    } catch (error) {
        console.error("❌ Error sending booking notification:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
