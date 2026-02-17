'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/products?featured=true').then(r => r.json()),
            fetch('/api/settings').then(r => r.json()),
        ]).then(([prodData, settData]) => {
            setProducts(prodData.products || []);
            setSettings(settData.settings || {});
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* ===== HERO ===== */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                    style={{
                        backgroundImage: settings.hero_image
                            ? `url(${settings.hero_image})`
                            : "url('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80')",
                    }}
                />
                <div className="hero-gradient absolute inset-0" />

                <div className="relative z-10 text-center text-white px-4 max-w-3xl animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 mb-6 text-sm">
                        <Sparkles className="w-4 h-4 text-[hsl(30,50%,64%)]" />
                        <span>อบสดใหม่ทุกวัน</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 drop-shadow-2xl leading-tight">
                        {settings.hero_title || 'ปังๆ'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
                        {settings.hero_subtitle || 'ขนมปังสไตล์ญี่ปุ่น อบสดใหม่ทุกวัน ด้วยวัตถุดิบคุณภาพจากญี่ปุ่น'}
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/products">
                            <Button size="lg" className="text-base px-8 shadow-xl shadow-primary/30">
                                สั่งเลย <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                        <Link href="/products">
                            <Button variant="outline" size="lg" className="text-base bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                                ดูเมนูทั้งหมด
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Scroll marker */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
                        <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
                    </div>
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS ===== */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
                <div className="text-center mb-14">
                    <p className="text-[hsl(30,50%,64%)] font-semibold tracking-widest uppercase text-sm mb-2">
                        おすすめ — Osusume
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black font-heading">สินค้าแนะนำ</h2>
                    <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-52 w-full rounded-xl" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link href="/products">
                        <Button variant="outline" size="lg" className="gap-2">
                            ดูสินค้าทั้งหมด <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* ===== STORY ===== */}
            <section className="bg-secondary py-20">
                <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
                    <p className="text-[hsl(30,50%,64%)] font-semibold tracking-widest uppercase text-sm mb-2">
                        物語 — Monogatari
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black font-heading mb-6">เรื่องราวของเรา</h2>
                    <div className="w-16 h-1 bg-primary mx-auto mb-8 rounded-full" />
                    <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                        ปังๆ เกิดจากความหลงใหลในขนมปังสไตล์ญี่ปุ่น
                        เราคัดสรรวัตถุดิบชั้นดีจากญี่ปุ่น ผสมผสานกับเทคนิคการอบแบบดั้งเดิม
                        เพื่อสร้างขนมปังที่นุ่ม หอม และอร่อยที่สุดสำหรับคุณ 🍞
                    </p>

                    <div className="grid grid-cols-3 gap-8 mt-14 max-w-md mx-auto">
                        {[
                            { value: '100+', label: 'สูตรขนมปัง' },
                            { value: '5★', label: 'คะแนนรีวิว' },
                            { value: '10K+', label: 'ลูกค้า' },
                        ].map(s => (
                            <div key={s.label}>
                                <div className="text-3xl font-black text-primary">{s.value}</div>
                                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
