// app/api/admin/documents/review/route.js
import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

export async function POST(request) {
    let connection;

    try {
        // Parse the request body
        const body = await request.json();
        const { document_id, reviewer_id, status, review_message } = body;

        // Validate required fields
        if (!document_id || !reviewer_id || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: document_id, reviewer_id, status' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be "approved" or "rejected"' },
                { status: 400 }
            );
        }

        // Create database connection
        connection = await createConnection();

        // Check if document exists
        const [documents] = await connection.execute(
            'SELECT id, status FROM user_documents WHERE id = ?',
            [document_id]
        );

        if (documents.length === 0) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        const document = documents[0];

        // Check if document is already reviewed
        if (document.status !== 'pending') {
            return NextResponse.json(
                {
                    error: `Document already ${document.status}`,
                    current_status: document.status
                },
                { status: 409 }
            );
        }

        // Update document status
        const [result] = await connection.execute(
            `UPDATE user_documents 
       SET status = ?, reviewer_id = ?, review_message = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [status, reviewer_id, review_message || null, document_id]
        );

        return NextResponse.json({
            success: true,
            message: `Document ${status} successfully`,
            document_id: document_id,
            status: status
        });

    } catch (error) {
        console.error('Document review error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// GET endpoint for admin to view all documents
export async function GET(request) {
    let connection;

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const document_type = searchParams.get('document_type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        connection = await createConnection();

        let query = `
      SELECT ud.*, u.email as user_email, u.name as user_name,
             a.name as reviewer_name
      FROM user_documents ud
      LEFT JOIN users u ON ud.user_id = u.id
      LEFT JOIN admins a ON ud.reviewer_id = a.id
    `;

        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('ud.status = ?');
            params.push(status);
        }

        if (document_type) {
            conditions.push('ud.document_type = ?');
            params.push(document_type);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY ud.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM user_documents ud';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }

        const [documents] = await connection.execute(query, params);
        const [countResult] = await connection.execute(countQuery, params.slice(0, -2));
        const total = countResult[0].total;

        // Parse JSON data
        const parsedDocuments = documents.map(doc => ({
            ...doc,
            document_data: JSON.parse(doc.document_data)
        }));

        return NextResponse.json({
            success: true,
            documents: parsedDocuments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching documents:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}