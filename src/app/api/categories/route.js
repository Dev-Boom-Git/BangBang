import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/categories
export async function GET() {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY id');
        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Categories GET error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
