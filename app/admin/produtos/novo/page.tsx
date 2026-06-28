import sql from '@/lib/db';
import ProductForm from '@/components/admin/ProductForm';
import type { Category } from '@/types';

async function getCategories(): Promise<Pick<Category, 'id' | 'name'>[]> {
  return sql`SELECT id, name FROM categories WHERE active = true ORDER BY name` as unknown as Pick<Category, 'id' | 'name'>[];
}

export default async function NovoProdutoPage() {
  const categories = await getCategories();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
