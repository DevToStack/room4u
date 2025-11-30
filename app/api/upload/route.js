import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
    const user = verifyToken(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.formData();
        const file = data.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Convert callback to Promise properly
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "secure_uploads",
                    type: "authenticated",
                    access_mode: "authenticated",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            message: "Image uploaded",
            data: {
                public_id: uploadResult.public_id,
            },
        });

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}


export async function DELETE(req) {
    const user = verifyToken(req);
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const public_id = searchParams.get("public_id");

    if (!public_id) {
        return NextResponse.json({ error: "public_id missing" }, { status: 400 });
    }

    try {
        await cloudinary.uploader.destroy(public_id, {
            type: "authenticated",
            resource_type: "image",
        });

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully",
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
