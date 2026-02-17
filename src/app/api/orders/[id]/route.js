import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// PUT /api/orders/[id] — admin update order status
export async function PUT(request, { params }) {
    try {
        const admin = await requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await request.json();

        const validStatuses = ['pending', 'paid', 'preparing', 'shipping', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
        }

        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        return NextResponse.json({ message: 'อัปเดตสถานะสำเร็จ' });
    } catch (error) {
        console.error('Order PUT error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}

// GET /api/orders/[id] — get single order
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);

        if (orders.length === 0) {
            return NextResponse.json({ error: 'ไม่พบรายการสั่งซื้อ' }, { status: 404 });
        }

        const order = orders[0];
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
        order.items = items;

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Order GET error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
