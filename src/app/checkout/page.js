'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clearCart, mounted } = useCart();
    const { user, getToken } = useAuth();
    const [settings, setSettings] = useState({});

    const [form, setForm] = useState({
        customer_name: '', phone: '', address: '', note: '',
    });
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(d => setSettings(d.settings || {}));
    }, []);

    useEffect(() => {
        if (user) {
            setForm(f => ({ ...f, customer_name: f.customer_name || user.name, phone: f.phone || user.phone || '' }));
        }
    }, [user]);

    const handleSlipChange = e => {
        const file = e.target.files[0];
        if (file) {
            setSlipFile(file);
            setSlipPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!form.customer_name || !form.phone || !form.address) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setLoading(true);
        try {
            let slip_image = null;
            if (slipFile) {
                const fd = new FormData();
                fd.append('file', slipFile);
                fd.append('folder', 'slips');
                const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
                const upData = await upRes.json();
                if (upRes.ok) slip_image = upData.url;
            }

            const body = {
                ...form,
                slip_image,
                items: items.map(i => ({
                    product_id: i.id,
                    product_name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                })),
                total,
            };

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/orders', { method: 'POST', headers, body: JSON.stringify(body) });

            if (res.ok) {
                clearCart();
                setStep(3);
                toast.success('สั่งซื้อสำเร็จ! 🎉');
            } else {
                const data = await res.json();
                toast.error(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return <div className="max-w-4xl mx-auto px-4 py-12"><div className="animate-pulse h-64 bg-muted rounded-xl" /></div>;
    }

    if (items.length === 0 && step !== 3) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-xl font-bold">ไม่มีสินค้าในตะกร้า</h2>
                <Button className="mt-6" onClick={() => router.push('/products')}>ไปเลือกซื้อสินค้า</Button>
            </div>
        );
    }

    // Success
    if (step === 3) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up">
                <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
                <h2 className="text-2xl font-bold font-heading mb-2">สั่งซื้อสำเร็จ! 🎉</h2>
                <p className="text-muted-foreground mb-8">เราจะตรวจสอบการชำระเงินและจัดส่งให้เร็วที่สุด</p>
                <div className="flex gap-4">
                    <Button onClick={() => router.push('/orders')} variant="outline">📋 ดูประวัติ</Button>
                    <Button onClick={() => router.push('/products')}>🛒 สั่งเพิ่ม</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black font-heading">💳 ชำระเงิน</h1>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-10">
                {[{ n: 1, label: 'ข้อมูลจัดส่ง' }, { n: 2, label: 'ชำระเงิน' }].map(s => (
                    <div key={s.n} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.n ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} transition-colors`}>
                            {s.n}
                        </div>
                        <span className={`text-sm ${step >= s.n ? 'font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
                        {s.n < 2 && <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'} transition-colors`} />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>📦 ข้อมูลจัดส่ง</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ชื่อ-นามสกุล</Label>
                                        <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="ชื่อ-นามสกุล" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>เบอร์โทรศัพท์</Label>
                                        <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0xx-xxx-xxxx" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>ที่อยู่จัดส่ง</Label>
                                    <Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="ที่อยู่สำหรับจัดส่ง..." rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label>หมายเหตุ (ถ้ามี)</Label>
                                    <Textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="เช่น ไม่ใส่คอนซิลเลอร์..." rows={2} />
                                </div>
                                <div className="flex justify-end">
                                    <Button size="lg" onClick={() => {
                                        if (!form.customer_name || !form.phone || !form.address) {
                                            toast.error('กรุณากรอกข้อมูลให้ครบ');
                                            return;
                                        }
                                        setStep(2);
                                    }}>
                                        ถัดไป →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>💰 ชำระเงิน</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* QR Code */}
                                <div className="bg-secondary rounded-xl p-6 text-center">
                                    <h3 className="font-bold mb-4">สแกน QR Code เพื่อชำระเงิน</h3>
                                    {settings.qr_image ? (
                                        <img src={settings.qr_image} alt="QR Payment" className="mx-auto max-w-[220px] rounded-xl shadow-md" />
                                    ) : (
                                        <div className="w-52 h-52 bg-muted rounded-xl mx-auto flex items-center justify-center text-5xl">💳</div>
                                    )}
                                    <div className="mt-4 text-sm text-muted-foreground space-y-1">
                                        {settings.bank_name && <p>🏦 {settings.bank_name}</p>}
                                        {settings.bank_account && <p>💳 {settings.bank_account}</p>}
                                        {settings.bank_account_name && <p>👤 {settings.bank_account_name}</p>}
                                    </div>
                                    <div className="mt-4 text-2xl font-bold text-primary">฿{total.toFixed(0)}</div>
                                </div>

                                {/* Slip Upload */}
                                <div className="space-y-3">
                                    <Label>อัปโหลดสลิปการโอน</Label>
                                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('slip-input').click()}>
                                        {slipPreview ? (
                                            <img src={slipPreview} alt="Slip" className="mx-auto max-h-48 rounded-lg" />
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดสลิป</p>
                                            </div>
                                        )}
                                    </div>
                                    <input id="slip-input" type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
                                </div>

                                <div className="flex gap-3 justify-between">
                                    <Button variant="outline" onClick={() => setStep(1)}>← ย้อนกลับ</Button>
                                    <Button size="lg" onClick={handleSubmit} disabled={loading}>
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> กำลังสั่งซื้อ...</> : '✅ ยืนยันสั่งซื้อ'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">📋 สรุปคำสั่งซื้อ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                                    <span>฿{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>ยอดรวม</span>
                                <span className="text-primary">฿{total.toFixed(0)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
