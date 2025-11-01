// app/api/dashboard/activity/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 20;
        const offset = (page - 1) * limit;

        // === AUTHENTICATION ===
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("token")?.value;
        if (!sessionToken) {
            return NextResponse.json(
                { error: "Authentication required", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: "Invalid or expired session", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;

        connection = await pool.getConnection();

        // ✅ Use template literals for LIMIT/OFFSET (MySQL limitation)
        // Parameters cannot be bound in LIMIT/OFFSET using ? placeholders.
        const [activities] = await connection.query(
            `
      SELECT message, date
      FROM user_activity
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT ${connection.escape(limit)} OFFSET ${connection.escape(offset)}
    `,
            [userId]
        );

        const [totalCount] = await connection.query(
            "SELECT COUNT(*) AS total FROM user_activity WHERE user_id = ?",
            [userId]
        );

        connection.release();

        return NextResponse.json({
            success: true,
            activities,
            pagination: {
                page,
                limit,
                total: totalCount[0]?.total || 0,
                totalPages: Math.ceil((totalCount[0]?.total || 0) / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching activity:", error);
        if (connection) connection.release();
        return NextResponse.json(
            { success: false, error: "Failed to fetch activity" },
            { status: 500 }
        );
    }
}
