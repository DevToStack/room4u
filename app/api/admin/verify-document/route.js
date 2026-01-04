import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const cookies = parseCookies(request.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();
        const {
            user_id,
            booking_id,
            document_type,
            document_data,
            status = 'approved', // 'approved' or 'rejected'
            review_message = '',
            verification_notes = ''
        } = data;

        // Validation
        if (!user_id || !booking_id || !document_type || !document_data) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields: user_id, booking_id, document_type, document_data'
                },
                { status: 400 }
            );
        }

        const validDocumentTypes = ['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'];
        if (!validDocumentTypes.includes(document_type)) {
            return NextResponse.json(
                { success: false, message: 'Invalid document type' },
                { status: 400 }
            );
        }

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status' },
                { status: 400 }
            );
        }

        const reviewer_id = decoded.id;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Insert or update document verification record
            const [existingDoc] = await connection.query(
                `SELECT id FROM user_documents 
         WHERE user_id = ? AND booking_id = ?`,
                [user_id, booking_id]
            );

            let documentId;

            if (existingDoc.length > 0) {
                documentId = existingDoc[0].id;

                await connection.execute(
                    `UPDATE user_documents
                     SET document_type = ?,
                         document_data = ?,
                         status = ?,
                         reviewer_id = ?,
                         review_message = ?,
                         verification_notes = ?,
                         updated_at = NOW()
                     WHERE id = ?`,
                    [
                        document_type,
                        JSON.stringify(document_data),
                        status,
                        reviewer_id,
                        review_message,
                        verification_notes,
                        documentId
                    ]
                );
            } else {
                const [result] = await connection.execute(
                    `INSERT INTO user_documents
                     (user_id, booking_id, document_type, document_data, status, reviewer_id, review_message, verification_notes, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        user_id,
                        booking_id,
                        document_type,
                        JSON.stringify(document_data),
                        status,
                        reviewer_id,
                        review_message,
                        verification_notes
                    ]
                );

                documentId = result.insertId;
            }
            

            // 2. Update booking status to confirmed
            await connection.query(
                `UPDATE bookings 
         SET status = 'confirmed', 
             updated_at = NOW() 
         WHERE id = ?`,
                [booking_id]
            );

            // 3. Log the action (optional but recommended)
            await connection.query(
                `INSERT INTO admin_activity_logs 
         (admin_id, action_type, target_type, target_id, description, metadata) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    reviewer_id,
                    'document_verification',
                    'booking',
                    booking_id,
                    `Document verified and booking confirmed - Status: ${status}`,
                    JSON.stringify({
                        document_type,
                        document_id: documentId,
                        verification_notes
                    })
                ]
            );

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'Document verified and booking confirmed successfully',
                document_id: documentId
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Document verification error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to verify document',
                error: error.message
            },
            { status: 500 }
        );
    }
}

function normalizeDocumentData(documentData) {
    if (!documentData || typeof documentData !== 'object') {
        return { data: {}, images: {} };
    }

    const images = {
        front:
            documentData.front_image_url ||
            documentData.front?.url ||
            null,

        back:
            documentData.back_image_url ||
            documentData.back?.url ||
            null,

        photo:
            documentData.photo_image_url ||
            documentData.photo?.url ||
            null
    };

    return {
        data: documentData,
        images
    };
}

// GET endpoint to fetch document verification history
export async function GET(request) {
    try {
        const cookies = parseCookies(request.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const booking_id = searchParams.get('booking_id');

        const connection = await pool.getConnection();

        try {
            let query = `
                SELECT ud.*, 
                       u.name as user_name, 
                       u.email as user_email,
                       b.apartment_id,
                       a.title as apartment_title,
                       admin.name as reviewer_name
                FROM user_documents ud
                LEFT JOIN users u ON ud.user_id = u.id
                LEFT JOIN bookings b ON ud.booking_id = b.id
                LEFT JOIN apartments a ON b.apartment_id = a.id
                LEFT JOIN users admin ON ud.reviewer_id = admin.id
                WHERE 1=1
            `;

            const params = [];

            if (user_id) {
                query += ' AND ud.user_id = ?';
                params.push(user_id);
            }

            if (booking_id) {
                query += ' AND ud.booking_id = ?';
                params.push(booking_id);
            }

            query += ' ORDER BY ud.created_at DESC';

            const [documents] = await connection.query(query, params);

            // Parse documents and extract URLs from both formats
            const parsedDocuments = documents.map(doc => {
                const rawData =
                    typeof doc.document_data === 'string'
                        ? JSON.parse(doc.document_data)
                        : doc.document_data;

                const { data, images } = normalizeDocumentData(rawData);

                return {
                    ...doc,
                    document_data: data,
                    image_urls: images
                };
            });
            

            return NextResponse.json({
                success: true,
                documents: parsedDocuments
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Fetch documents error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch documents',
                error: error.message
            },
            { status: 500 }
        );
    }
}