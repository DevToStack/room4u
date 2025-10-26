import { NextResponse } from "next/server";
import pool from "@/lib/db"; // ensure this exports a working MySQL pool connection

export async function GET(req, { params }) {
    const {id} = await params;
    const apartmentId = Number(id);

    if (isNaN(apartmentId)) {
        return NextResponse.json({ error: "Invalid apartment ID" }, { status: 400 });
    }

    try {
        const conn = await pool.getConnection();

        // 1️⃣ Basic Apartment Info
        const [apartmentRows] = await conn.query(
            "SELECT * FROM apartments WHERE id = ?",
            [apartmentId]
        );

        if (apartmentRows.length === 0) {
            conn.release();
            return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
        }

        const apartment = apartmentRows[0];

        // 2️⃣ Reviews Summary
        const [reviewStats] = await conn.query(
            "SELECT ROUND(AVG(rating),1) AS rating, COUNT(*) AS totalReviews FROM reviews WHERE apartment_id = ?",
            [apartmentId]
        );

        const reviews = {
            rating: reviewStats[0].rating || 0,
            totalReviews: reviewStats[0].totalReviews || 0,
        };

        // 3️⃣ Features
        const [features] = await conn.query(
            "SELECT icon, text FROM apartment_features WHERE apartment_id = ?",
            [apartmentId]
        );

        // 4️⃣ What's Included
        const [whatsInclude] = await conn.query(
            "SELECT icon, text FROM apartment_inclusions WHERE apartment_id = ?",
            [apartmentId]
        );

        // 5️⃣ House Rules
        const [houseRules] = await conn.query(
            "SELECT icon, text FROM apartment_rules WHERE apartment_id = ?",
            [apartmentId]
        );

        // 6️⃣ Why Book With Us
        const [whyBookWithUs] = await conn.query(
            "SELECT icon, text FROM apartment_why_book WHERE apartment_id = ?",
            [apartmentId]
        );

        // 7️⃣ Policies
        const [policies] = await conn.query(
            "SELECT cancellation, booking FROM apartment_policies WHERE apartment_id = ?",
            [apartmentId]
        );

        // 8️⃣ Gallery
        const [gallery] = await conn.query(
            "SELECT image_url, image_name FROM apartment_gallery WHERE apartment_id = ?",
            [apartmentId]
        );

        conn.release();

        // ✅ Final Structured Response
        const response = {
            id: apartment.id,
            title: apartment.title,
            location: apartment.location,
            city: apartment.location_data.city,
            country: apartment.location_data.country,
            description: apartment.description,
            price: apartment.price_per_night,
            reviews,
            features,
            whatsInclude,
            houseRules,
            whyBookWithUs,
            policy: policies[0] || {},
            gallery,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching apartment details:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
