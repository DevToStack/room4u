import pool from './db';

export async function createTempBooking(bookingData, userIdFromToken) {
    const connection = await pool.getConnection();

    try {
        await connection.query('START TRANSACTION');

        // === 1. CHECK APARTMENT EXISTS ===
        const [apartmentResult] = await connection.execute(
            `SELECT id, price_per_night, max_guests FROM apartments WHERE id = ?`,
            [bookingData.apartment_id]
        );

        if (apartmentResult.length === 0) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'Apartment not found',
                code: 'APARTMENT_NOT_FOUND',
                statusCode: 404
            };
        }

        const apartment = apartmentResult[0];

        // === 2. VALIDATE GUEST COUNT ===
        if (bookingData.guests > apartment.max_guests) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: `Maximum ${apartment.max_guests} guests allowed for this apartment`,
                code: 'EXCEEDS_MAX_GUESTS',
                statusCode: 400
            };
        }

        // === 3. CHECK DATE AVAILABILITY ===
        const [availabilityResult] = await connection.execute(
            `SELECT id FROM bookings
       WHERE apartment_id = ?
         AND status IN ('pending', 'confirmed')
         AND (
           (start_date <= ? AND end_date >= ?) OR
           (start_date BETWEEN ? AND ?) OR
           (end_date BETWEEN ? AND ?)
         )
         AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`,
            [
                bookingData.apartment_id,
                bookingData.check_out,
                bookingData.check_in,
                bookingData.check_in,
                bookingData.check_out,
                bookingData.check_in,
                bookingData.check_out
            ]
        );

        if (availabilityResult.length > 0) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'Apartment not available for selected dates',
                code: 'DATES_NOT_AVAILABLE',
                statusCode: 409
            };
        }

        // === 4. CALCULATE EXPIRATION TIME ===
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        // === 5. INSERT TEMP BOOKING ===
        const [insertResult] = await connection.execute(
            `INSERT INTO bookings (
        user_id, apartment_id, start_date, end_date,
        guests, total_amount, nights, status, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userIdFromToken,           // use decoded JWT userId
                bookingData.apartment_id,
                bookingData.check_in,
                bookingData.check_out,
                bookingData.guests,
                bookingData.total_amount,
                bookingData.nights,
                'pending',
                expiresAt
            ]
        );

        console.log('[Gusests] : ' + bookingData.guests)
        await connection.query('COMMIT');

        return {
            success: true,
            bookingId: insertResult.insertId,
            expiresAt
        };

    } catch (error) {
        await connection.query('ROLLBACK');
        console.error({
            context: 'createTempBooking',
            message: error.message,
            stack: error.stack
        });

        return {
            success: false,
            error: error.message || 'Database operation failed',
            code: 'DATABASE_ERROR',
            statusCode: 500
        };
    } finally {
        connection.release();
    }
}
