import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/logs — view admin activity logs (admin+)
export async function GET(request) {
    const user = await requireAdmin(request);
    if (!user) {
        return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 50;
        const offset = parseInt(searchParams.get('offset')) || 0;
        const userId = searchParams.get('user_id');
        const action = searchParams.get('action');

        let query = 'SELECT * FROM admin_logs';
        const conditions = [];
        const values = [];

        if (userId) {
            conditions.push('user_id = ?');
            values.push(userId);
        }
        if (action) {
            conditions.push('action LIKE ?');
            values.push(`%${action}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        values.push(limit, offset);

        const [logs] = await pool.query(query, values);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM admin_logs';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [countResult] = await pool.query(countQuery, values.slice(0, -2));

        return NextResponse.json({
            logs,
            total: countResult[0].total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Get logs error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
