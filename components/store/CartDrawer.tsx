'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, total } = useCart();

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="h-full max-w-sm ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.variationId} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span style={{ color: 'var(--store-color)' }}>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full text-white" style={{ backgroundColor: 'var(--store-color)' }}>
                Finalizar compra
              </Button>
            </Link>
            <Link href="/carrinho" onClick={onClose}>
              <Button variant="outline" className="w-full">
                Ver carrinho completo
              </Button>
            </Link>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
