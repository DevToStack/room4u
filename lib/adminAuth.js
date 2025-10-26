// lib/adminAuth.js
import { query } from "@/lib/mysql-wrapper";
import { verifyToken } from "@/lib/jwt";
import crypto from "crypto";

/**
 * Validates JWT, checks DB session, and ensures admin role.
 * @param {string} token - JWT from cookie
 * @returns {Promise<{ valid: boolean, decoded?: object, error?: string }>}
 */
export async function verifyAdmin(token) {
    if (!token) return { valid: false, error: "No token provided" };

    // 1️⃣ Verify JWT
    const { valid, decoded, error } = verifyToken(token);
    if (!valid) return { valid: false, error };

    // 2️⃣ Check role
    if (decoded.role !== "admin") return { valid: false, error: "Not an admin" };

    // 3️⃣ Check DB session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const sessions = await query("SELECT * FROM sessions WHERE token = ?", [tokenHash]);
    if (!sessions.length) return { valid: false, error: "Session expired or invalid" };

    return { valid: true, decoded };
}
