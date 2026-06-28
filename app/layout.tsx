import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME ?? 'Loja',
  description: process.env.NEXT_PUBLIC_STORE_DESCRIPTION ?? '',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const color = process.env.NEXT_PUBLIC_STORE_COLOR ?? '#000000';
  const colorDark = process.env.NEXT_PUBLIC_STORE_COLOR_DARK ?? '#000000';

  return (
    <html lang="pt-BR" className={geist.variable}>
      <body
        className="min-h-screen flex flex-col antialiased"
        style={
          {
            '--store-color': color,
            '--store-color-dark': colorDark,
          } as React.CSSProperties
        }
      >
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
