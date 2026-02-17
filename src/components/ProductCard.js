'use client';

import { useCart } from './CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const isOutOfStock = !product.in_stock;

    const handleAdd = () => {
        addItem({
            id: product.id,
            name: product.name_th || product.name,
            price: parseFloat(product.price),
            image: product.image,
        });
        toast.success(`เพิ่ม ${product.name_th || product.name} ลงตะกร้าแล้ว 🛒`);
    };

    return (
        <Card className={`overflow-hidden product-card-hover group ${isOutOfStock ? 'opacity-60 pointer-events-none' : ''}`}>
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-secondary">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name_th}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-[hsl(30,50%,64%)]/30 text-5xl">
                        🍞
                    </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    {product.featured && <Badge>⭐ แนะนำ</Badge>}
                    {isOutOfStock && <Badge variant="secondary">สินค้าหมด</Badge>}
                </div>
            </div>

            {/* Body */}
            <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(30,50%,64%)] mb-1">
                    {product.category_name_th || product.category_name || ''}
                </p>
                <h3 className="font-bold text-foreground mb-1.5 font-heading">
                    {product.name_th || product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {product.description}
                </p>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xl font-bold text-primary">฿{parseFloat(product.price).toFixed(0)}</span>
                        <span className="text-xs text-muted-foreground ml-1">บาท</span>
                    </div>
                    {!isOutOfStock && (
                        <Button
                            size="icon"
                            variant="outline"
                            className="rounded-full hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all"
                            onClick={handleAdd}
                            title="เพิ่มลงตะกร้า"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
