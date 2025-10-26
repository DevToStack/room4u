// app/api/dashboard/settings/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
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
        
        const connection = await pool.getConnection();
        

        // Get user profile
        const [user] = await connection.execute(`
      SELECT 
        id, name, email, alternate_email as altEmail, 
        phone_number as phone, alternate_phone as altPhone,
        role, plan, created_at
      FROM users 
      WHERE id = ?
    `, [userId]);

        // Get user activity
        const [activities] = await connection.execute(`
      SELECT message, date
      FROM user_activity
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 10
    `, [userId]);

        connection.release();

        const settingsData = {
            profile: user[0] || {},
            preferences: {
                dateFormat: 'DD/MM/YYYY',
                timezone: 'IST',
                currency: 'INR',
                emailNotifications: true,
                smsNotifications: false
            },
            activities: activities || []
        };

        return NextResponse.json(settingsData);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { name, email, altEmail, phone, altPhone } = body;
        const userId = 1; // Replace with actual user ID from auth

        const connection = await pool.getConnection();

        await connection.execute(`
      UPDATE users 
      SET name = ?, email = ?, alternate_email = ?, 
          phone_number = ?, alternate_phone = ?
      WHERE id = ?
    `, [name, email, altEmail, phone, altPhone, userId]);

        // Log activity
        await connection.execute(`
      INSERT INTO user_activity (user_id, message)
      VALUES (?, 'Updated profile information')
    `, [userId]);

        connection.release();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}