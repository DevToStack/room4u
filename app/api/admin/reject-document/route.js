// Its a api for rejecting the documents 
// app/api/admin/reject-document/route.js
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
            status , // 'approved' or 'rejected'
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
            

            // 2. Log the action (optional but recommended)
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