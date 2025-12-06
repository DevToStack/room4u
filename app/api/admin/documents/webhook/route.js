// app/api/documents/webhook/route.js
import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

export async function POST(request) {
    let connection;

    try {
        const body = await request.json();
        const { document_id, status, verification_data, message } = body;

        // Validate webhook signature (implement based on your provider)
        const signature = request.headers.get('x-webhook-signature');
        if (!verifyWebhookSignature(signature, body)) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        connection = await createConnection();

        // Update document with verification results
        const [result] = await connection.execute(
            `UPDATE user_documents 
       SET status = ?, 
           document_data = JSON_MERGE_PATCH(document_data, ?),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [status, JSON.stringify(verification_data || {}), document_id]
        );

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        console.error('Webhook error:', error);

        // Log the error but return 200 to prevent webhook retries
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 200 }
        );

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

function verifyWebhookSignature(signature, body) {
    // Implement your webhook verification logic here
    // This depends on your verification service provider
    return true; // Replace with actual verification
}