'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, ShoppingBag, ShoppingCart, ClipboardList, Menu, X, Settings, LogOut } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { count, mounted } = useCart();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    if (pathname.startsWith('/admin')) return null;

    const links = [
        { href: '/', label: 'หน้าแรก', icon: Home },
        { href: '/products', label: 'สินค้า', icon: ShoppingBag },
        { href: '/cart', label: 'ตะกร้า', icon: ShoppingCart },
        { href: '/orders', label: 'ประวัติ', icon: ClipboardList },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-xl border-b transition-all">
            <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🍞</span>
                    <span className="text-xl font-black font-heading bg-gradient-to-r from-primary to-[hsl(30,50%,64%)] bg-clip-text text-transparent">
                        ปังๆ
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map(link => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={`gap-1.5 ${isActive ? 'font-bold' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                    {link.href === '/cart' && mounted && count > 0 && (
                                        <Badge className="ml-0.5 h-5 min-w-5 flex items-center justify-center text-[10px] p-0 px-1.5">
                                            {count}
                                        </Badge>
                                    )}
                                </Button>
                            </Link>
                        );
                    })}

                    <div className="w-px h-6 bg-border mx-2" />

                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">สวัสดี, {user.name}</span>
                            {['staff', 'admin', 'superadmin'].includes(user.role) && (
                                <Link href="/admin">
                                    <Button variant="gold" size="sm">
                                        <Settings className="w-3.5 h-3.5" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" size="sm" onClick={logout}>
                                <LogOut className="w-3.5 h-3.5" />
                                ออก
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">เข้าสู่ระบบ</Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Mobile Nav */}
            {menuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-background/98 backdrop-blur-xl border-b p-4 space-y-1 animate-in slide-in-from-top-2">
                    {links.map(link => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                                <Button variant={pathname === link.href ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                    {link.href === '/cart' && mounted && count > 0 && (
                                        <Badge className="ml-1">{count}</Badge>
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                    <div className="pt-2 border-t mt-2">
                        {user ? (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground px-4 py-1">สวัสดี, {user.name}</p>
                                {['staff', 'admin', 'superadmin'].includes(user.role) && (
                                    <Link href="/admin" onClick={() => setMenuOpen(false)}>
                                        <Button variant="gold" className="w-full justify-start gap-2">
                                            <Settings className="w-4 h-4" /> Admin Panel
                                        </Button>
                                    </Link>
                                )}
                                <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                                    <LogOut className="w-4 h-4" /> ออกจากระบบ
                                </Button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setMenuOpen(false)}>
                                <Button className="w-full">เข้าสู่ระบบ</Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
