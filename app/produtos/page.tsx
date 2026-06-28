import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid, { ProductGridSkeleton } from '@/components/store/ProductGrid';
import CategoryFilter from '@/components/store/CategoryFilter';
import Link from 'next/link';
import type { ProductPublic, Category } from '@/types';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getCategories(): Promise<Pick<Category, 'id' | 'name' | 'slug'>[]> {
  try {
    const rows = await sql`SELECT id, name, slug FROM categories WHERE active = true ORDER BY name`;
    return rows as unknown as Pick<Category, 'id' | 'name' | 'slug'>[];
  } catch {
    return [];
  }
}

async function getProducts(params: { category?: string; page?: string }) {
  try {
    const page = Math.max(1, parseInt(params.page ?? '1'));
    const limit = 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['p.active = true'];
    if (params.category) conditions.push(`c.slug = '${params.category.replace(/'/g, "''")}'`);
    const where = conditions.join(' AND ');

    const [{ count }] = (await sql.unsafe(
      `SELECT COUNT(*)::int AS count FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE ${where}`
    )) as unknown as { count: number }[];

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
      WHERE ${where}
      ORDER BY p.featured DESC, p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `)) as unknown as Record<string, unknown>[];

    return {
      products: rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        images: p.images,
        featured: p.featured,
        hasStock: p.has_stock,
        category: p.cat_id ? { id: p.cat_id, name: p.cat_name, slug: p.cat_slug } : null,
      })) as ProductPublic[],
      total: count,
      page,
      pages: Math.ceil(count / limit),
    };
  } catch {
    return { products: [], total: 0, page: 1, pages: 1 };
  }
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [categories, { products, page, pages }] = await Promise.all([
    getCategories(),
    getProducts(params),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#0A0A0A] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-8 bg-[#F97316]" />
            <h1 className="font-heading text-4xl text-white tracking-wide">PRODUTOS</h1>
          </div>

          <div className="mb-8">
            <Suspense>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} />
          </Suspense>

          {pages > 1 && (
            <div className="mt-10 flex justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/produtos?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), page: String(page - 1) })}`}
                  className="border border-[#262626] text-[#A3A3A3] px-5 py-2 text-sm hover:border-[#F97316] hover:text-[#F97316] transition-colors"
                >
                  ← Anterior
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-[#A3A3A3]">
                {page} / {pages}
              </span>
              {page < pages && (
                <Link
                  href={`/produtos?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), page: String(page + 1) })}`}
                  className="border border-[#262626] text-[#A3A3A3] px-5 py-2 text-sm hover:border-[#F97316] hover:text-[#F97316] transition-colors"
                >
                  Próxima →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
