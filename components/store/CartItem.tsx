'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { CartItem as CartItemType } from '@/types';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 py-3 border-b border-[#2A2A2A] last:border-0">
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[#242424] shrink-0">
        {item.image ? (
          <Image src={item.image} alt={item.productName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#444]">
            <Package className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white line-clamp-1">{item.productName}</p>
        <p className="text-xs text-[#A3A3A3] mt-0.5">{item.variationDesc}</p>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--store-color)' }}>
          {formatPrice(item.unitPrice * item.quantity)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#555] hover:text-red-500"
          onClick={() => removeItem(item.variationId)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <div className="flex items-center gap-1 border border-[#2A2A2A] rounded">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#A3A3A3] hover:text-white"
            onClick={() => updateQuantity(item.variationId, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm w-6 text-center text-white">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#A3A3A3] hover:text-white"
            onClick={() => updateQuantity(item.variationId, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
