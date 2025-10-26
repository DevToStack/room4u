import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    if (strength <= 2) return "Weak";
    if (strength === 3 || strength === 4) return "Medium";
    return "Strong";
}

const planDurations = { free: 3, standard: 2, pro: 6 }; // months

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, phone, password, otp, role = "guest", plan = null } = body;

        if (!name || !email || !phone || !password || !otp) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) return NextResponse.json({ message: "Invalid email" }, { status: 400 });

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) return NextResponse.json({ message: "Invalid phone" }, { status: 400 });

        const passwordStrength = getPasswordStrength(password);
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!strongRegex.test(password)) {
            return NextResponse.json({ message: "Password too weak", passwordStrength }, { status: 400 });
        }

        // Verify OTP
        const [otpRecord] = await pool.query(
            `SELECT * FROM otps WHERE email=? AND purpose='registration' AND otp=? AND expires_at > NOW()`,
            [email, otp]
        );
        if (otpRecord.length === 0) return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });

        const hash = await bcrypt.hash(password, 10);
        const [existingUser] = await pool.query(`SELECT * FROM users WHERE email=?`, [email]);
        const isAdmin = ["rabimohammed740@gmail.com", "devdrop18@gmail.com"].includes(email);

        if (existingUser.length === 0) {
            // NEW user
            const roleFinal = isAdmin ? "admin" : role;
            let host_start = null, host_end = null;

            if (roleFinal === "host" && plan) {
                host_start = new Date();
                host_end = new Date();
                host_end.setMonth(host_end.getMonth() + planDurations[plan]);
            }

            await pool.query(
                `INSERT INTO users (name,email,phone_number,password,role,plan,host_start,host_end)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, phone, hash, roleFinal, plan, host_start, host_end]
            );

            await pool.query(`DELETE FROM otps WHERE email=? AND purpose='registration'`, [email]);

            return NextResponse.json({ success: true, role: isAdmin ? "admin" : roleFinal, plan, passwordStrength });
        }

        // Existing user: upgrade guest → host
        const user = existingUser[0];
        if (user.role === "guest" && role === "host") {
            const host_start = new Date();
            const host_end = new Date();
            host_end.setMonth(host_end.getMonth() + planDurations[plan]);

            await pool.query(
                `UPDATE users SET role='host', plan=?, host_start=?, host_end=? WHERE email=?`,
                [plan, host_start, host_end, email]
            );

            await pool.query(`DELETE FROM otps WHERE email=? AND purpose='registration'`, [email]);

            return NextResponse.json({ success: true, role: "host", plan });
        }

        return NextResponse.json({ message: "Account already registered" }, { status: 400 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
