'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Search, ClipboardList } from 'lucide-react';

export default function OrdersPage() {
    const { user, getToken } = useAuth();
    const [orders, setOrders] = useState([]);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const fetchOrders = async (searchPhone) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchPhone) params.set('phone', searchPhone);

            const headers = {};
            const t = getToken();
            if (t) headers['Authorization'] = `Bearer ${t}`;

            const res = await fetch(`/api/orders?${params}`, { headers });
            const data = await res.json();

            if (res.ok) {
                setOrders(data.orders || []);
                setSearched(true);
            } else {
                toast.error(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchOrders();
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black font-heading flex items-center justify-center gap-2">
                    <ClipboardList className="w-8 h-8" /> ประวัติการสั่งซื้อ
                </h1>
                <p className="text-muted-foreground mt-1">
                    {user ? `ประวัติการสั่งซื้อของ ${user.name}` : 'ค้นหาด้วยเบอร์โทรศัพท์'}
                </p>
            </div>

            {!user && (
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Input
                                type="tel"
                                placeholder="กรอกเบอร์โทรศัพท์ที่ใช้สั่งซื้อ..."
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && fetchOrders(phone)}
                            />
                            <Button onClick={() => fetchOrders(phone)} className="gap-2">
                                <Search className="w-4 h-4" /> ค้นหา
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {user && !searched && (
                <div className="text-center mb-8">
                    <Button size="lg" onClick={() => fetchOrders()} className="gap-2">
                        <ClipboardList className="w-4 h-4" /> ดูประวัติการสั่งซื้อ
                    </Button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {searched && orders.length === 0 && !loading && (
                <div className="text-center py-20 text-muted-foreground">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold">ไม่พบรายการสั่งซื้อ</h3>
                    <p>ยังไม่มีประวัติการสั่งซื้อ ลองสั่งขนมปังอร่อยๆ กันนะ!</p>
                </div>
            )}

            <div className="space-y-4">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader className="pb-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-base">คำสั่งซื้อ #{order.id}</CardTitle>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(order.created_at).toLocaleDateString('th-TH', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <Badge variant={order.status}>
                                    {{ pending: 'รอชำระเงิน', paid: 'ชำระแล้ว', preparing: 'กำลังจัดเตรียม', shipping: 'กำลังจัดส่ง', completed: 'สำเร็จ', cancelled: 'ยกเลิก' }[order.status] || order.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 mb-3">
                                {(order.items || []).map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{item.product_name} x{item.quantity}</span>
                                        <span>฿{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="flex justify-between mt-3 font-bold">
                                <span>ยอดรวม</span>
                                <span className="text-primary">฿{parseFloat(order.total).toFixed(0)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
