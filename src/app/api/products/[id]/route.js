import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin, logAdminAction } from '@/lib/auth';

// GET /api/products/[id]
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const [products] = await pool.query(
            `SELECT p.*, c.name as category_name, c.name_th as category_name_th, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
            [id]
        );

        if (products.length === 0) {
            return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });
        }

        return NextResponse.json({ product: products[0] });
    } catch (error) {
        console.error('Product GET error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// PUT /api/products/[id]
export async function PUT(request, { params }) {
    try {
        const admin = await requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const fields = [];
        const values = [];

        const allowedFields = ['name', 'name_th', 'description', 'price', 'image', 'category_id', 'in_stock', 'featured'];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(body[field]);
            }
        }

        if (fields.length === 0) {
            return NextResponse.json({ error: 'ไม่มีข้อมูลที่ต้องอัปเดต' }, { status: 400 });
        }

        values.push(id);
        await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);

        await logAdminAction(admin, 'update_product', 'product', parseInt(id), body, request);

        return NextResponse.json({ message: 'อัปเดตสินค้าสำเร็จ' });
    } catch (error) {
        console.error('Product PUT error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
    try {
        const admin = await requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const [existing] = await pool.query('SELECT name FROM products WHERE id = ?', [id]);
        await pool.query('DELETE FROM products WHERE id = ?', [id]);

        await logAdminAction(admin, 'delete_product', 'product', parseInt(id), { deleted_name: existing[0]?.name }, request);

        return NextResponse.json({ message: 'ลบสินค้าสำเร็จ' });
    } catch (error) {
        console.error('Product DELETE error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
