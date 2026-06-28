import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid, { ProductGridSkeleton } from '@/components/store/ProductGrid';
import CategoryFilter from '@/components/store/CategoryFilter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { ProductPublic, Category } from '@/types';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function getCategories(): Promise<Pick<Category, 'id' | 'name' | 'slug'>[]> {
  try {
    const res = await fetch(`${BASE}/api/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getProducts(params: { category?: string; page?: string }) {
  try {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    qs.set('page', params.page ?? '1');
    qs.set('limit', '20');
    const res = await fetch(`${BASE}/api/products?${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) return { products: [], total: 0, page: 1, pages: 1 };
    return res.json();
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
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Produtos</h1>

        <div className="mb-6">
          <Suspense>
            <CategoryFilter categories={categories} />
          </Suspense>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid products={products as ProductPublic[]} />
        </Suspense>

        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <Link href={`/produtos?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), page: String(page - 1) })}`}>
                <Button variant="outline">← Anterior</Button>
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-600">
              Página {page} de {pages}
            </span>
            {page < pages && (
              <Link href={`/produtos?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), page: String(page + 1) })}`}>
                <Button variant="outline">Próxima →</Button>
              </Link>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
