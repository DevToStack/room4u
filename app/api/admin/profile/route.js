import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { verifyAdmin } from "@/lib/adminAuth";
import { parseCookies } from "@/lib/cookies";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
    try {
        const cookieHeader = req.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const [rows] = await pool.query(
            `SELECT id, name, email, role, created_at
       FROM users WHERE id = ? LIMIT 1`,
            [decoded.id]
        );

        if (!rows.length) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        return NextResponse.json({
            success: true,
            user: rows[0],
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: "Invalid token" });
    }
}
