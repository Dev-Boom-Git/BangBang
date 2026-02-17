import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSuperAdmin, logAdminAction } from '@/lib/auth';

// PUT /api/admin/users/[id] — update user role (superadmin only)
export async function PUT(request, { params }) {
    const user = await requireSuperAdmin(request);
    if (!user) {
        return NextResponse.json({ error: 'เฉพาะ Super Admin เท่านั้น' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const { role, name, phone } = await request.json();

        // Can't change own role
        if (parseInt(id) === user.id) {
            return NextResponse.json({ error: 'ไม่สามารถเปลี่ยน role ตัวเองได้' }, { status: 400 });
        }

        if (role && !['customer', 'staff', 'admin', 'superadmin'].includes(role)) {
            return NextResponse.json({ error: 'Role ไม่ถูกต้อง' }, { status: 400 });
        }

        // Build update query
        const updates = [];
        const values = [];
        if (role) { updates.push('role = ?'); values.push(role); }
        if (name) { updates.push('name = ?'); values.push(name); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'ไม่มีข้อมูลให้อัพเดท' }, { status: 400 });
        }

        values.push(id);
        await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

        await logAdminAction(user, 'update_user', 'user', parseInt(id), { role, name, phone }, request);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] — delete user (superadmin only)
export async function DELETE(request, { params }) {
    const user = await requireSuperAdmin(request);
    if (!user) {
        return NextResponse.json({ error: 'เฉพาะ Super Admin เท่านั้น' }, { status: 403 });
    }

    const { id } = await params;

    if (parseInt(id) === user.id) {
        return NextResponse.json({ error: 'ไม่สามารถลบตัวเองได้' }, { status: 400 });
    }

    try {
        // Get user info before deleting for log
        const [target] = await pool.query('SELECT name, email, role FROM users WHERE id = ?', [id]);
        if (target.length === 0) {
            return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        await logAdminAction(user, 'delete_user', 'user', parseInt(id),
            { deleted_name: target[0].name, deleted_email: target[0].email, deleted_role: target[0].role }, request);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
