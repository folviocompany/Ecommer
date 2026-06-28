'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/store/CartDrawer';
import { STORE_NAME, STORE_LOGO_URL } from '@/lib/store';

export default function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {STORE_LOGO_URL ? (
              <Image src={STORE_LOGO_URL} alt={STORE_NAME} width={40} height={40} className="object-contain" />
            ) : null}
            <span className="font-heading text-2xl text-[#F97316] tracking-wider">
              {STORE_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/produtos" className="text-white hover:text-[#F97316] transition-colors tracking-wide">
              Produtos
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-white hover:text-[#F97316] transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F97316] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2 text-white hover:text-[#F97316] transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#1A1A1A] bg-[#0A0A0A] px-4 py-4 flex flex-col gap-4">
            <Link
              href="/produtos"
              onClick={() => setMenuOpen(false)}
              className="text-white hover:text-[#F97316] transition-colors text-sm font-medium tracking-wide"
            >
              Produtos
            </Link>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
