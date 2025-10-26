// app/api/reviews/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(req, { params }) {
  try {
    // ✅ Get token from cookies instead of headers
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Verify token using custom helper
    const { valid, decoded, error } = verifyToken(token);
    if (!valid) {
      return NextResponse.json({ error: error || 'Invalid or expired token' }, { status: 401 });
    }

    const { rating, comment } = await req.json();
    const reviewId = params.id;

    // ✅ Ensure the review belongs to the user
    const existing = await query(
      `SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
      [reviewId, decoded.id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 403 });
    }

    // ✅ Update review
    await query(
      `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`,
      [rating, comment, reviewId]
    );

    return NextResponse.json({ message: 'Review updated successfully' });

  } catch (err) {
    console.error('PATCH review error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
