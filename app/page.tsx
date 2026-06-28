import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import type { ProductPublic } from '@/types';
import { STORE_NAME, STORE_DESCRIPTION } from '@/lib/store';

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

        {/* ── Hero ── */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
          {/* Background image at 20% opacity */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&q=80"
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>

          {/* Gradient overlay bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]" />

          {/* Content */}
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <p className="text-[#F97316] text-xs md:text-sm font-bold tracking-[0.5em] uppercase mb-6">
              Nova Coleção 2025
            </p>
            <h1 className="font-heading text-[5rem] md:text-[10rem] lg:text-[13rem] text-white leading-none tracking-tight mb-2">
              {STORE_NAME}
            </h1>
            <p className="text-[#F97316] text-base md:text-xl font-medium tracking-[0.5em] mb-12 uppercase">
              {STORE_DESCRIPTION}
            </p>
            <Link
              href="/produtos"
              className="inline-block border-2 border-[#F97316] text-[#F97316] px-12 py-4 text-xs font-bold tracking-[0.4em] uppercase hover:bg-[#F97316] hover:text-white transition-all duration-300"
            >
              VER COLEÇÃO
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#A3A3A3]">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-[#A3A3A3] to-transparent" />
          </div>
        </section>

        {/* ── Em Destaque ── */}
        {featured.length > 0 && (
          <section className="bg-[#111111] px-4 py-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-1 h-10 bg-[#F97316]" />
                <div>
                  <p className="text-[#F97316] text-xs font-bold tracking-[0.4em] uppercase mb-1">Seleção especial</p>
                  <h2 className="font-heading text-4xl md:text-5xl text-white tracking-wide leading-none">
                    EM DESTAQUE
                  </h2>
                </div>
              </div>

              <ProductGrid products={featured} />

              <div className="mt-12 text-center">
                <Link
                  href="/produtos"
                  className="inline-block border border-[#F97316] text-[#F97316] px-10 py-3 text-xs font-bold tracking-[0.4em] uppercase hover:bg-[#F97316] hover:text-white transition-all duration-300"
                >
                  VER TODOS OS PRODUTOS
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
