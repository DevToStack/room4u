// lib/booking-validation.js 
import { z } from 'zod';

// Config-driven constants
const MAX_GUESTS = 10;
const MAX_STAY_DAYS = 90;

// === Guest schema ===
const guestSchema = z.object({
    name: z.string().min(2, "Guest name is required"),
    age: z.preprocess(
        (val) => val ? Number(val) : undefined,
        z.number().int().min(1).max(120)
    ),
    gender: z.enum(["male", "female", "other"], {
        required_error: "Gender is required"
    }),
    phone: z.string()
        .min(8, "Phone number is too short")
        .max(15, "Phone number is too long")
});

// === Main booking schema ===
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
    ),

    // === NEW FIELD ===
    guest_details: z.array(guestSchema)
        .min(1, "Guest details required")
        .max(MAX_GUESTS, `Maximum ${MAX_GUESTS} guest records allowed`)
});

export function validateBookingData(data) {
    try {
        if (!data || typeof data !== 'object') {
            return {
                isValid: false,
                errors: ['Invalid booking data: expected object'],
                data: null
            };
        }

        const parsedData = bookingSchema.parse(data);
        const errors = [];

        // --- Date checks ---
        if (!parsedData.check_in || isNaN(parsedData.check_in)) {
            errors.push('Invalid check-in date');
        }

        if (!parsedData.check_out || isNaN(parsedData.check_out)) {
            errors.push('Invalid check-out date');
        }

        if (errors.length === 0) {
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

        // === Guest count vs guest_details ===
        if (parsedData.guest_details.length !== parsedData.guests) {
            errors.push(
                `Guests count (${parsedData.guests}) does not match guest details (${parsedData.guest_details.length})`
            );
        }

        // === AGE VALIDATION ===
        const ages = parsedData.guest_details.map(g => g.age);

        // Single guest → must be adult
        if (parsedData.guests === 1) {
            if (ages[0] < 18) {
                errors.push("Guest must be at least 18 years old when booking for one person.");
            }
        }

        // 2+ guests → at least ONE adult
        if (parsedData.guests >= 2) {
            const hasAdult = ages.some(a => a >= 18);
            if (!hasAdult) {
                errors.push("At least one guest must be an adult (18+) when booking for two or more guests.");
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: parsedData
        };

    } catch (error) {
        console.error('Validation error caught:', error);

        if (error instanceof z.ZodError) {
            const errorMessages = error.errors?.map(err => {
                const path = Array.isArray(err.path) ? err.path.join('.') : 'unknown';
                return `${path}: ${err.message}`;
            });

            return {
                isValid: false,
                errors: errorMessages,
                data: null
            };
        }

        return {
            isValid: false,
            errors: [error?.message || 'Invalid booking data format'],
            data: null
        };
    }
}

