// app/api/user/profile/route.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import connection from "@/lib/db"; // ✅ import your DB connection (MySQL)

export const dynamic = "force-dynamic"; // ✅ ensures always fresh data

// ------------------ GET USER PROFILE ------------------
export async function GET() {
    try {
        // === AUTHENTICATION ===
        const cookieStore = await cookies(); // ✅ must await in Next.js 13+
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

        // === FETCH USER PROFILE ===
        const [rows] = await connection.query(
            "SELECT name, email, alternate_email, phone_number, alternate_phone FROM users WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const user = rows[0];

        return NextResponse.json({
            success: true,
            profile: {
                name: user.name,
                email: user.email,
                altEmail: user.altEmail,
                phone: user.phone,
                altPhone: user.altPhone,
            },
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

// ------------------ UPDATE USER PROFILE ------------------
export async function PATCH(request) {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("token")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;
        const body = await request.json();

        const allowedFields = ["name", "email", "altEmail", "phone", "altPhone"];
        const updates = {};

        // ✅ Extract only allowed fields
        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates[key] = value;
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, message: "No valid fields to update" },
                { status: 400 }
            );
        }

        // ✅ Build dynamic SQL query
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values = [...Object.values(updates), userId];

        await connection.query(`UPDATE users SET ${fields} WHERE id = ?`, values);

        // ✅ Fetch updated profile
        const [updatedRows] = await connection.query(
            "SELECT name, email, alternate_email, phone_number, alternate_phone FROM users WHERE id = ?",
            [userId]
        );

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            profile: updatedRows[0],
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update profile" },
            { status: 500 }
        );
    }
}
