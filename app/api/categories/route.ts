import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const categories = await sql`
    SELECT id, name, slug
    FROM categories
    WHERE active = true
    ORDER BY name
  `;
  return NextResponse.json(categories);
}
