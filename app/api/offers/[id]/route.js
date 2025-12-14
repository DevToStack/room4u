import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';

export async function DELETE(request, { params }) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        // 🔒 Admin validation
        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const { id } = params;

        // Soft delete (set is_active = false)
        const [result] = await pool.query(
            'UPDATE offers SET is_active = FALSE WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, error: 'Offer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Offer deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting offer:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}