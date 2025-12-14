import { verifyToken } from "@/lib/jwt";
import { query } from "@/lib/mysql-wrapper";
import { createNotification } from "@/lib/notification-service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        // Extract token from cookies
        const cookieStore = await cookies();
        const token =  cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }
        
        // ✅ Verify JWT
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json(
                { success: false, message: 'Invalid token: ' + error },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { message, rating, feedback_type } = body;

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const safeRating =
            rating === undefined || rating === "" ? null : Number(rating);

        await query(
            `
            INSERT INTO feedback (user_id, message, rating, feedback_type)
            VALUES (?, ?, ?, ?)
            `,
            [
                decoded.id,      // always null or number
                message,              // validated
                safeRating,           // null or number
                "general"      // always string
            ]
        );

        await createNotification({
            type: 'feedback',
            title: 'Feedback Received',
            content: 'User feedback has been submitted.',
            userId: decoded.id,
            bookingId: null,
            meta: {
                status: 'done',
            },
            level: 'info'
        });

        return NextResponse.json({
            message: "Feedback submitted successfully"
        });
    } catch (error) {
        console.error("❌ Feedback error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
