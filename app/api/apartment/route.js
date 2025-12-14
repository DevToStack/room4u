import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Cache for apartment data (5 minutes)
const apartmentCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    try {
        const cacheKey = 'apartments_list';
        const cached = apartmentCache.get(cacheKey);

        // Return cached data if valid
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return NextResponse.json(cached.data, {
                status: 200,
                headers: {
                    'Cache-Control': 'public, max-age=300, s-maxage=300',
                    'X-Cache': 'HIT'
                }
            });
        }

        const conn = await pool.getConnection();

        // ✅ Include location_data in your SELECT query
        const [apartments] = await conn.query(`
            SELECT 
                a.id,
                a.title,
                a.location,
                a.location_data,
                a.price_per_night AS price,
                COALESCE(r.rating, 0) AS rating,
                COALESCE(r.totalReviews, 0) AS totalReviews,
                GROUP_CONCAT(af.icon) AS features,
                GROUP_CONCAT(af.text) AS feature_texts,
                ag.image_url AS primary_image
            FROM apartments a
            LEFT JOIN (
                SELECT 
                    apartment_id, 
                    ROUND(AVG(rating), 1) AS rating, 
                    COUNT(*) AS totalReviews
                FROM reviews 
                GROUP BY apartment_id
            ) r ON a.id = r.apartment_id
            LEFT JOIN apartment_features af ON a.id = af.apartment_id
            LEFT JOIN apartment_gallery ag ON a.id = ag.apartment_id AND ag.is_primary = TRUE
            WHERE a.available = TRUE
            GROUP BY a.id, a.title, a.location, a.location_data, a.price_per_night, r.rating, r.totalReviews, ag.image_url
            ORDER BY a.created_at DESC
        `);

        conn.release();

        // ✅ Safely parse JSON field
        const response = apartments.map(apartment => {
            let city = null;
            let country = null;

            try {
                if (typeof apartment.location_data === "string") {
                    const loc = JSON.parse(apartment.location_data);
                    city = loc.city || null;
                    country = loc.country || null;
                } else if (typeof apartment.location_data === "object" && apartment.location_data !== null) {
                    city = apartment.location_data.city || null;
                    country = apartment.location_data.country || null;
                }
            } catch (err) {
                console.warn("Invalid JSON in location_data:", err);
            }

            return {
                id: apartment.id,
                title: apartment.title,
                location: apartment.location,
                city,
                country,
                price: Number(apartment.price),
                reviews: {
                    rating: Number(apartment.rating),
                    totalReviews: Number(apartment.totalReviews)
                },
                features: apartment.features ? apartment.features.split(',') : [],
                feature_texts: apartment.feature_texts ? apartment.feature_texts.split(',') : [],
                image: apartment.primary_image || null
            };
        });

        // ✅ Cache result
        apartmentCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=300, s-maxage=300',
                'X-Cache': 'MISS'
            }
        });

    } catch (err) {
        console.error("Error fetching apartments:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
