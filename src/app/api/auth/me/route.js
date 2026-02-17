import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

// GET /api/auth/me
export async function GET(request) {
    try {
        const decoded = await authenticateRequest(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [users] = await pool.query(
            'SELECT id, name, email, phone, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: users[0] });
    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
