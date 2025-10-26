'use server';
import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

// -------------------- Improved Rate Limiter with Cleanup --------------------
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // max 20 requests per minute per IP
const ipRequestCounts = new Map();

// Cleanup interval to prevent memory leaks
const cleanupInterval = setInterval(() => {
    const currentTime = Date.now();
    for (const [ip, record] of ipRequestCounts.entries()) {
        if (currentTime - record.startTime > RATE_LIMIT_WINDOW) {
            ipRequestCounts.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW);

// Make sure to clear interval in Node.js environments
if (typeof global !== 'undefined' && global.process) {
    process.on('SIGTERM', () => clearInterval(cleanupInterval));
    process.on('SIGINT', () => clearInterval(cleanupInterval));
}

function rateLimit(ip) {
    const currentTime = Date.now();
    const record = ipRequestCounts.get(ip) || { count: 0, startTime: currentTime };

    // Reset window if time expired
    if (currentTime - record.startTime > RATE_LIMIT_WINDOW) {
        record.count = 0;
        record.startTime = currentTime;
    }

    record.count += 1;
    ipRequestCounts.set(ip, record);

    return {
        allowed: record.count <= RATE_LIMIT_MAX_REQUESTS,
        remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count)
    };
}

// -------------------- Response Cache --------------------
const responseCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds cache

function getCacheKey(apartmentId) {
    return `apartment-images-${apartmentId}`;
}

function setCachedResponse(key, data) {
    responseCache.set(key, {
        data,
        timestamp: Date.now()
    });
}

function getCachedResponse(key) {
    const cached = responseCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > CACHE_TTL) {
        responseCache.delete(key);
        return null;
    }

    return cached.data;
}

// -------------------- Optimized GET: Public apartment images --------------------
export async function GET(request, { params }) {
    const startTime = Date.now();
    let ip = "unknown";

    try {
        const { id } = await params;

        // ✅ 1. Extract IP efficiently
        ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown";

        // ✅ 2. Rate limiting (per IP) - early return
        const rateLimitResult = rateLimit(ip);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Too many requests. Please try again later.",
                    retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString()
                    }
                }
            );
        }

        // ✅ 3. Validate input efficiently
        const apartmentId = parseInt(id, 10);
        if (!apartmentId || apartmentId <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid apartment ID" },
                { status: 400 }
            );
        }

        // ✅ 4. Check cache first
        const cacheKey = getCacheKey(apartmentId);
        const cached = getCachedResponse(cacheKey);

        if (cached) {
            console.log(`Cache hit for apartment ${apartmentId}`);
            return NextResponse.json(cached, { status: 200 });
        }

        // ✅ 5. Optimized database query with specific fields only
        const images = await query(
            `SELECT 
                id, 
                image_url, 
                image_name, 
                display_order, 
                is_primary 
             FROM apartment_gallery 
             WHERE apartment_id = ? 
             ORDER BY is_primary DESC, display_order ASC 
             LIMIT 100`, // Added limit for safety
            [apartmentId]
        );

        // ✅ 6. Prepare response
        const responseData = {
            success: true,
            count: images.length,
            images,
            cached: false,
            processingTime: Date.now() - startTime
        };

        // ✅ 7. Cache successful responses
        if (images.length > 0) {
            setCachedResponse(cacheKey, responseData);
        }

        return NextResponse.json(
            responseData,
            {
                status: 200,
                headers: {
                    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString(),
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
                }
            }
        );

    } catch (error) {
        console.error(`Error fetching gallery images for IP ${ip}:`, error);

        // Log processing time for errors too
        console.log(`Request failed after ${Date.now() - startTime}ms`);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                errorId: `err_${Date.now()}`
            },
            { status: 500 }
        );
    }
}

// -------------------- Health check endpoint --------------------
export async function HEAD(request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'X-API-Status': 'Healthy',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString()
        }
    });
}