import { query } from '@/lib/mysql-wrapper';
import crypto from "crypto";

export async function generateOTP(email, purpose, userId = null) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now

    // ✅ Upsert: reset attempts and unlock OTP on new generation
    await query(
        `
        INSERT INTO otps (user_id, email, otp, purpose, expires_at, verified, attempts, locked)
        VALUES (?, ?, ?, ?, ?, 0, 0, 0)
        ON DUPLICATE KEY UPDATE
            otp = VALUES(otp),
            expires_at = VALUES(expires_at),
            verified = 0,
            attempts = 0,
            locked = 0,
            user_id = VALUES(user_id)
        `,
        [userId, email, otp, purpose, expiresAt]
    );

    return otp; // send via email
}

export async function verifyOTP(email, purpose, enteredOtp) {
    // ✅ Get the OTP record
    const records = await query(
        `
        SELECT * FROM otps
        WHERE email = ? AND purpose = ?
        LIMIT 1
        `,
        [email, purpose]
    );

    if (!records.length) {
        return { success: false, message: "No OTP found. Please request a new one." };
    }

    const record = records[0];

    // ✅ Check if OTP is locked due to 3 failed attempts
    if (record.locked) {
        return { success: false, message: "Too many failed attempts. Please request a new OTP." };
    }

    // ✅ Check expiry
    if (new Date(record.expires_at) < new Date()) {
        return { success: false, message: "OTP expired. Please request a new one." };
    }

    // ✅ Verify OTP
    if (record.otp !== enteredOtp) {
        // Increment attempts
        const newAttempts = record.attempts + 1;
        const isLocked = newAttempts >= 3 ? 1 : 0;

        await query(
            `UPDATE otps SET attempts = ?, locked = ? WHERE id = ?`,
            [newAttempts, isLocked, record.id]
        );

        const attemptsLeft = Math.max(0, 3 - newAttempts);
        return {
            success: false,
            message: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
        };
    }

    // ✅ OTP is correct — mark as verified
    await query(
        `UPDATE otps SET verified = 1 WHERE id = ?`,
        [record.id]
    );

    return { success: true, message: "OTP verified successfully" };
}
