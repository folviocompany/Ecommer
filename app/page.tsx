import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import type { ProductPublic } from '@/types';
import { STORE_NAME, STORE_DESCRIPTION } from '@/lib/store';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getFeatured(): Promise<ProductPublic[]> {
  try {
    const rows = (await sql.unsafe(`
      SELECT
        p.id, p.name, p.slug, p.price, p.images, p.featured,
        c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
        EXISTS (
          SELECT 1 FROM variations v
          WHERE v.product_id = p.id AND v.active = true AND v.stock > 0
        ) AS has_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.active = true AND p.featured = true
      ORDER BY p.created_at DESC
      LIMIT 8
    `)) as unknown as Record<string, unknown>[];

    return rows.map((p) => ({
      id: p.id as number,
      name: p.name as string,
      slug: p.slug as string,
      price: Number(p.price),
      images: p.images as string[],
      featured: p.featured as boolean,
      hasStock: p.has_stock as boolean,
      category: p.cat_id
        ? { id: p.cat_id as number, name: p.cat_name as string, slug: p.cat_slug as string }
        : null,
    }));
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
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&q=80"
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A] pointer-events-none" />

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
              className="inline-block bg-[#F97316] text-white px-12 py-4 text-xs font-bold tracking-[0.4em] uppercase hover:bg-[#EA6C00] hover:shadow-[0_0_40px_rgba(249,115,22,0.45)] transition-all duration-300"
            >
              VER COLEÇÃO
            </Link>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#A3A3A3] pointer-events-none animate-bounce">
            <span className="text-[10px] tracking-[0.4em] uppercase font-medium">Scroll</span>
            <ChevronDown className="h-4 w-4" />
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
