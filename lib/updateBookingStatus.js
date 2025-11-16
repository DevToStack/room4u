import { query } from "./mysql-wrapper";

export async function updateBookingStatus() {
    // Switch confirmed → ongoing
    await query(`
        UPDATE bookings
        SET status = 'ongoing'
        WHERE status IN ('confirmed', 'paid')
        AND CURDATE() BETWEEN start_date AND DATE_SUB(end_date, INTERVAL 1 DAY)
    `);

    // Switch ongoing → expired (or completed)
    await query(`
        UPDATE bookings
        SET status = 'expired'
        WHERE status = 'ongoing'
        AND CURDATE() >= end_date
    `);
}
