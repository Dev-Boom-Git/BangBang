'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Upload } from 'lucide-react';

export default function AdminProductsPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({
        name: '', name_th: '', description: '', price: '', category_id: '', in_stock: true, featured: false,
    });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchData = () => {
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
        ]).then(([prodData, catData]) => {
            setProducts(prodData.products || []);
            setCategories(catData.categories || []);
            setLoading(false);
        });
    };

    useEffect(() => { if (token) fetchData(); }, [token]);

    const openAdd = () => {
        setEditingProduct(null);
        setForm({ name: '', name_th: '', description: '', price: '', category_id: '', in_stock: true, featured: false });
        setImageFile(null);
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            name_th: product.name_th,
            description: product.description || '',
            price: product.price,
            category_id: product.category_id || '',
            in_stock: !!product.in_stock,
            featured: !!product.featured,
        });
        setImageFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let image = editingProduct?.image || null;
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('folder', 'products');
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) image = uploadData.url;
            }

            const body = { ...form, price: parseFloat(form.price), image, category_id: form.category_id || null };

            if (editingProduct) {
                await fetch(`/api/products/${editingProduct.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
                toast.success('อัปเดตสินค้าสำเร็จ');
            } else {
                await fetch('/api/products', { method: 'POST', headers, body: JSON.stringify(body) });
                toast.success('เพิ่มสินค้าสำเร็จ');
            }
            setShowModal(false);
            fetchData();
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('คุณต้องการลบสินค้านี้ใช่ไหม?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE', headers });
            toast.success('ลบสินค้าสำเร็จ');
            fetchData();
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black font-heading">🍞 จัดการสินค้า</h1>
                    <p className="text-muted-foreground">เพิ่ม แก้ไข หรือลบสินค้าในร้าน</p>
                </div>
                <Button onClick={openAdd} className="gap-2">
                    <Plus className="w-4 h-4" /> เพิ่มสินค้า
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6 p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ภาพ</TableHead>
                                <TableHead>ชื่อสินค้า</TableHead>
                                <TableHead>หมวดหมู่</TableHead>
                                <TableHead>ราคา</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>แนะนำ</TableHead>
                                <TableHead className="text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.image ? (
                                            <img src={product.image} alt={product.name_th} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">🍞</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-bold">{product.name_th}</p>
                                        <p className="text-xs text-muted-foreground">{product.name}</p>
                                    </TableCell>
                                    <TableCell>{product.category_name_th || '-'}</TableCell>
                                    <TableCell className="font-semibold">฿{parseFloat(product.price).toFixed(0)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.in_stock ? 'success' : 'destructive'}>
                                            {product.in_stock ? 'มีสินค้า' : 'หมด'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{product.featured ? '⭐' : '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                                                <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="w-3 h-3 mr-1" /> ลบ
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? '✏️ แก้ไขสินค้า' : '+ เพิ่มสินค้าใหม่'}</DialogTitle>
                        <DialogDescription>กรอกข้อมูลสินค้าด้านล่าง</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ชื่อสินค้า (EN)</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>ชื่อสินค้า (TH)</Label>
                                <Input value={form.name_th} onChange={e => setForm({ ...form, name_th: e.target.value })} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>รายละเอียด</Label>
                            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ราคา (บาท)</Label>
                                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>หมวดหมู่</Label>
                                <select
                                    value={form.category_id}
                                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                                    className="flex h-10 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">-- เลือก --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_th}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>รูปภาพสินค้า</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('product-img').click()}>
                                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                                <p className="text-sm text-muted-foreground">{imageFile ? imageFile.name : 'คลิกเพื่อเลือกรูป'}</p>
                            </div>
                            <input id="product-img" type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox id="in_stock" checked={form.in_stock} onCheckedChange={v => setForm({ ...form, in_stock: v })} />
                                <Label htmlFor="in_stock" className="cursor-pointer">มีสินค้า</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="featured" checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} />
                                <Label htmlFor="featured" className="cursor-pointer">สินค้าแนะนำ</Label>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>ยกเลิก</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> บันทึก...</> : '💾 บันทึก'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
