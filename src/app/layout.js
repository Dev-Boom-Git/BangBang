import '@/app/globals.css';
import { Toaster } from 'sonner';
import { CartProvider } from '@/components/CartContext';
import { AuthProvider } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'ปังๆ BangBang Bakery — ขนมปังสไตล์ญี่ปุ่น',
    description: 'ร้านขนมปังสไตล์ญี่ปุ่นอบสดใหม่ทุกวัน ด้วยวัตถุดิบคุณภาพจากญี่ปุ่น',
};

export default function RootLayout({ children }) {
    return (
        <html lang="th">
            <body className="min-h-screen flex flex-col">
                <AuthProvider>
                    <CartProvider>
                        <Navbar />
                        <main className="flex-1 pt-16">
                            {children}
                        </main>
                        <Footer />
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                className: 'font-body',
                                style: { fontFamily: "'Sarabun', sans-serif" },
                            }}
                            richColors
                            closeButton
                        />
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
