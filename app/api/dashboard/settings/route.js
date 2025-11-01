// app/api/dashboard/settings/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
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
    let connection;
    try {
        const cookieStore = await cookies();
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
        const body = await request.json();

        // Support both individual field updates and bulk updates
        const updates = {};
        const allowedFields = ['name', 'email', 'altEmail', 'phone', 'altPhone'];

        // Filter only allowed fields that are present in the request
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        });

        // If no valid fields to update
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        connection = await pool.getConnection();

        // Build dynamic UPDATE query based on provided fields
        const setClauses = [];
        const values = [];

        if (updates.name !== undefined) {
            setClauses.push('name = ?');
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            setClauses.push('email = ?');
            values.push(updates.email);
        }
        if (updates.altEmail !== undefined) {
            setClauses.push('alternate_email = ?');
            values.push(updates.altEmail);
        }
        if (updates.phone !== undefined) {
            setClauses.push('phone_number = ?');
            values.push(updates.phone);
        }
        if (updates.altPhone !== undefined) {
            setClauses.push('alternate_phone = ?');
            values.push(updates.altPhone);
        }

        values.push(userId);

        const updateQuery = `
            UPDATE users 
            SET ${setClauses.join(', ')}
            WHERE id = ?
        `;

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows === 0) {
            throw new Error('User not found or no changes made');
        }

        // Log activity - include which field was updated
        const updatedFields = Object.keys(updates).join(', ');
        await connection.execute(`
            INSERT INTO user_activity (user_id, message)
            VALUES (?, ?)
        `, [userId, `Updated profile fields: ${updatedFields}`]);

        connection.release();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            updatedFields: Object.keys(updates)
        });

    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error('Error updating profile:', error);

        if (error.message.includes('Duplicate entry') || error.message.includes('email')) {
            return NextResponse.json(
                { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}