import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
    const path = req.nextUrl.pathname;

    // Check protected routes (admin and dashboard)
    if (path.startsWith("/admin") || path.startsWith("/api/admin") || path.startsWith("/dashboard")) {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.rewrite(new URL("/404", req.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET, {
                algorithms: ["HS256"],
                issuer:
                    process.env.NODE_ENV === "production"
                        ? "https://apartment-booking-site.vercel.app/"
                        : "http://localhost:3000",
                audience: "yourapp-users",
            });

            // For admin routes, check if user has admin role
            if ((path.startsWith("/admin") || path.startsWith("/api/admin")) && payload.role === "guest") {
                return NextResponse.rewrite(new URL("/404", req.url));
            }

            // For dashboard routes, check if user has either admin or guest role
            if (path.startsWith("/dashboard") && !["admin", "guest","staff"].includes(payload.role)) {
                return NextResponse.rewrite(new URL("/404", req.url));
            }

            // ✅ JWT valid & appropriate role
            return NextResponse.next();
        } catch (err) {
            console.error("[SECURITY] Middleware JWT verification failed:", err.message);
            return NextResponse.rewrite(new URL("/404", req.url));
        }
    }

    // For all other routes, continue
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*"],
};