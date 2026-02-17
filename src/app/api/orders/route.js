import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, requireAdmin } from '@/lib/auth';

// GET /api/orders
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');
        const status = searchParams.get('status');

        const user = await authenticateRequest(request);

        let query = 'SELECT * FROM orders';
        const params = [];
        const conditions = [];

        // If admin, show all orders; if customer, show only their orders
        if (user && user.role === 'admin') {
            if (status) {
                conditions.push('status = ?');
                params.push(status);
            }
        } else if (user) {
            conditions.push('user_id = ?');
            params.push(user.id);
        } else if (phone) {
            conditions.push('phone = ?');
            params.push(phone);
        } else {
            return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบหรือค้นหาด้วยเบอร์โทร' }, { status: 400 });
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const [orders] = await pool.query(query, params);

        // Get order items for each order
        for (const order of orders) {
            const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            order.items = items;
        }

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Orders GET error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// POST /api/orders — create new order
export async function POST(request) {
    try {
        const body = await request.json();
        const { customer_name, phone, address, items, total, slip_image, note } = body;

        if (!customer_name || !phone || !address || !items || items.length === 0) {
            return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
        }

        // Check if user is authenticated
        const user = await authenticateRequest(request);
        const userId = user ? user.id : null;

        const [result] = await pool.query(
            `INSERT INTO orders (user_id, customer_name, phone, address, total, slip_image, note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, customer_name, phone, address, total, slip_image || null, note || null]
        );

        const orderId = result.insertId;

        // Insert order items
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.product_name, item.quantity, item.price]
            );
        }

        return NextResponse.json({ id: orderId, message: 'สั่งซื้อสำเร็จ' }, { status: 201 });
    } catch (error) {
        console.error('Orders POST error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
