import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const offset = (page - 1) * limit;

    const where = status ? `WHERE status = '${status.replace(/'/g, "''")}'` : '';

    const [{ count }] = (await sql.unsafe(
      `SELECT COUNT(*)::int AS count FROM orders ${where}`
    )) as unknown as { count: number }[];

    const orders = (await sql.unsafe(`
      SELECT id, customer_name, customer_email, total, status, created_at
      FROM orders
      ${where}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `)) as unknown as Record<string, unknown>[];

    return NextResponse.json({ orders, total: count, page, pages: Math.ceil(count / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
