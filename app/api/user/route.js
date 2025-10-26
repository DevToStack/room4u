import { query } from '@/lib/mysql-wrapper';
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email, phone } = await req.json();

        if (!email || !phone) {
            return NextResponse.json({ message: "Email and phone are required" }, { status: 400 });
        }

        // ✅ Only Gmail addresses allowed
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email.trim().toLowerCase())) {
            return NextResponse.json({ message: "Only Gmail addresses are allowed" }, { status: 400 });
        }

        // ✅ Phone format validation (Indian 10 digits starting with 6–9)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.trim())) {
            return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 });
        }

        // ✅ Check if email or phone already exists
        const existing = await query(
            `SELECT email FROM users WHERE email = ?`,
            [email.toLowerCase().trim()]
        );

        if (existing.length !== 0) {
            return NextResponse.json({ message: "The account is already registered." }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return new NextResponse('Database Error', { status: 500 });
    }
}
