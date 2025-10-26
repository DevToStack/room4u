// /app/api/admin/inbox/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';

export async function PUT(req, { params }) {
    let connection;
    const { id } = params;
    const { markAs } = req.json();
    try {
        connection = await pool.getConnection();
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        // ✅ Use adminAuth helper
        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

        let query;
        let params;

        if (markAs === 'unread') {
            // Mark as unread
            query = `UPDATE messages SET readed = FALSE WHERE id = ?`;
            params = [id];
        } else {
            // Mark as read (default behavior)
            query = `UPDATE messages SET readed = TRUE WHERE id = ?`;
            params = [id];
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

export async function DELETE(req, { params }) {
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

        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

        // Delete the message
        const [result] = await connection.query(
            `DELETE FROM messages WHERE id = ?`,
            [id]
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