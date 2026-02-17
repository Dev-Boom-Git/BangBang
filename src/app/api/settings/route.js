import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin, logAdminAction } from '@/lib/auth';

// GET /api/settings
export async function GET() {
    try {
        const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
        const settings = {};
        for (const row of rows) {
            settings[row.setting_key] = row.setting_value;
        }
        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// PUT /api/settings — admin update settings
export async function PUT(request) {
    try {
        const admin = await requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await request.json();

        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }

        await logAdminAction(admin, 'update_settings', 'settings', null, { keys: Object.keys(settings) }, request);

        return NextResponse.json({ message: 'อัปเดตการตั้งค่าสำเร็จ' });
    } catch (error) {
        console.error('Settings PUT error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
