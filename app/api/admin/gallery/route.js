import { query } from "@/lib/mysql-wrapper";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/adminAuth";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/gallery");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── Ensure Upload Directory Exists ────────────────────────────────
async function ensureUploadDir() {
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
        console.error("Error creating upload directory:", error);
    }
}

// ─── Validate Uploaded File ───────────────────────────────────────
function validateFile(file) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 10MB limit");
    }
}

// ─── Fetch Gallery Images ─────────────────────────────────────────
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const apartmentId = searchParams.get("apartmentId");

        if (!apartmentId) {
            return NextResponse.json({ error: "Apartment ID is required" }, { status: 400 });
        }

        const images = await query(
            `SELECT id, apartment_id, image_url, image_name, file_size, 
                    mime_type, display_order, is_primary, created_at
             FROM apartment_gallery 
             WHERE apartment_id = ? 
             ORDER BY is_primary DESC, display_order ASC, created_at DESC`,
            [apartmentId]
        );

        return NextResponse.json({ images });
    } catch (error) {
        console.error("Error fetching gallery:", error);
        return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
    }
}

// ─── Upload Gallery Images (Admin Only) ───────────────────────────
export async function POST(request) {
    try {
        await ensureUploadDir();

        // 1️⃣ Extract token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        // 2️⃣ Verify admin authentication
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json(
                { error: `Unauthorized: ${error || "Invalid admin token"}` },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll("files");
        const apartmentId = formData.get("apartmentId");
        const uploadedBy = decoded.id; // ✅ from verified token

        if (!apartmentId || !files.length) {
            return NextResponse.json(
                { error: "Apartment ID and files are required" },
                { status: 400 }
            );
        }

        // 3️⃣ Ensure apartment exists
        const [apartment] = await query("SELECT id FROM apartments WHERE id = ?", [apartmentId]);
        if (!apartment) {
            return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
        }

        const uploadedImages = [];
        const errors = [];

        // 4️⃣ Process uploads (limit 10 at a time)
        const uploadPromises = files.slice(0, 10).map(async (file) => {
            try {
                validateFile(file);

                const fileExtension = path.extname(file.name);
                const uniqueFileName = `${uuidv4()}${fileExtension}`;
                const filePath = path.join(UPLOAD_DIR, uniqueFileName);
                const publicUrl = `/uploads/gallery/${uniqueFileName}`;

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                await writeFile(filePath, buffer);

                const result = await query(
                    `INSERT INTO apartment_gallery 
                     (apartment_id, image_url, image_name, file_size, mime_type, uploaded_by) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [apartmentId, publicUrl, file.name, file.size, file.type, uploadedBy]
                );

                uploadedImages.push({
                    id: result.insertId,
                    image_url: publicUrl,
                    image_name: file.name,
                    file_size: file.size,
                    mime_type: file.type,
                });
            } catch (error) {
                errors.push({ fileName: file.name, error: error.message });
            }
        });

        await Promise.all(uploadPromises);

        return NextResponse.json({
            success: true,
            uploaded: uploadedImages,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("❌ Error uploading files:", error);
        return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
    }
}
