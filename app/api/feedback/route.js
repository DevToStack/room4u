import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, subject, message, rating, feedback_type } = body;

        if (!email || !message) {
            return NextResponse.json(
                { error: "Email and message are required" },
                { status: 400 }
            );
        }

        await query(
            `
      INSERT INTO feedback (name, email, subject, message, rating, feedback_type)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
            [name, email, subject, message, rating || null, feedback_type || "general"]
        );

        return NextResponse.json({ message: "Feedback submitted successfully" });
    } catch (error) {
        console.error("❌ Feedback error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
