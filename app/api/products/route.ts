import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import sql from '@/lib/db';

const queryProducts = unstable_cache(
  async (category: string | null, featured: boolean, limit: number, offset: number) => {
    let rows: Record<string, unknown>[];

    if (category && featured) {
      rows = await sql`
        SELECT p.id, p.name, p.slug, p.price, p.images, p.featured,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
          EXISTS (SELECT 1 FROM variations v WHERE v.product_id = p.id AND v.active = true AND v.stock > 0) AS has_stock,
          COUNT(*) OVER() AS total_count
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.active = true AND c.slug = ${category} AND p.featured = true
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as unknown as Record<string, unknown>[];
    } else if (category) {
      rows = await sql`
        SELECT p.id, p.name, p.slug, p.price, p.images, p.featured,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
          EXISTS (SELECT 1 FROM variations v WHERE v.product_id = p.id AND v.active = true AND v.stock > 0) AS has_stock,
          COUNT(*) OVER() AS total_count
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.active = true AND c.slug = ${category}
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as unknown as Record<string, unknown>[];
    } else if (featured) {
      rows = await sql`
        SELECT p.id, p.name, p.slug, p.price, p.images, p.featured,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
          EXISTS (SELECT 1 FROM variations v WHERE v.product_id = p.id AND v.active = true AND v.stock > 0) AS has_stock,
          COUNT(*) OVER() AS total_count
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.active = true AND p.featured = true
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as unknown as Record<string, unknown>[];
    } else {
      rows = await sql`
        SELECT p.id, p.name, p.slug, p.price, p.images, p.featured,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
          EXISTS (SELECT 1 FROM variations v WHERE v.product_id = p.id AND v.active = true AND v.stock > 0) AS has_stock,
          COUNT(*) OVER() AS total_count
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.active = true
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as unknown as Record<string, unknown>[];
    }

    const total = Number(rows[0]?.total_count ?? 0);

    return {
      products: rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        images: p.images,
        featured: p.featured,
        hasStock: p.has_stock,
        category: p.cat_id
          ? { id: p.cat_id, name: p.cat_name, slug: p.cat_slug }
          : null,
      })),
      total,
    };
  },
  ['api-products'],
  { revalidate: 300 }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10) || 20);
    const offset = (page - 1) * limit;

    const { products, total } = await queryProducts(category, featured, limit, offset);

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
