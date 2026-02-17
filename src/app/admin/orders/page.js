'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Eye, Loader2 } from 'lucide-react';

export default function AdminOrdersPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewSlip, setViewSlip] = useState(null);

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchOrders = () => {
        if (!token) return;
        const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
        fetch(`/api/orders${params}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { setOrders(data.orders || []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, [token, statusFilter]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, { method: 'PUT', headers, body: JSON.stringify({ status: newStatus }) });
            if (res.ok) { toast.success('อัปเดตสถานะสำเร็จ'); fetchOrders(); }
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const statuses = [
        { value: 'all', label: 'ทั้งหมด' },
        { value: 'pending', label: 'รอชำระ' },
        { value: 'paid', label: 'ชำระแล้ว' },
        { value: 'preparing', label: 'จัดเตรียม' },
        { value: 'shipping', label: 'จัดส่ง' },
        { value: 'completed', label: 'สำเร็จ' },
        { value: 'cancelled', label: 'ยกเลิก' },
    ];

    const statusLabel = {
        pending: 'รอชำระเงิน', paid: 'ชำระแล้ว', preparing: 'กำลังจัดเตรียม',
        shipping: 'กำลังจัดส่ง', completed: 'สำเร็จ', cancelled: 'ยกเลิก',
    };

    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-black font-heading">📦 จัดการคำสั่งซื้อ</h1>
                <p className="text-muted-foreground">ดูและจัดการคำสั่งซื้อทั้งหมด</p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
                {statuses.map(s => (
                    <Button
                        key={s.value}
                        variant={statusFilter === s.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter(s.value)}
                    >
                        {s.label}
                    </Button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-bold">ไม่พบคำสั่งซื้อ</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order.id}>
                            <CardHeader className="pb-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-base">คำสั่งซื้อ #{order.id}</CardTitle>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <Badge variant={order.status}>{statusLabel[order.status]}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                    <div className="space-y-1">
                                        <p><span className="font-semibold">ลูกค้า:</span> {order.customer_name}</p>
                                        <p><span className="font-semibold">โทร:</span> {order.phone}</p>
                                        <p><span className="font-semibold">ที่อยู่:</span> {order.address}</p>
                                        {order.note && <p><span className="font-semibold">หมายเหตุ:</span> {order.note}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        {(order.items || []).map((item, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span className="text-muted-foreground">{item.product_name} x{item.quantity}</span>
                                                <span>฿{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="mb-4" />

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {order.slip_image && (
                                            <Button variant="outline" size="sm" onClick={() => setViewSlip(order.slip_image)} className="gap-1">
                                                <Eye className="w-3.5 h-3.5" /> ดูสลิป
                                            </Button>
                                        )}
                                        <select
                                            value={order.status}
                                            onChange={e => updateStatus(order.id, e.target.value)}
                                            className="h-9 rounded-lg border-2 border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            {statuses.filter(s => s.value !== 'all').map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-lg font-bold text-primary">฿{parseFloat(order.total).toFixed(0)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Slip Viewer Dialog */}
            <Dialog open={!!viewSlip} onOpenChange={() => setViewSlip(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>🧾 สลิปการโอนเงิน</DialogTitle>
                    </DialogHeader>
                    {viewSlip && <img src={viewSlip} alt="Payment slip" className="rounded-xl w-full" />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
