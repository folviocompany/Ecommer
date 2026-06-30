import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/store/ProductGallery';
import ProductActions from '@/components/store/ProductActions';
import RelatedProducts from '@/components/store/RelatedProducts';
import type { ProductDetail } from '@/types';
import { STORE_NAME } from '@/lib/store';
import sql from '@/lib/db';

const getProduct = unstable_cache(
  async (slug: string): Promise<ProductDetail | null> => {
    try {
      const [product] = await sql`
        SELECT
          p.id, p.name, p.slug, p.description, p.price, p.images, p.featured,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.slug = ${slug} AND p.active = true
      `;

      if (!product) return null;

      const variations = await sql`
        SELECT id, size, color, color_hex, stock, price_modifier
        FROM variations
        WHERE product_id = ${product.id} AND active = true
        ORDER BY size, color
      `;

      const basePrice = Number(product.price);

      const variationsMapped = (variations as Array<{
        id: number;
        size: string | null;
        color: string | null;
        color_hex: string | null;
        stock: number;
        price_modifier: string | number;
      }>).map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.color_hex,
        stock: Number(v.stock),
        priceModifier: Number(v.price_modifier),
        finalPrice: basePrice + Number(v.price_modifier),
      }));

      const inStock = variationsMapped.filter((v) => v.stock > 0);

      return {
        id: product.id as number,
        name: product.name as string,
        slug: product.slug as string,
        description: product.description as string | null,
        price: basePrice,
        images: product.images as string[],
        featured: product.featured as boolean,
        hasStock: inStock.length > 0,
        category: product.cat_id
          ? { id: product.cat_id as number, name: product.cat_name as string, slug: product.cat_slug as string }
          : null,
        variations: variationsMapped,
        availableSizes: [...new Set(inStock.map((v) => v.size).filter(Boolean))] as string[],
        availableColors: [...new Set(inStock.map((v) => v.color).filter(Boolean))] as string[],
      };
    } catch {
      return null;
    }
  },
  ['product-detail'],
  { revalidate: 3600 }
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${STORE_NAME}`,
    description: product.description ?? undefined,
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="bg-[#0A0A0A] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#555] mb-8 flex-wrap">
            <Link href="/" className="hover:text-[#F97316] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href="/produtos" className="hover:text-[#F97316] transition-colors">Produtos</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <Link
                  href={`/produtos?categoria=${product.category.slug}`}
                  className="hover:text-[#F97316] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-[#A3A3A3] line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">

            {/* Galeria — client component para troca de imagem */}
            <ProductGallery images={product.images} name={product.name} />

            {/* Info */}
            <div className="space-y-4">
              {product.category && (
                <p className="text-[#F97316] text-[10px] font-bold tracking-[0.4em] uppercase">
                  {product.category.name}
                </p>
              )}

              <h1 className="font-heading text-3xl md:text-4xl text-white leading-tight tracking-wide">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-[#A3A3A3] leading-relaxed text-sm border-t border-[#1A1A1A] pt-5">
                  {product.description}
                </p>
              )}

              {/* Preço, variações e botões — client component */}
              <ProductActions product={product} />
            </div>
          </div>

          {/* Produtos relacionados — server component com Suspense */}
          {product.category && (
            <Suspense fallback={
              <div className="mt-16 pt-12 border-t border-[#1A1A1A]">
                <div className="h-8 w-64 bg-[#1A1A1A] rounded animate-pulse mb-10" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div className="aspect-square bg-[#1A1A1A] rounded-lg animate-pulse mb-3" />
                      <div className="h-3 bg-[#1A1A1A] rounded animate-pulse mb-1 w-3/4" />
                      <div className="h-4 bg-[#1A1A1A] rounded animate-pulse w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            }>
              <RelatedProducts
                categorySlug={product.category.slug}
                currentSlug={product.slug}
              />
            </Suspense>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
