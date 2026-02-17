import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin, logAdminAction } from '@/lib/auth';

// GET /api/products — list all products
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        let query = `
      SELECT p.*, c.name as category_name, c.name_th as category_name_th, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
        const params = [];
        const conditions = [];

        if (category) {
            conditions.push('c.slug = ?');
            params.push(category);
        }
        if (featured === 'true') {
            conditions.push('p.featured = TRUE');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.featured DESC, p.created_at DESC';

        const [products] = await pool.query(query, params);
        return NextResponse.json({ products });
    } catch (error) {
        console.error('Products GET error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// POST /api/products — admin create product
export async function POST(request) {
    try {
        const admin = await requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, name_th, description, price, image, category_id, in_stock, featured } = await request.json();

        if (!name || !name_th || !price) {
            return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
        }

        const [result] = await pool.query(
            `INSERT INTO products (name, name_th, description, price, image, category_id, in_stock, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, name_th, description || '', price, image || null, category_id || null, in_stock !== false, featured || false]
        );

        await logAdminAction(admin, 'create_product', 'product', result.insertId, { name, name_th, price }, request);

        return NextResponse.json({ id: result.insertId, message: 'เพิ่มสินค้าสำเร็จ' }, { status: 201 });
    } catch (error) {
        console.error('Products POST error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
