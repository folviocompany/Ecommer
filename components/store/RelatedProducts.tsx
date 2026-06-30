import { unstable_cache } from 'next/cache';
import ProductGrid from '@/components/store/ProductGrid';
import type { ProductPublic } from '@/types';
import sql from '@/lib/db';

interface Props {
  categorySlug: string;
  currentSlug: string;
}

const getRelated = unstable_cache(
  async (categorySlug: string, currentSlug: string): Promise<ProductPublic[]> => {
    try {
      const rows = await sql`
        SELECT p.id, p.name, p.slug, p.price, p.images, p.featured,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
          EXISTS (
            SELECT 1 FROM variations v
            WHERE v.product_id = p.id AND v.active = true AND v.stock > 0
          ) AS has_stock
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.active = true AND c.slug = ${categorySlug} AND p.slug != ${currentSlug}
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT 4
      ` as unknown as Record<string, unknown>[];

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
  },
  ['related-products'],
  { revalidate: 3600 }
);

export default async function RelatedProducts({ categorySlug, currentSlug }: Props) {
  const products = await getRelated(categorySlug, currentSlug);

  if (!products.length) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[#1A1A1A]">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-1 h-8 bg-[#F97316]" />
        <div>
          <p className="text-[#F97316] text-[10px] font-bold tracking-[0.4em] uppercase mb-1">
            Da mesma categoria
          </p>
          <h2 className="font-heading text-2xl md:text-3xl text-white tracking-wide leading-none">
            VOCÊ TAMBÉM PODE GOSTAR
          </h2>
        </div>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
