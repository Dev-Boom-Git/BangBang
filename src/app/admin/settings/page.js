'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Save, Loader2, Upload, Store, Image as ImageIcon, CreditCard } from 'lucide-react';

export default function AdminSettingsPage() {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(data => { setSettings(data.settings || {}); setLoading(false); });
    }, []);

    const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) toast.success('บันทึกการตั้งค่าสำเร็จ');
            else toast.error('บันทึกไม่สำเร็จ');
        } catch { toast.error('เกิดข้อผิดพลาด'); }
        finally { setSaving(false); }
    };

    const handleImageUpload = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'settings');
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) { handleChange(key, data.url); toast.success('อัปโหลดสำเร็จ'); }
        } catch { toast.error('อัปโหลดไม่สำเร็จ'); }
    };

    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black font-heading">⚙️ ตั้งค่าเว็บไซต์</h1>
                    <p className="text-muted-foreground">จัดการข้อมูลร้านค้าและหน้าเว็บไซต์</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
                </Button>
            </div>

            <div className="space-y-6">
                {/* Shop Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" /> ข้อมูลร้านค้า</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ชื่อร้าน (ไทย)</Label>
                                <Input value={settings.shop_name || ''} onChange={e => handleChange('shop_name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>ชื่อร้าน (อังกฤษ)</Label>
                                <Input value={settings.shop_name_en || ''} onChange={e => handleChange('shop_name_en', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>เบอร์โทร</Label>
                                <Input value={settings.shop_phone || ''} onChange={e => handleChange('shop_phone', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>LINE ID</Label>
                                <Input value={settings.shop_line || ''} onChange={e => handleChange('shop_line', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>ที่อยู่ร้าน</Label>
                            <Textarea value={settings.shop_address || ''} onChange={e => handleChange('shop_address', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Hero Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> หน้าแรก (Hero)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>หัวข้อหลัก</Label>
                                <Input value={settings.hero_title || ''} onChange={e => handleChange('hero_title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>หัวข้อรอง</Label>
                                <Input value={settings.hero_subtitle || ''} onChange={e => handleChange('hero_subtitle', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>ภาพพื้นหลัง Hero</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('hero-img').click()}>
                                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                                <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดภาพ</p>
                            </div>
                            <input id="hero-img" type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'hero_image')} />
                            {settings.hero_image && (
                                <img src={settings.hero_image} alt="Hero preview" className="max-w-xs rounded-lg mt-2" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> การชำระเงิน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>ชื่อธนาคาร</Label>
                                <Input value={settings.bank_name || ''} onChange={e => handleChange('bank_name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>เลขบัญชี</Label>
                                <Input value={settings.bank_account || ''} onChange={e => handleChange('bank_account', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>ชื่อบัญชี</Label>
                                <Input value={settings.bank_account_name || ''} onChange={e => handleChange('bank_account_name', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>QR Code สำหรับชำระเงิน</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('qr-img').click()}>
                                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                                <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลด QR Code</p>
                            </div>
                            <input id="qr-img" type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'qr_image')} />
                            {settings.qr_image && (
                                <img src={settings.qr_image} alt="QR preview" className="max-w-[180px] rounded-lg mt-2" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
