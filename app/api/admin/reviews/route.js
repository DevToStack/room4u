import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ------------------------- GET ALL REVIEWS WITH PAGINATION -------------------------
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const rating = searchParams.get('rating') || '';
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') || 'DESC';

        const offset = (page - 1) * limit;

        let whereClause = ' WHERE 1=1';
        let queryParams = [];

        if (search) {
            whereClause += ` AND (reviews.comment LIKE ? OR users.name LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (rating) {
            whereClause += ` AND reviews.rating = ?`;
            queryParams.push(parseInt(rating));
        }

        // Count query
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM reviews
            LEFT JOIN users ON reviews.user_id = users.id
            ${whereClause}
        `;

        const [countRows] = await pool.query(countQuery, queryParams);

        // Main data query
        const dataQuery = `
            SELECT reviews.*, users.name 
            FROM reviews
            LEFT JOIN users ON reviews.user_id = users.id
            ${whereClause}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.query(dataQuery, [...queryParams, limit, offset]);

        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(countRows[0].total / limit),
                totalItems: countRows[0].total,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.warn("GET reviews error:", err);
        return NextResponse.json({ success: false, message: "Failed to fetch reviews" }, { status: 500 });
    }
}


// ------------------------- DELETE REVIEW -------------------------
export async function DELETE(req) {
    try {
        const { id } = await req.json();

        if (!id)
            return NextResponse.json({ success: false, message: "Review ID required" }, { status: 400 });

        await pool.query(`DELETE FROM reviews WHERE id = ?`, [id]);

        return NextResponse.json({ success: true, message: "Review deleted successfully" });
    } catch (err) {
        console.warn("DELETE review error:", err);
        return NextResponse.json({ success: false, message: "Failed to delete review" }, { status: 500 });
    }
}
