'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Settings, Home, LogOut, Loader2, Users, ScrollText } from 'lucide-react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !['staff', 'admin', 'superadmin'].includes(user.role))) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !['staff', 'admin', 'superadmin'].includes(user.role)) return null;

    const isAdmin = ['admin', 'superadmin'].includes(user.role);
    const isSuperAdmin = user.role === 'superadmin';

    const links = [
        { href: '/admin', label: 'แดชบอร์ด', icon: LayoutDashboard, minRole: 'staff' },
        { href: '/admin/orders', label: 'คำสั่งซื้อ', icon: ShoppingCart, minRole: 'staff' },
        { href: '/admin/products', label: 'จัดการสินค้า', icon: Package, minRole: 'admin' },
        { href: '/admin/settings', label: 'ตั้งค่า', icon: Settings, minRole: 'admin' },
        { href: '/admin/logs', label: 'Activity Log', icon: ScrollText, minRole: 'admin' },
        { href: '/admin/users', label: 'จัดการผู้ใช้', icon: Users, minRole: 'superadmin' },
    ];

    const ROLE_LEVEL = { customer: 0, staff: 1, admin: 2, superadmin: 3 };
    const visibleLinks = links.filter(l => (ROLE_LEVEL[user.role] || 0) >= (ROLE_LEVEL[l.minRole] || 0));

    const ROLE_BADGE = {
        staff: 'พนักงาน',
        admin: 'แอดมิน',
        superadmin: 'Super Admin',
    };

    return (
        <div className="flex min-h-screen -mt-16 pt-0">
            {/* Sidebar */}
            <aside className="w-64 bg-[hsl(25,55%,12%)] text-white flex-shrink-0 flex flex-col fixed top-0 bottom-0 left-0 z-40">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-black font-heading flex items-center gap-2">
                        🍞 <span className="bg-gradient-to-r from-[hsl(30,50%,64%)] to-white bg-clip-text text-transparent">ปังๆ Admin</span>
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-white/50">{user.name}</span>
                        <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded">{ROLE_BADGE[user.role]}</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {visibleLinks.map(link => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href} className="block">
                                <div
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                        ? 'bg-white/15 text-white font-semibold border-l-[3px] border-[hsl(30,50%,64%)]'
                                        : 'text-white/60 hover:text-white hover:bg-white/8'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {link.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 py-3 border-t border-white/10 space-y-1">
                    <Link href="/" className="block">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/8 transition-colors">
                            <Home className="w-4 h-4 flex-shrink-0" />
                            กลับหน้าเว็บ
                        </div>
                    </Link>
                    <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/8 transition-colors">
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 min-h-screen">
                {children}
            </main>
        </div>
    );
}
