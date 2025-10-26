// lib/booking-validation.js
import { z } from 'zod';

// Config-driven constants
const MAX_GUESTS = 10;
const MAX_STAY_DAYS = 90;

const bookingSchema = z.object({
    apartment_id: z.preprocess(
        (val) => val ? Number(val) : undefined,
        z.number().int().positive('Apartment ID must be positive')
    ),
    check_in: z.preprocess(
        (val) => val ? new Date(val) : undefined,
        z.date({ required_error: 'Invalid check-in date' })
    ),
    check_out: z.preprocess(
        (val) => val ? new Date(val) : undefined,
        z.date({ required_error: 'Invalid check-out date' })
    ),
    guests: z.preprocess(
        (val) => val ? Number(val) : undefined,
        z.number()
            .int()
            .min(1, 'At least 1 guest required')
            .max(MAX_GUESTS, `Maximum ${MAX_GUESTS} guests allowed`)
    ),
    total_amount: z.preprocess(
        (val) => val ? Number(val) : undefined,
        z.number().positive('Total amount must be positive')
    ),
    nights: z.preprocess(
        (val) => val ? Number(val) : undefined,
        z.number().int().min(1, 'At least 1 night required')
    )
});

export function validateBookingData(data) {
    try {
        // Add input validation
        if (!data || typeof data !== 'object') {
            return {
                isValid: false,
                errors: ['Invalid booking data: expected object'],
                data: null
            };
        }

        const parsedData = bookingSchema.parse(data);

        const errors = [];

        // Add null checks for dates
        if (!parsedData.check_in || !(parsedData.check_in instanceof Date) || isNaN(parsedData.check_in)) {
            errors.push('Invalid check-in date');
        }

        if (!parsedData.check_out || !(parsedData.check_out instanceof Date) || isNaN(parsedData.check_out)) {
            errors.push('Invalid check-out date');
        }

        // Only proceed with date validation if dates are valid
        if (errors.length === 0) {
            // Use UTC dates to avoid time-zone issues
            const startUTC = Date.UTC(
                parsedData.check_in.getUTCFullYear(),
                parsedData.check_in.getUTCMonth(),
                parsedData.check_in.getUTCDate()
            );
            const endUTC = Date.UTC(
                parsedData.check_out.getUTCFullYear(),
                parsedData.check_out.getUTCMonth(),
                parsedData.check_out.getUTCDate()
            );
            const todayUTC = Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate()
            );

            if (startUTC < todayUTC) errors.push('Start date cannot be in the past');
            if (endUTC <= startUTC) errors.push('End date must be after start date');

            const dayDiff = Math.ceil((endUTC - startUTC) / (1000 * 3600 * 24));
            if (dayDiff > MAX_STAY_DAYS) errors.push(`Maximum stay is ${MAX_STAY_DAYS} days`);
            if (parsedData.nights !== dayDiff) errors.push('Night count does not match date range');
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: parsedData
        };

    } catch (error) {
        console.error('Validation error caught:', error);

        // DEFENSIVE ERROR HANDLING - This is where the fix is
        if (error instanceof z.ZodError) {
            // Safe error mapping with null checks
            const errorMessages = (error.errors && Array.isArray(error.errors))
                ? error.errors.map(err => {
                    const path = (err.path && Array.isArray(err.path))
                        ? err.path.join('.')
                        : 'unknown';
                    const message = err.message || 'Validation error';
                    return `${path}: ${message}`;
                })
                : ['Zod validation failed: unknown error structure'];

            return {
                isValid: false,
                errors: errorMessages,
                data: null
            };
        }

        // Handle non-Zod errors safely
        const errorMessage = error?.message || 'Invalid booking data format';
        return {
            isValid: false,
            errors: [errorMessage],
            data: null
        };
    }
}