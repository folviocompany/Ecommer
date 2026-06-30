import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/slug';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { id } = await params;

    const [product] = await sql`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ${Number(id)}
    `;

    if (!product) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    const variations = await sql`
      SELECT * FROM variations WHERE product_id = ${Number(id)} ORDER BY id
    `;

    return NextResponse.json({ ...product, variations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await request.json();
    const { name, categoryId, description, price, images, featured, active, variations } = body;

    // Atualizar campos individualmente com queries parametrizadas
    if (name !== undefined) {
      const slug = generateSlug(name);
      await sql`UPDATE products SET name = ${name}, slug = ${slug}, updated_at = NOW() WHERE id = ${productId}`;
    }
    if (categoryId !== undefined) {
      await sql`UPDATE products SET category_id = ${categoryId ?? null}, updated_at = NOW() WHERE id = ${productId}`;
    }
    if (description !== undefined) {
      await sql`UPDATE products SET description = ${description ?? null}, updated_at = NOW() WHERE id = ${productId}`;
    }
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
      await sql`UPDATE products SET price = ${numPrice}, updated_at = NOW() WHERE id = ${productId}`;
    }
    if (images !== undefined) {
      const imgs = images as string[];
      await sql`UPDATE products SET images = ${imgs}, updated_at = NOW() WHERE id = ${productId}`;
    }
    if (featured !== undefined) {
      await sql`UPDATE products SET featured = ${Boolean(featured)}, updated_at = NOW() WHERE id = ${productId}`;
    }
    if (active !== undefined) {
      await sql`UPDATE products SET active = ${Boolean(active)}, updated_at = NOW() WHERE id = ${productId}`;
    }

    if (variations) {
      if (variations.add?.length) {
        for (const v of variations.add) {
          await sql`
            INSERT INTO variations (product_id, size, color, color_hex, sku, stock, price_modifier)
            VALUES (
              ${productId}, ${v.size ?? null}, ${v.color ?? null}, ${v.colorHex ?? null},
              ${v.sku ?? null}, ${Number(v.stock) || 0}, ${Number(v.priceModifier) || 0}
            )
          `;
        }
      }
      if (variations.update?.length) {
        for (const v of variations.update) {
          const varId = Number(v.id);
          if (isNaN(varId)) continue;
          if (v.stock !== undefined) {
            await sql`UPDATE variations SET stock = ${Number(v.stock)} WHERE id = ${varId}`;
          }
          if (v.price_modifier !== undefined) {
            await sql`UPDATE variations SET price_modifier = ${Number(v.price_modifier)} WHERE id = ${varId}`;
          }
          if (v.active !== undefined) {
            await sql`UPDATE variations SET active = ${Boolean(v.active)} WHERE id = ${varId}`;
          }
        }
      }
      if (variations.remove?.length) {
        await sql`
          UPDATE variations SET active = false WHERE id = ANY(${variations.remove}::int[])
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { id } = await params;
    await sql`UPDATE products SET active = false WHERE id = ${Number(id)}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
