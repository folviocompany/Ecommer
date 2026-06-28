import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/slug';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = 20;
  const offset = (page - 1) * limit;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM products`;

  const products = await sql`
    SELECT
      p.id, p.name, p.slug, p.price, p.images, p.featured, p.active, p.created_at,
      c.name AS category_name,
      COALESCE(SUM(v.stock) FILTER (WHERE v.active = true), 0)::int AS total_stock
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN variations v ON v.product_id = p.id
    GROUP BY p.id, c.name
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return NextResponse.json({
    products,
    total: count,
    page,
    pages: Math.ceil(count / limit),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const body = await request.json();
  const { name, categoryId, description, price, images, featured, variations } = body;

  if (!name || price == null) {
    return NextResponse.json({ error: 'name e price são obrigatórios' }, { status: 400 });
  }

  let slug = generateSlug(name);
  const [existing] = await sql`SELECT id FROM products WHERE slug = ${slug}`;
  if (existing) slug = `${slug}-${Date.now()}`;

  const [product] = await sql`
    INSERT INTO products (name, slug, category_id, description, price, images, featured)
    VALUES (
      ${name}, ${slug}, ${categoryId ?? null}, ${description ?? null},
      ${price}, ${images ?? []}, ${featured ?? false}
    )
    RETURNING id, slug
  `;

  if (variations?.length) {
    for (const v of variations) {
      await sql`
        INSERT INTO variations (product_id, size, color, color_hex, sku, stock, price_modifier)
        VALUES (
          ${product.id}, ${v.size ?? null}, ${v.color ?? null}, ${v.colorHex ?? null},
          ${v.sku ?? null}, ${v.stock ?? 0}, ${v.priceModifier ?? 0}
        )
      `;
    }
  }

  return NextResponse.json(product, { status: 201 });
}
