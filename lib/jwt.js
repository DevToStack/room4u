import jwt from "jsonwebtoken";

const EXPIRATION_DAYS = 7;
const JWT_ALGO = "HS256";
const JWT_SECRET = process.env.JWT_SECRET;

// Use environment-based issuer
const ISSUER =
    process.env.NODE_ENV === "production"
        ? "https://apartment-booking-site.vercel.app/"
        : "http://localhost:3000";

const AUDIENCE = "yourapp-users";

// ─── Generate JWT ─────────────────────────────────────────────
export function generateToken(payload) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + EXPIRATION_DAYS * 24 * 60 * 60;

    const fullPayload = {
        ...payload,
        iat: now,
        exp,
        iss: ISSUER,
        aud: AUDIENCE,
    };

    return jwt.sign(fullPayload, JWT_SECRET, { algorithm: JWT_ALGO });
}

// ─── Verify JWT ──────────────────────────────────────────────
export function verifyToken(token) {
    if (!token) {
        return { valid: false, decoded: null, error: "No token provided" };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: [JWT_ALGO],
            audience: AUDIENCE,
            issuer: ISSUER,
        });
        return { valid: true, decoded, error: null };
    } catch (err) {
        console.error("❌ JWT verification failed:", err.message);
        return { valid: false, decoded: null, error: err.message };
    }
}
