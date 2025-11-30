import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const apartmentId = searchParams.get("apartmentId");

        // Extract token from cookies
        const token = req.cookies.get("token")?.value;

        let userIdFromToken = null;
        if (token) {
            const decoded = await verifyToken(token);
            userIdFromToken = decoded?.id;
        }

        /* ───────────────────────────
              GET REVIEWS BY APARTMENT
           ─────────────────────────── */
        if (apartmentId) {
            const reviews = await query(
                `
                SELECT
                    r.id,
                    r.rating,
                    r.comment,
                    r.created_at,
                    u.name AS user_name
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.apartment_id = ?
                ORDER BY r.created_at DESC
                `,
                [apartmentId]
            );

            return NextResponse.json({
                success: true,
                mode: "apartment_reviews",
                reviews,
            });
        }

        /* ───────────────────────────
            GET REVIEWS FOR LOGGED IN USER
           ─────────────────────────── */
        if (userIdFromToken) {
            const reviews = await query(
                `
                SELECT
                    r.id,
                    r.rating,
                    r.comment,
                    r.created_at,
                    a.title AS apartment_name
                FROM reviews r
                JOIN apartments a ON r.apartment_id = a.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
                `,
                [userIdFromToken]
            );

            return NextResponse.json({
                success: true,
                mode: "user_reviews",
                reviews,
            });
        }

        return NextResponse.json(
            { error: "Unauthorized: token missing." },
            { status: 401 }
        );

    } catch (err) {
        console.error("GET reviews error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}



/* ─────────────────────────────── POST (Submit review) ─────────────────────────────── */
export async function POST(req) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { valid, decoded } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { apartment_id, rating, comment } = body;

        if (!apartment_id || !rating || !comment) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Optional: Prevent duplicate review for same apartment
        const existingReview = await query(
            `SELECT id FROM reviews WHERE user_id = ? AND apartment_id = ?`,
            [decoded.id, apartment_id]
        );

        if (existingReview.length > 0) {
            return NextResponse.json(
                { error: "You have already submitted a review for this apartment." },
                { status: 400 }
            );
        }

        // Insert review
        const insertRes = await query(
            `
            INSERT INTO reviews (user_id, apartment_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `,
            [decoded.id, apartment_id, rating, comment]
        );

        return NextResponse.json(
            {
                message: "Review submitted successfully",
                reviewId: insertRes.insertId,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("POST review error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
