// /app/api/admin/inbox/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // your MySQL pool
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';

export async function GET(req) {
    let connection;

    try {
        connection = await pool.getConnection();
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const [rows] = await connection.query(
`            SELECT id, senderName, subject, body, readed, createdAt
            FROM messages
            ORDER BY createdAt DESC
            LIMIT 50;
            `
        );

        // Convert readed to read for frontend compatibility
        const messages = rows.map(msg => ({
            ...msg,
            read: Boolean(msg.readed)
        }));

        return NextResponse.json({ messages });
    } catch (err) {
        console.error('Inbox API error:', err);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

export async function PUT(req) {
    let connection;

    try {
        connection = await pool.getConnection();
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { messageId, markAs } = await req.json();

        if (!messageId) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

        let query;
        let params;

        if (markAs === 'unread') {
            // Mark as unread
            query = `UPDATE messages SET readed = FALSE WHERE id = ?`;
            params = [messageId];
        } else {
            // Mark as read (default behavior)
            query = `UPDATE messages SET readed = TRUE WHERE id = ?`;
            params = [messageId];
        }

        const [result] = await connection.query(query, params);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        const action = markAs === 'unread' ? 'unread' : 'read';
        return NextResponse.json({
            success: true,
            message: `Message marked as ${action}`
        });
    } catch (err) {
        console.error('Mark as read/unread API error:', err);
        return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

export async function DELETE(req) {
    let connection;

    try {
        connection = await pool.getConnection();
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        // Get message ID from URL search params
        const url = new URL(req.url);
        const messageId = url.searchParams.get('id');

        if (!messageId) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

        // Delete the message
        const [result] = await connection.query(
            `DELETE FROM messages WHERE id = ?`,
            [messageId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Delete message API error:', err);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// New endpoint for individual message operations
export async function PATCH(req) {
    let connection;

    try {
        connection = await pool.getConnection();
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { messageId, action } = await req.json();

        if (!messageId || !action) {
            return NextResponse.json({ error: 'Message ID and action are required' }, { status: 400 });
        }

        let query;
        let params;

        switch (action) {
            case 'mark-read':
                query = `UPDATE messages SET readed = TRUE WHERE id = ?`;
                params = [messageId];
                break;
            case 'mark-unread':
                query = `UPDATE messages SET readed = FALSE WHERE id = ?`;
                params = [messageId];
                break;
            case 'archive':
                query = `UPDATE messages SET archived = TRUE WHERE id = ?`;
                params = [messageId];
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const [result] = await connection.query(query, params);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `Message ${action.replace('-', ' ')} successfully`
        });
    } catch (err) {
        console.error('Message action API error:', err);
        return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}