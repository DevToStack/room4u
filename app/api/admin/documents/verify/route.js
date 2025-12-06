// app/api/documents/verify/route.js
import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

// Import your validation schemas
import { documentSchemas } from '@/lib/validationSchemas';

export async function POST(request) {
    let connection;

    try {
        // Parse the request body
        const body = await request.json();
        const { user_id, document_type, document_data } = body;

        // Validate required fields
        if (!user_id || !document_type || !document_data) {
            return NextResponse.json(
                { error: 'Missing required fields: user_id, document_type, document_data' },
                { status: 400 }
            );
        }

        // Check if document type is valid
        const validDocumentTypes = ['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'];
        if (!validDocumentTypes.includes(document_type)) {
            return NextResponse.json(
                { error: 'Invalid document type' },
                { status: 400 }
            );
        }

        // Validate document data against schema
        const validationResult = validateDocumentData(document_type, document_data);
        if (!validationResult.isValid) {
            return NextResponse.json(
                {
                    error: 'Invalid document data',
                    missingFields: validationResult.missingFields,
                    schema: documentSchemas[document_type]
                },
                { status: 400 }
            );
        }

        // Create database connection
        connection = await createConnection();

        // Check if user exists (optional but recommended)
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE id = ?',
            [user_id]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check for existing pending/approved document of same type
        const [existingDocs] = await connection.execute(
            `SELECT id, status FROM user_documents 
       WHERE user_id = ? AND document_type = ? 
       AND status IN ('pending', 'approved')
       ORDER BY created_at DESC LIMIT 1`,
            [user_id, document_type]
        );

        if (existingDocs.length > 0) {
            const existingDoc = existingDocs[0];
            return NextResponse.json(
                {
                    error: `Document of type ${document_type} already exists`,
                    existing_document_id: existingDoc.id,
                    status: existingDoc.status,
                    message: existingDoc.status === 'approved'
                        ? 'Document already approved'
                        : 'Document already pending review'
                },
                { status: 409 }
            );
        }

        // Insert document into database
        const [result] = await connection.execute(
            `INSERT INTO user_documents 
       (user_id, document_type, document_data, status) 
       VALUES (?, ?, ?, 'pending')`,
            [user_id, document_type, JSON.stringify(document_data)]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Document submitted for verification',
                document_id: result.insertId,
                status: 'pending'
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Document verification error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Helper function to validate document data
function validateDocumentData(documentType, documentData) {
    const schema = documentSchemas[documentType];

    if (!schema) {
        return { isValid: false, missingFields: ['Invalid document type'] };
    }

    const missingFields = [];

    // Check for required fields
    schema.required.forEach(field => {
        if (!documentData[field] || documentData[field].trim() === '') {
            missingFields.push(field);
        }
    });

    // Additional type-specific validations
    if (documentType === 'aadhaar') {
        // Validate Aadhaar number (12 digits)
        if (documentData.aadhaar_number && !/^\d{12}$/.test(documentData.aadhaar_number)) {
            missingFields.push('Invalid aadhaar_number format');
        }
    }

    if (documentType === 'pan') {
        // Validate PAN number (10 characters: 5 letters, 4 numbers, 1 letter)
        if (documentData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(documentData.pan_number)) {
            missingFields.push('Invalid pan_number format');
        }
    }

    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields.length > 0 ? missingFields : null
    };
}

// GET endpoint to retrieve user's documents
export async function GET(request) {
    let connection;

    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const document_id = searchParams.get('document_id');
        const status = searchParams.get('status');

        if (!user_id && !document_id) {
            return NextResponse.json(
                { error: 'Missing user_id or document_id parameter' },
                { status: 400 }
            );
        }

        connection = await createConnection();

        let query = 'SELECT * FROM user_documents';
        const params = [];

        if (document_id) {
            query += ' WHERE id = ?';
            params.push(document_id);
        } else if (user_id) {
            query += ' WHERE user_id = ?';
            params.push(user_id);

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
        }

        query += ' ORDER BY created_at DESC';

        const [documents] = await connection.execute(query, params);

        // Parse JSON data
        const parsedDocuments = documents.map(doc => ({
            ...doc,
            document_data: JSON.parse(doc.document_data)
        }));

        return NextResponse.json({
            success: true,
            documents: parsedDocuments,
            count: parsedDocuments.length
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