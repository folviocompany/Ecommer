import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['p.active = true'];
    if (category) conditions.push(`c.slug = '${category.replace(/'/g, "''")}'`);
    if (featured === 'true') conditions.push('p.featured = true');
    const where = conditions.join(' AND ');

    const countRows = (await sql.unsafe(`
      SELECT COUNT(*)::int AS count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${where}
    `)) as unknown as { count: number }[];
    const [{ count }] = countRows;

    const products = (await sql.unsafe(`
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

    return NextResponse.json({
      products: products.map((p: Record<string, unknown>) => ({
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
      total: count,
      page,
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
