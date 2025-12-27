// app/api/bookings/create-temp/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { validateBookingData } from '@/lib/booking-validation';
import { createTempBooking } from '@/lib/booking-service';
import { verifyToken } from '@/lib/jwt'; // sync
import { createNotification } from '@/lib/notification-service';

// === RATE LIMITER ===
const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
    limit: 5, // 5 requests per interval per user
});

export async function POST(request) {
    try {
        // === 1. PARSE BODY ===
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { error: 'Invalid JSON payload', code: 'INVALID_JSON' },
                { status: 400 }
            );
        }
        // === 2. AUTHENTICATION ===
        const cookieStore = await cookies(); // ✅ await required in Next.js 13+
        const sessionToken = cookieStore.get('token')?.value;
        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired session', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;

        // === 3. RATE LIMITING ===
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
        const identifier = sessionToken || ip || 'anonymous';
        const allowed = await limiter.check(identifier);
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
                { status: 429 }
            );
        }

        // === 4. VALIDATION ===
        const validation = validateBookingData(body);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: `Invalid booking data: ${validation.errors.join(', ')}`,
                    code: 'VALIDATION_ERROR',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // === 5. CREATE TEMPORARY BOOKING ===
        const bookingResult = await createTempBooking(validation.data,userId);
        console.log('Booking Result:', bookingResult.bookingId);
        if (!bookingResult.success) {
            return NextResponse.json(
                {
                    error: bookingResult.error || 'Failed to create booking',
                    code: bookingResult.code || 'BOOKING_ERROR'
                },
                { status: bookingResult.statusCode || 400 }
            );
        }
        if (bookingResult.success) {
            await createNotification({
                type: 'booking',
                title: 'Booking Request',
                content: 'User booking request has been submitted and is awaiting admin verification.',
                userId,
                bookingId: bookingResult.bookingId,
                meta: {
                    status: 'pending',
                    apartment_id: validation.data.apartment_id,
                    check_in: validation.data.check_in,
                    check_out: validation.data.check_out
                },
                level: 'info'
            });
        }
        
        // === 6. SUCCESS RESPONSE ===
        return NextResponse.json({
            success: true,
            bookingId: bookingResult.bookingId,
            message: 'Temporary booking created successfully.Wait for admin Verification.'
        }, { status: 201 });

    } catch (error) {
        console.error({
            error
        });

        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
