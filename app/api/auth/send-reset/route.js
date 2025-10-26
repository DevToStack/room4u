// app/api/auth/request-reset/route.js
import { NextResponse } from "next/server";
import { query } from '@/lib/mysql-wrapper';
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req) {
    const { email } = await req.json();
    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in DB
    await query(
        "INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?",
        [email, otp, expiresAt, otp, expiresAt]
    );

    // Send OTP via email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
    });

    await transporter.sendMail({
        from: `"Support" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "🔐 Password Reset OTP",
        html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #f9fafb; padding: 5px; text-align: center; color: #111827;">
          <div style="max-width: 480px; margin: auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            
            <h2 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 5px 0;">
              Password Reset Request
            </h2>
            
            <p style="font-size: 14px; color: #4b5563; margin: 5px 0; line-height: 1.6;">
              We received a request to reset your password.<br/>
              Use the OTP below to continue:
            </p>
      
            <div style="margin: 15px 0;">
              <span style="display: inline-block; background-color: #eef2ff; color: #3730a3; font-size: 26px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; border-radius: 10px; border: 1px solid #c7d2fe;">
                ${otp}
              </span>
            </div>
      
            <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
              This OTP will expire in <b>10 minutes</b>.<br/>
              If you did not request this, you can safely ignore this email.
            </p>
      
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 10px 0;" />
      
            <p style="font-size: 11px; color: #9ca3af; margin: 5px 0;">
              &copy; ${new Date().getFullYear()} Apartment Booking. All rights reserved.<br/>
              This is an automated email, please do not reply.
            </p>
          </div>
        </div>
        `,
    });
      
      
      

    return NextResponse.json({ message: "OTP sent to email" });
}
