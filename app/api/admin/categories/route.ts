import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/slug';

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  const categories = await sql`
    SELECT * FROM categories ORDER BY name
  `;
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 });

  const slug = generateSlug(name);
  const [cat] = await sql`
    INSERT INTO categories (name, slug) VALUES (${name}, ${slug}) RETURNING *
  `;
  return NextResponse.json(cat, { status: 201 });
}
