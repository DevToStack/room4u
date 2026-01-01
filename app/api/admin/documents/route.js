import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// ✅ Strict extractor: exactly one URL per side
function extractUrls(documentData) {
    const urls = {};

    if (!documentData || typeof documentData !== 'object') {
        return urls;
    }

    // Preferred structure
    if (documentData.front?.url) {
        urls.front = documentData.front.url;
    }

    if (documentData.back?.url) {
        urls.back = documentData.back.url;
    }

    // Fallback: single-image documents
    if (!urls.front && documentData.url) {
        urls.front = documentData.url;
    }

    return urls;
}


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id parameter is required' },
                { status: 400 }
            );
        }

        // Get latest document for every document_type
        const [documents] = await pool.query(
            `
            SELECT ud.*
            FROM user_documents ud
            INNER JOIN (
                SELECT document_type, MAX(created_at) AS latest_time
                FROM user_documents
                WHERE user_id = ?
                GROUP BY document_type
            ) latest_docs
            ON ud.document_type = latest_docs.document_type
            AND ud.created_at = latest_docs.latest_time
            WHERE ud.user_id = ?
            ORDER BY ud.created_at DESC;
            `,
            [userId, userId]
        );

        if (documents.length === 0) {
            return NextResponse.json(
                { message: 'No documents found for this user' },
                { status: 404 }
            );
        }

        // Process documents
        const processedDocuments = documents.map(doc => {
            let documentData;

            try {
                documentData = typeof doc.document_data === 'string'
                    ? JSON.parse(doc.document_data)
                    : doc.document_data;
            } catch {
                documentData = {};
            }

            const urls = extractUrls(documentData);

            return {
                id: doc.id,
                user_id: doc.user_id,
                document_type: doc.document_type,
                status: doc.status,
                urls: urls,
                has_images: Object.keys(urls).length > 0,
                review_message: doc.review_message,
                created_at: doc.created_at,
                updated_at: doc.updated_at
            };
        });

        return NextResponse.json({
            success: true,
            user_id: parseInt(userId),
            documents_count: processedDocuments.length,
            documents: processedDocuments
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents', details: error.message },
            { status: 500 }
        );
    }
}
