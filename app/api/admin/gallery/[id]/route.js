import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// ─── Cloudinary Config ───────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * DELETE - Remove image from Cloudinary + DB
 */
export async function DELETE(request, { params }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
        }

        // 1️⃣ Get image info before deletion
        const [rows] = await pool.query(
            "SELECT image_url FROM apartment_gallery WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const image = rows[0];
        const imageUrl = image.image_url;

        // 2️⃣ Extract public_id from Cloudinary URL
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/apartment_gallery/uuid_name.jpg
        const parts = imageUrl.split("/");
        const fileName = parts.slice(-2).join("/"); // "apartment_gallery/uuid_name.jpg"
        const publicId = fileName.replace(/\.[^/.]+$/, ""); // remove extension

        // 3️⃣ Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
            console.warn("⚠️ Cloudinary deletion failed:", cloudErr.message);
        }

        // 4️⃣ Delete from database
        await pool.query("DELETE FROM apartment_gallery WHERE id = ?", [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("🔥 Error deleting image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}

/**
 * PATCH - Update image properties (order, primary status, file name)
 */
export async function PATCH(request, { params }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
        }

        const updates = await request.json();
        const allowedUpdates = ["display_order", "is_primary", "image_name"];
        const updateFields = [];
        const updateValues = [];

        Object.keys(updates).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        // If setting as primary, unset other primary images for the same apartment
        if (updates.is_primary === true) {
            const [rows] = await pool.query(
                "SELECT apartment_id FROM apartment_gallery WHERE id = ?",
                [id]
            );

            if (rows.length > 0) {
                const apartmentId = rows[0].apartment_id;
                await pool.query(
                    "UPDATE apartment_gallery SET is_primary = FALSE WHERE apartment_id = ? AND id != ?",
                    [apartmentId, id]
                );
            }
        }

        updateValues.push(id);
        await pool.query(
            `UPDATE apartment_gallery SET ${updateFields.join(", ")} WHERE id = ?`,
            updateValues
        );

        // Return updated image data
        const [updatedRows] = await pool.query(
            "SELECT * FROM apartment_gallery WHERE id = ?",
            [id]
        );

        return NextResponse.json({ success: true, image: updatedRows[0] });
    } catch (error) {
        console.error("🔥 Error updating image:", error);
        return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
    }
}

/**
 * GET - Get single image details
 */
export async function GET(request, { params }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
        }

        const [rows] = await pool.query(
            "SELECT * FROM apartment_gallery WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        return NextResponse.json({ image: rows[0] });
    } catch (error) {
        console.error("🔥 Error fetching image:", error);
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}
