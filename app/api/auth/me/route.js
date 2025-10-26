import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // must match login route

export async function GET(req) {
    try {
        // Extract token from cookies
        const cookieStore = await cookies();
        const token =  cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }
        
        // ✅ Verify JWT
        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json(
                { success: false, message: 'Invalid token: ' + error },
                { status: 401 }
            );
        }

        // Get user from database
        const [user] = await query(
            'SELECT name FROM users WHERE id = ? LIMIT 1',
            [decoded.id]
        );

        if (!user || user.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            name: user.name,
        });
    } catch (err) {
        console.error('Error verifying user:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
