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
    const { name, active } = await request.json();

    const updates: string[] = [];
    if (name !== undefined) {
      updates.push(`name = '${name.replace(/'/g, "''")}'`, `slug = '${generateSlug(name)}'`);
    }
    if (active !== undefined) updates.push(`active = ${active}`);

    if (updates.length) {
      await sql.unsafe(`UPDATE categories SET ${updates.join(', ')} WHERE id = ${Number(id)}`);
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
