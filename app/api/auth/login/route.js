import { query } from '@/lib/mysql-wrapper';
import { generateToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logActivity } from '@/lib/logActivity';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const users = await query(`SELECT id, email, password, role FROM users WHERE email = ?`, [
            email.toLowerCase().trim(),
        ]);

        if (!users.length)
            return NextResponse.json({ error: 'Incorrect email or password' }, { status: 404 });

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });

        // ─── Generate JWT with exp claim ───────────────────────────
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // expires in 7 days
        });

        // ─── Insert session into DB ────────────────────────────────
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        await query(`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`, [
            user.id,
            tokenHash,
            expiresAt,
        ]);

        // ─── Generate CSRF token ──────────────────────────────────
        const csrfToken = crypto.randomBytes(32).toString('hex');

        // ─── Build response ───────────────────────────────────────
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            role: user.role,
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        response.cookies.set('csrfToken', csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });          

        await logActivity(user.id, 'Logged in successfully');
        return response;
    } catch (err) {
        console.error('Login Error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
