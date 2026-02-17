'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { items, updateQuantity, removeItem, total, count, mounted } = useCart();

    if (!mounted) {
        return <div className="max-w-4xl mx-auto px-4 py-12"><div className="animate-pulse h-64 bg-muted rounded-xl" /></div>;
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                <div className="text-7xl mb-6 animate-bounce">🛒</div>
                <h2 className="text-2xl font-bold font-heading mb-2">ตะกร้าว่างเปล่า</h2>
                <p className="text-muted-foreground mb-8">ยังไม่มีสินค้าในตะกร้า ไปเลือกซื้อขนมปังอร่อยๆ กันเถอะ!</p>
                <Link href="/products">
                    <Button size="lg" className="gap-2">
                        <ShoppingBag className="w-4 h-4" /> ไปเลือกซื้อสินค้า
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black font-heading">🛒 ตะกร้าสินค้า</h1>
                <p className="text-muted-foreground mt-1">{count} รายการ</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map(item => (
                        <Card key={item.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex items-center gap-4 p-4">
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🍞</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold font-heading truncate">{item.name}</h3>
                                        <p className="text-primary font-bold">฿{item.price.toFixed(0)}</p>
                                    </div>

                                    {/* Qty Controls */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    {/* Subtotal + Remove */}
                                    <div className="text-right">
                                        <p className="font-bold">฿{(item.price * item.quantity).toFixed(0)}</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive/80 p-0 h-auto mt-1"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                            <span className="text-xs">ลบ</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">📋 สรุปคำสั่งซื้อ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                                    <span>฿{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>ยอดรวม</span>
                                <span className="text-primary">฿{total.toFixed(0)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href="/checkout" className="w-full">
                                <Button size="lg" className="w-full gap-2">
                                    สั่งซื้อเลย <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
