'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import CartDrawer from '@/components/store/CartDrawer';
import { STORE_NAME, STORE_LOGO_URL } from '@/lib/store';

export default function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            {STORE_LOGO_URL ? (
              <Image src={STORE_LOGO_URL} alt={STORE_NAME} width={40} height={40} className="object-contain" />
            ) : null}
            <span style={{ color: 'var(--store-color)' }}>{STORE_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/produtos" className="hover:text-[var(--store-color)] transition-colors">
              Produtos
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  style={{ backgroundColor: 'var(--store-color)' }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium">
            <Link href="/produtos" onClick={() => setMenuOpen(false)}>
              Produtos
            </Link>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
