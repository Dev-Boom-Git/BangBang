import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { requireSuperAdmin, requireAdmin, logAdminAction } from '@/lib/auth';

// GET /api/admin/users — list all users (admin+)
export async function GET(request) {
    const user = await requireAdmin(request);
    if (!user) {
        return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    try {
        const [users] = await pool.query(
            'SELECT id, name, email, phone, role, created_at FROM users ORDER BY FIELD(role, "superadmin", "admin", "staff", "customer"), created_at DESC'
        );
        return NextResponse.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// POST /api/admin/users — create staff/admin user (superadmin only)
export async function POST(request) {
    const user = await requireSuperAdmin(request);
    if (!user) {
        return NextResponse.json({ error: 'เฉพาะ Super Admin เท่านั้น' }, { status: 403 });
    }

    try {
        const { name, email, password, phone, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
        }

        if (!['staff', 'admin', 'superadmin'].includes(role)) {
            return NextResponse.json({ error: 'Role ไม่ถูกต้อง' }, { status: 400 });
        }

        // Check existing
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, role]
        );

        await logAdminAction(user, 'create_user', 'user', result.insertId, { name, email, role }, request);

        return NextResponse.json({
            id: result.insertId, name, email, phone, role
        }, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
