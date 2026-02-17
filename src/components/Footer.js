'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
    const pathname = usePathname();
    if (pathname.startsWith('/admin')) return null;

    return (
        <footer className="bg-[hsl(25,55%,12%)] text-white/70 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <h4 className="text-white font-heading text-lg font-bold mb-4 flex items-center gap-2">
                            🍞 ปังๆ BangBang
                        </h4>
                        <p className="text-sm leading-relaxed text-white/50">
                            ขนมปังสไตล์ญี่ปุ่นแท้ๆ อบสดใหม่ทุกวัน ด้วยวัตถุดิบคุณภาพจากญี่ปุ่น
                            เพื่อรสชาติที่ดีที่สุดสำหรับคุณ
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-heading text-lg font-bold mb-4">เมนูลัด</h4>
                        <div className="space-y-2">
                            {[
                                { href: '/', label: 'หน้าแรก' },
                                { href: '/products', label: 'สินค้าทั้งหมด' },
                                { href: '/cart', label: 'ตะกร้าสินค้า' },
                                { href: '/orders', label: 'ประวัติการสั่งซื้อ' },
                            ].map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block text-sm text-white/50 hover:text-[hsl(30,50%,64%)] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-heading text-lg font-bold mb-4">ติดต่อเรา</h4>
                        <div className="space-y-2 text-sm text-white/50">
                            <p>📍 123 ถ.สุขุมวิท กรุงเทพฯ</p>
                            <p>📞 02-123-4567</p>
                            <p>📱 LINE: @bangbang</p>
                            <p>⏰ เปิดทุกวัน 07:00 - 20:00</p>
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/10 mb-6" />

                <p className="text-center text-xs text-white/30">
                    © 2024 ปังๆ BangBang Bakery — สงวนลิขสิทธิ์
                </p>
            </div>
        </footer>
    );
}
