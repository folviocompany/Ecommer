import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import type { OrderStatus } from '@/types';

const VALID_STATUSES: OrderStatus[] = [
  'pendente', 'aprovado', 'cancelado', 'em_preparacao', 'enviado', 'entregue',
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const { id } = await params;

    const [order] = await sql`SELECT * FROM orders WHERE id = ${Number(id)}`;
    if (!order) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ${Number(id)}
    `;

    return NextResponse.json({ ...order, items });
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
    const { status } = await request.json() as { status: OrderStatus };

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${Number(id)}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
