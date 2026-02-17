import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

// POST /api/auth/register
export async function POST(request) {
    try {
        const { name, email, password, phone } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่าน' },
                { status: 400 }
            );
        }

        // Check if user exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, 'customer']
        );

        const token = signToken({
            id: result.insertId,
            email,
            name,
            role: 'customer',
        });

        return NextResponse.json({
            token,
            user: { id: result.insertId, name, email, phone, role: 'customer' },
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
