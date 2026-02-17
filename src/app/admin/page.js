'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Clock, DollarSign, ShoppingBag } from 'lucide-react';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0, totalProducts: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };

        Promise.all([
            fetch('/api/orders', { headers }).then(r => r.json()),
            fetch('/api/products').then(r => r.json()),
        ]).then(([ordersData, productsData]) => {
            const orders = ordersData.orders || [];
            const products = productsData.products || [];

            setStats({
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total), 0),
                totalProducts: products.length,
            });
            setRecentOrders(orders.slice(0, 5));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [token]);

    const statCards = [
        { icon: Package, label: 'คำสั่งซื้อทั้งหมด', value: stats.totalOrders, color: 'text-blue-600 bg-blue-100' },
        { icon: Clock, label: 'รอดำเนินการ', value: stats.pendingOrders, color: 'text-amber-600 bg-amber-100' },
        { icon: DollarSign, label: 'รายได้รวม', value: `฿${stats.totalRevenue.toFixed(0)}`, color: 'text-green-600 bg-green-100' },
        { icon: ShoppingBag, label: 'สินค้าทั้งหมด', value: stats.totalProducts, color: 'text-purple-600 bg-purple-100' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-black font-heading">📊 แดชบอร์ด</h1>
                <p className="text-muted-foreground">ภาพรวมร้านปังๆ</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(s => {
                    const Icon = s.icon;
                    return (
                        <Card key={s.label} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                                        <p className="text-3xl font-bold">{s.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${s.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="text-lg font-bold mb-4">📋 คำสั่งซื้อล่าสุด</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>ลูกค้า</TableHead>
                                <TableHead>ยอดรวม</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>วันที่</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.customer_name}</TableCell>
                                    <TableCell>฿{parseFloat(order.total).toFixed(0)}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status}>
                                            {{ pending: 'รอชำระ', paid: 'ชำระแล้ว', preparing: 'จัดเตรียม', shipping: 'จัดส่ง', completed: 'สำเร็จ', cancelled: 'ยกเลิก' }[order.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString('th-TH')}</TableCell>
                                </TableRow>
                            ))}
                            {recentOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">ยังไม่มีคำสั่งซื้อ</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
