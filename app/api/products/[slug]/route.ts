import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [product] = await sql`
    SELECT
      p.id, p.name, p.slug, p.description, p.price, p.images, p.featured,
      c.id AS cat_id, c.name AS cat_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ${slug} AND p.active = true
  `;

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  }

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
  const availableSizes = [...new Set(inStock.map((v) => v.size).filter(Boolean))];
  const availableColors = [...new Set(inStock.map((v) => v.color).filter(Boolean))];

  return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: basePrice,
    images: product.images,
    featured: product.featured,
    category: product.cat_id
      ? { id: product.cat_id, name: product.cat_name }
      : null,
    variations: variationsMapped,
    availableSizes,
    availableColors,
  });
}
