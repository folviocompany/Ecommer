import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import type { ProductPublic } from '@/types';

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Nossa Loja';
const storeDesc = process.env.NEXT_PUBLIC_STORE_DESCRIPTION ?? 'Confira nossos produtos exclusivos';

async function getFeatured(): Promise<ProductPublic[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/products?featured=true&limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section
          className="py-20 px-4 text-white text-center"
          style={{ backgroundColor: 'var(--store-color)' }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{storeName}</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-xl mx-auto">{storeDesc}</p>
          <Link href="/produtos">
            <Button size="lg" className="bg-white font-semibold hover:bg-gray-100"
              style={{ color: 'var(--store-color)' }}>
              Ver produtos
            </Button>
          </Link>
        </section>

        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold mb-6">Em destaque</h2>
            <ProductGrid products={featured} />
            <div className="mt-8 text-center">
              <Link href="/produtos">
                <Button variant="outline" size="lg">Ver todos os produtos</Button>
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
