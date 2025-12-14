import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        // === 2. AUTHENTICATION ===
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('token')?.value;
        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired session', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;

        // Parse multipart form data
        const data = await req.formData();
        const files = data.getAll("files[]"); // Get all files
        const documentType = data.get("document_type");
        const sides = data.getAll("sides[]"); // ["front", "back"]

        if (!files.length || !documentType || !sides.length) {
            return NextResponse.json({
                error: "files, document_type, and sides are required"
            }, { status: 400 });
        }

        // Validate number of files matches sides
        if (files.length !== sides.length) {
            return NextResponse.json({
                error: "Number of files must match number of sides"
            }, { status: 400 });
        }

        // Map document names to database enum values
        const documentTypeMap = {
            "Aadhaar Card": "aadhaar",
            "PAN Card": "pan",
            "Driving License": "driving_license",
            "Passport": "passport",
            "Voter ID": "voter_id"
        };

        const dbDocumentType = documentTypeMap[documentType];
        if (!dbDocumentType) {
            return NextResponse.json({
                error: "Invalid document type"
            }, { status: 400 });
        }

        // Prepare for batch upload
        const uploadPromises = [];
        const documentData = {};

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const side = sides[i];

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({
                    error: `Invalid file type for ${side} side: ${file.type}`
                }, { status: 400 });
            }

            // Validate file size
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({
                    error: `File too large for ${side} side (5MB max)`
                }, { status: 400 });
            }

            // Convert file to buffer
            const buffer = Buffer.from(await file.arrayBuffer());
            const timestamp = Date.now();
            const uniqueIdentifier = `${userId}_${dbDocumentType}_${side}_${timestamp}`;

            // Create upload promise
            uploadPromises.push(new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: `secure_uploads/${userId}/${dbDocumentType}`,
                        public_id: uniqueIdentifier,
                        type: "authenticated",
                        access_mode: "authenticated",
                        resource_type: "auto",
                        tags: [dbDocumentType, side]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve({ result, file, side, uniqueIdentifier });
                    }
                );
                stream.end(buffer);
            }));
        }

        // Upload all files to Cloudinary in parallel
        const uploadResults = await Promise.all(uploadPromises);

        // Prepare document data for database
        const documentsJson = {};

        uploadResults.forEach(({ result, file, side, uniqueIdentifier }) => {
            const authenticatedUrl = cloudinary.url(result.public_id, {
                type: "authenticated",
                secure: true,
                sign_url: true,
            });

            documentsJson[side] = {
                public_id: result.public_id,
                url: authenticatedUrl,
                file_name: file.name,
                file_type: file.type,
                size: file.size,
                uploaded_at: new Date().toISOString()
            };
        });

        // Save to database
        await db.execute(
            `INSERT INTO user_documents (user_id, document_type, document_data, status)
             VALUES (?, ?, ?, 'pending')`,
            [userId, dbDocumentType, JSON.stringify(documentsJson)]
        );

        return NextResponse.json({
            success: true,
            message: "All files uploaded & stored successfully",
            document_type: documentType,
            data: documentsJson
        });

    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json({
            error: err.message || "Upload failed",
        }, { status: 500 });
    }
}