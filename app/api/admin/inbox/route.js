// /app/api/admin/inbox/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';

// Function to generate consistent color based on user ID
function getUserColor(userId) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    return colors[Math.abs(userId) % colors.length];
}

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

        // Get all messages with user info, ordered by user and creation time
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
                u.phone_number AS senderPhone,
                u.name AS userName
            FROM messages AS m
            LEFT JOIN users AS u ON u.id = m.user_id
            ORDER BY m.user_id ASC, m.createdAt DESC
        `);

        const [bId] = await connection.query(`SELECT id as bID FROM bookings`);

        // Group messages by user_id
        const usersMap = new Map();

        rows.forEach(msg => {
            const userId = msg.user_id;

            if (!usersMap.has(userId)) {
                usersMap.set(userId, {
                    userInfo: {
                        id: userId,
                        name: msg.userName || msg.senderName || 'Unknown User',
                        email: msg.senderEmail,
                        phone: msg.senderPhone,
                        color: getUserColor(userId),
                        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.userName || msg.senderName || 'Unknown User')}&background=${getUserColor(userId).replace('#', '')}&color=fff`
                    },
                    messages: []
                });
            }

            const userData = usersMap.get(userId);
            userData.messages.push({
                id: msg.id,
                senderName: msg.senderName,
                subject: msg.subject,
                body: msg.body,
                read: Boolean(msg.readed),
                createdAt: msg.createdAt,
                direction: msg.direction,
                isAdmin: msg.direction === 'outgoing'
            });
        });

        // Convert map to array and sort by latest message date
        const usersWithMessages = Array.from(usersMap.values()).map(userData => {
            // Sort messages by date (newest first) for this user
            userData.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Get latest message info for the user card
            const latestMessage = userData.messages[0];

            return {
                ...userData,
                latestSubject: latestMessage?.subject || 'No Subject',
                latestMessage: latestMessage?.body || 'No message content',
                latestCreatedAt: latestMessage?.createdAt,
                unreadCount: userData.messages.filter(msg => !msg.read && msg.direction !== 'outgoing').length,
                totalMessages: userData.messages.length
            };
        });

        // Sort users by latest message date (newest first)
        usersWithMessages.sort((a, b) => new Date(b.latestCreatedAt) - new Date(a.latestCreatedAt));

        return NextResponse.json({
            users: usersWithMessages,
            bId,
            totalUsers: usersWithMessages.length,
            totalMessages: rows.length
        });
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

        const { userId, message, userEmail, userName, subject = 'Admin Reply' } = await req.json();

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
            [user_id, 'Admin', subject, message]
        );

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            messageId: result.insertId,
            userId: user_id
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

        const { messageId, userId, markAs } = await req.json();

        if (!messageId && !userId) {
            return NextResponse.json({ error: 'Message ID or User ID is required' }, { status: 400 });
        }

        let query;
        let params;

        if (messageId) {
            // Mark single message
            if (markAs === 'unread') {
                query = `UPDATE messages SET readed = FALSE WHERE id = ?`;
                params = [messageId];
            } else {
                query = `UPDATE messages SET readed = TRUE WHERE id = ?`;
                params = [messageId];
            }
        } else if (userId) {
            // Mark all messages from user as read
            query = `UPDATE messages SET readed = TRUE WHERE user_id = ? AND direction != 'outgoing'`;
            params = [userId];
        }

        const [result] = await connection.query(query, params);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        const action = markAs === 'unread' ? 'unread' : 'read';
        return NextResponse.json({
            success: true,
            message: userId ? `All messages from user marked as read` : `Message marked as ${action}`,
            affectedRows: result.affectedRows
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
        const userId = url.searchParams.get('userId');

        if (!messageId && !userId) {
            return NextResponse.json({ error: 'Message ID or User ID is required' }, { status: 400 });
        }

        let query;
        let params;

        if (messageId && messageId !== "null" && messageId !== "undefined") {
            query = `DELETE FROM messages WHERE id = ?`;
            params = [Number(messageId)];
        } else if (userId && userId !== "null" && userId !== "undefined") {
            query = `DELETE FROM messages WHERE user_id = ?`;
            params = [Number(userId)];
        } else {
            return NextResponse.json(
                { error: "Invalid messageId or userId" },
                { status: 400 }
            );
        }
        

        const [result] = await connection.query(query, params);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: messageId ? 'Message deleted successfully' : 'All user messages deleted successfully',
            deletedCount: result.affectedRows
        });
    } catch (err) {
        console.error('Delete message API error:', err);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}