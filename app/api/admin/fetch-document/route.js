import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
    const user = verifyToken(req);

    if (!user || user.role !== "admin") {
        return NextResponse.json(
            { error: "Admin access only" },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("public_id");

    if (!publicId) {
        return NextResponse.json(
            { error: "public_id is required" },
            { status: 400 }
        );
    }

    try {
        // Generate authenticated URL valid for 1 hour
        const signedUrl = cloudinary.url(publicId, {
            secure: true,
            sign_url: true,
            type: "authenticated",
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        });

        return NextResponse.json({
            success: true,
            url: signedUrl,
        });

    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
