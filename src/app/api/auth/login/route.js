import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

// POST /api/auth/login
export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
                { status: 400 }
            );
        }

        const [users] = await pool.query(
            'SELECT id, name, email, password, phone, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
                { status: 401 }
            );
        }

        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
                { status: 401 }
            );
        }

        const token = signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
