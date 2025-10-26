// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import { query } from '@/lib/mysql-wrapper';
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        // Check OTP
        const resetData = await query(
            "SELECT * FROM password_resets WHERE email = ? AND otp = ?",
            [email, otp]
        );

        if (resetData.length === 0) {
            return NextResponse.json({ error: "Invalid otp" }, { status: 400 });
        }

        // Check expiry
        if (new Date(resetData[0].expires_at) < new Date()) {
            await query("DELETE FROM password_resets WHERE email = ?", [email]);
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

        // Delete OTP after use
        await query("DELETE FROM password_resets WHERE email = ?", [email]);

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
