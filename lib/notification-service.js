import { query } from '@/lib/mysql-wrapper';

export async function createNotification({
    type = 'system',
    title,
    content = null,
    userId = null,
    bookingId = null,
    meta = null,
    level = 'info'
}) {
    const sql = `
        INSERT INTO admin_notifications
        (type, title, content, user_id, booking_id, meta, level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
        type,
        title,
        content,
        userId,
        bookingId,
        meta ? JSON.stringify(meta) : null,
        level
    ]);
}
