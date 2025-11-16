// /app/api/admin/inbox/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';

export async function GET(req) {
    let connection;

    try {
        connection = await pool.getConnection();
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        // Get all messages with user info
        const [rows] = await connection.query(`
            SELECT
                m.id,
                m.senderName,
                m.subject,
                m.body,
                m.readed,
                m.createdAt,
                m.user_id,
                u.id as uid,
                u.email AS senderEmail,
                u.phone_number AS senderPhone
            FROM messages AS m
            LEFT JOIN users AS u ON u.id = m.user_id
            ORDER BY m.createdAt DESC
        `);

        const messages = rows.map(msg => ({
            ...msg,
            read: Boolean(msg.readed),
            isAdmin: msg.direction === 'outgoing'
        }));

        return NextResponse.json({ messages });
    } catch (err) {
        console.error('Inbox API error:', err);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

export async function POST(req) {
    let connection;

    try {
        connection = await pool.getConnection();
        const cookies = parseCookies(req.headers.get("cookie"));
        const token = cookies.token;

        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { userId, message, userEmail, userName } = await req.json();

        if (!message || (!userId && !userEmail)) {
            return NextResponse.json({ error: 'Message and user identifier are required' }, { status: 400 });
        }

        // Find or create user
        let user_id = userId;
        if (!user_id && userEmail) {
            const [existingUser] = await connection.query(
                'SELECT id FROM users WHERE email = ?',
                [userEmail]
            );

            if (existingUser.length > 0) {
                user_id = existingUser[0].id;
            } else {
                // Create new user entry
                const [newUser] = await connection.query(
                    'INSERT INTO users (email, name, phone_number) VALUES (?, ?, ?)',
                    [userEmail, userName || 'Unknown User', '']
                );
                user_id = newUser.insertId;
            }
        }

        // Insert admin message
        const [result] = await connection.query(
            `INSERT INTO messages (user_id, senderName, subject, body, direction, readed)
             VALUES (?, ?, ?, ?, 'outgoing', TRUE)`,
            [user_id, 'Admin', 'Admin Reply', message]
        );

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            messageId: result.insertId
        });
    } catch (err) {
        console.error('Send message API error:', err);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
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
            query = `UPDATE messages SET readed = FALSE WHERE id = ?`;
            params = [messageId];
        } else {
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

        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const url = new URL(req.url);
        const messageId = url.searchParams.get('id');

        if (!messageId) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

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