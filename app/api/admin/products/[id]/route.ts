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
    const body = await request.json();
    const { name, categoryId, description, price, images, featured, active, variations } = body;

    const updates: string[] = ['updated_at = NOW()'];
    if (name !== undefined) {
      const slug = generateSlug(name);
      updates.push(`name = '${name.replace(/'/g, "''")}'`, `slug = '${slug}'`);
    }
    if (categoryId !== undefined) updates.push(`category_id = ${categoryId ?? 'NULL'}`);
    if (description !== undefined) updates.push(`description = '${(description ?? '').replace(/'/g, "''")}'`);
    if (price !== undefined) updates.push(`price = ${price}`);
    if (images !== undefined) updates.push(`images = ARRAY[${(images as string[]).map((u) => `'${u}'`).join(',')}]`);
    if (featured !== undefined) updates.push(`featured = ${featured}`);
    if (active !== undefined) updates.push(`active = ${active}`);

    await sql.unsafe(`UPDATE products SET ${updates.join(', ')} WHERE id = ${Number(id)}`);

    if (variations) {
      if (variations.add?.length) {
        for (const v of variations.add) {
          await sql`
            INSERT INTO variations (product_id, size, color, color_hex, sku, stock, price_modifier)
            VALUES (
              ${Number(id)}, ${v.size ?? null}, ${v.color ?? null}, ${v.colorHex ?? null},
              ${v.sku ?? null}, ${v.stock ?? 0}, ${v.priceModifier ?? 0}
            )
          `;
        }
      }
      if (variations.update?.length) {
        for (const v of variations.update) {
          const fields: string[] = [];
          if (v.stock !== undefined) fields.push(`stock = ${v.stock}`);
          if (v.price_modifier !== undefined) fields.push(`price_modifier = ${v.price_modifier}`);
          if (v.active !== undefined) fields.push(`active = ${v.active}`);
          if (fields.length) {
            await sql.unsafe(`UPDATE variations SET ${fields.join(', ')} WHERE id = ${v.id}`);
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
