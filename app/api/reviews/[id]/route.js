import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(req, { params }) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, decoded, error } = verifyToken(token);
    if (!valid) {
      return NextResponse.json({ error: error || 'Invalid or expired token' }, { status: 401 });
    }

    const { rating, comment } = await req.json();
    const reviewId = params.id;

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if this review belongs to the logged-in user
    const existing = await query(
      `SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
      [reviewId, decoded.id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 403 });
    }

    // Update review
    await query(
      `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`,
      [rating, comment, reviewId]
    );

    return NextResponse.json({ message: 'Review updated successfully' });

  } catch (err) {
    console.error('PATCH Review Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
export async function DELETE(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { valid, decoded, error } = verifyToken(token);
    if (!valid) {
      return NextResponse.json({ error: error || "Invalid token" }, { status: 401 });
    }

    const reviewId = params.id;

    // Check review ownership
    const existing = await query(
      `SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
      [reviewId, decoded.id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 403 }
      );
    }

    // Delete
    await query(`DELETE FROM reviews WHERE id = ?`, [reviewId]);

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("DELETE review error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}