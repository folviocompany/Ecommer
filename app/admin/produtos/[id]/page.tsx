import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import ProductForm from '@/components/admin/ProductForm';
import type { Category } from '@/types';

interface DBProduct {
  id: number;
  name: string;
  category_id: number | null;
  description: string | null;
  price: number;
  images: string[];
  featured: boolean;
  variations: Array<{
    id: number;
    size: string | null;
    color: string | null;
    color_hex: string | null;
    sku: string | null;
    stock: number;
    price_modifier: number;
  }>;
}

async function getProduct(id: number): Promise<DBProduct | null> {
  const rows = (await sql`SELECT * FROM products WHERE id = ${id}`) as unknown as DBProduct[];
  const product = rows[0];
  if (!product) return null;
  const variations = (await sql`SELECT * FROM variations WHERE product_id = ${id} AND active = true ORDER BY id`) as unknown as DBProduct['variations'];
  return { ...product, variations };
}

async function getCategories(): Promise<Pick<Category, 'id' | 'name'>[]> {
  return sql`SELECT id, name FROM categories WHERE active = true ORDER BY name` as unknown as Pick<Category, 'id' | 'name'>[];
}

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(Number(id)),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Editar produto</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          categoryId: product.category_id,
          description: product.description,
          price: Number(product.price),
          images: product.images,
          featured: product.featured,
          variations: product.variations.map((v) => ({
            id: v.id,
            size: v.size ?? '',
            color: v.color ?? '',
            colorHex: v.color_hex ?? '#000000',
            sku: v.sku ?? '',
            stock: v.stock,
            priceModifier: Number(v.price_modifier),
          })),
        }}
      />
    </div>
  );
}
