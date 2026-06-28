'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/store/CartItem';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';

function formatPrice(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CarrinhoPage() {
  const { items, total } = useCart();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-200" />
            <p className="text-gray-500">Seu carrinho está vazio.</p>
            <Link href="/produtos">
              <Button style={{ backgroundColor: 'var(--store-color)', color: 'white' }}>
                Ver produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {items.map((item) => (
                <CartItem key={item.variationId} item={item} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <h2 className="font-semibold">Resumo</h2>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Frete</span>
                  <span>Calcular no checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span style={{ color: 'var(--store-color)' }}>{formatPrice(total)}</span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full text-white" style={{ backgroundColor: 'var(--store-color)' }}>
                    Finalizar compra
                  </Button>
                </Link>
              </div>
              <Link href="/produtos">
                <Button variant="outline" className="w-full">Continuar comprando</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
