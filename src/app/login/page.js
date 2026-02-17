'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`ยินดีต้อนรับ ${user.name}! 🎉`);
            setTimeout(() => router.push(user.role === 'admin' ? '/admin' : '/'), 800);
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
                    <CardTitle className="text-2xl font-heading">เข้าสู่ระบบ</CardTitle>
                    <CardDescription>เข้าสู่ระบบเพื่อสั่งซื้อขนมปัง</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="รหัสผ่าน" required />
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> กำลังเข้าสู่ระบบ...</> : <><LogIn className="w-4 h-4 mr-2" /> เข้าสู่ระบบ</>}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="text-primary font-semibold hover:underline">
                            สมัครสมาชิก
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
