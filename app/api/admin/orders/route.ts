import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import type { OrderStatus } from '@/types';

const VALID_STATUSES: OrderStatus[] = [
  'pendente', 'aprovado', 'cancelado', 'em_preparacao', 'enviado', 'entregue',
];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { searchParams } = request.nextUrl;
    const statusParam = searchParams.get('status') as OrderStatus | null;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    // Validar status antes de usar na query
    const status = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : null;

    let countResult: { count: number }[];
    let orders: Record<string, unknown>[];

    if (status) {
      countResult = await sql`
        SELECT COUNT(*)::int AS count FROM orders WHERE status = ${status}
      ` as unknown as { count: number }[];
      orders = await sql`
        SELECT id, customer_name, customer_email, total, status, created_at
        FROM orders
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as unknown as Record<string, unknown>[];
    } else {
      countResult = await sql`
        SELECT COUNT(*)::int AS count FROM orders
      ` as unknown as { count: number }[];
      orders = await sql`
        SELECT id, customer_name, customer_email, total, status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as unknown as Record<string, unknown>[];
    }

    const [{ count }] = countResult;
    return NextResponse.json({ orders, total: count, page, pages: Math.ceil(count / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
