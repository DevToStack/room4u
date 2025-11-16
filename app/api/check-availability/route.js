import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function POST(req) {
    try {
        const { apartment_id, checkin, checkout } = await req.json();

        if (!apartment_id || !checkin || !checkout) {
            return NextResponse.json(
                { available: false, message: 'Missing input data.' },
                { status: 400 }
            );
        }

        // Convert to date objects
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        // Strip time from all dates
        checkinDate.setHours(0, 0, 0, 0);
        checkoutDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Validate date formats
        if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
            return NextResponse.json(
                { available: false, message: 'Invalid date format.' },
                { status: 400 }
            );
        }

        // Ensure check-in is in the future (or same day if allowed)
        if (checkinDate <= today) {
            return NextResponse.json(
                { available: false, message: "The check-in date must be a future date." },
                { status: 400 }
            );
        }

        // Ensure check-out is after check-in
        if (checkinDate >= checkoutDate) {
            return NextResponse.json(
                { available: false, message: 'Check-out date must be after check-in date.' },
                { status: 400 }
            );
        }

        // Check overlapping bookings
        const results = await query(
            `
            SELECT start_date, end_date
            FROM bookings
            WHERE apartment_id = ?
            AND (
                    status IN ('confirmed', 'pendig')
                    OR (status = 'pending' AND expires_at > NOW())
                )
            ORDER BY start_date ASC

            `,
            [apartment_id, checkin, checkin, checkout, checkout, checkin, checkout]
        );

        if (results.length > 0) {
            return NextResponse.json({
                available: false,
                message: 'Apartment not available for selected dates.',
            });
        }

        return NextResponse.json({
            available: true,
            message: 'Apartment is available!',
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        return NextResponse.json(
            { available: false, message: 'Internal server error.' },
            { status: 500 }
        );
    }
}
