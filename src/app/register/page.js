'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.phone);
            toast.success('สมัครสมาชิกสำเร็จ! 🎉');
            setTimeout(() => router.push('/'), 800);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <div className="text-4xl mb-2">🍞</div>
                    <CardTitle className="text-2xl font-heading">สมัครสมาชิก</CardTitle>
                    <CardDescription>สร้างบัญชีเพื่อสั่งซื้อขนมปังปังๆ</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>ชื่อ-นามสกุล</Label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ชื่อ-นามสกุล" required />
                        </div>
                        <div className="space-y-2">
                            <Label>อีเมล</Label>
                            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label>เบอร์โทรศัพท์</Label>
                            <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0xx-xxx-xxxx" />
                        </div>
                        <div className="space-y-2">
                            <Label>รหัสผ่าน</Label>
                            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="อย่างน้อย 6 ตัวอักษร" required />
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> กำลังสมัคร...</> : <><UserPlus className="w-4 h-4 mr-2" /> สมัครสมาชิก</>}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        มีบัญชีแล้ว?{' '}
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
