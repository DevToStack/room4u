// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const token = req.cookies.get('token')?.value;

        if (token) {
            // Hash the token to match DB
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

            // Delete session from DB
            await query('DELETE FROM sessions WHERE token = ?', [tokenHash]);
        }

        // Clear cookies
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });

        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            maxAge: 0,
        });

        response.cookies.set('csrfToken', '', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            maxAge: 0,
        });

        return response;
    } catch (err) {
        console.error('Logout Error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
