'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
        ]).then(([prodData, catData]) => {
            setProducts(prodData.products || []);
            setCategories(catData.categories || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = selected === 'all'
        ? products
        : products.filter(p => String(p.category_id) === selected);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            {/* Header */}
            <div className="text-center mb-10">
                <p className="text-[hsl(30,50%,64%)] font-semibold tracking-widest uppercase text-sm mb-2">
                    メニュー — Menu
                </p>
                <h1 className="text-3xl md:text-4xl font-black font-heading">สินค้าทั้งหมด</h1>
                <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap justify-center mb-10">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <Button
                    variant={selected === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelected('all')}
                >
                    ทั้งหมด
                </Button>
                {categories.map(c => (
                    <Button
                        key={c.id}
                        variant={selected === String(c.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelected(String(c.id))}
                    >
                        {c.name_th}
                    </Button>
                ))}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-52 w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold">ไม่พบสินค้า</h3>
                    <p>ลองเปลี่ยนหมวดหมู่ดูนะ</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            )}
        </div>
    );
}
