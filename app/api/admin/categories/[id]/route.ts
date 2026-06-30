import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/slug';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { id } = await params;
    const catId = Number(id);
    if (isNaN(catId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const { name, active } = await request.json();

    if (name !== undefined) {
      const slug = generateSlug(name);
      await sql`UPDATE categories SET name = ${name}, slug = ${slug}, updated_at = NOW() WHERE id = ${catId}`;
    }
    if (active !== undefined) {
      await sql`UPDATE categories SET active = ${Boolean(active)}, updated_at = NOW() WHERE id = ${catId}`;
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
    await sql`UPDATE categories SET active = false WHERE id = ${Number(id)}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
