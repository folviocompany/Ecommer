import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth) return auth;

    const [hoje] = await sql`
      SELECT
        COUNT(*)::int AS pedidos,
        COALESCE(SUM(total), 0)::numeric AS receita
      FROM orders
      WHERE status = 'aprovado'
        AND created_at >= CURRENT_DATE
    `;

    const [mes] = await sql`
      SELECT
        COUNT(*)::int AS pedidos,
        COALESCE(SUM(total), 0)::numeric AS receita
      FROM orders
      WHERE status = 'aprovado'
        AND created_at >= DATE_TRUNC('month', NOW())
    `;

    const [{ pendentes }] = await sql`
      SELECT COUNT(*)::int AS pendentes FROM orders WHERE status = 'pendente'
    `;

    const [{ sem_estoque }] = await sql`
      SELECT COUNT(*)::int AS sem_estoque FROM variations WHERE active = true AND stock = 0
    `;

    const pedidosRecentes = await sql`
      SELECT id, customer_name, total, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      hoje: { pedidos: hoje.pedidos, receita: Number(hoje.receita) },
      mes: { pedidos: mes.pedidos, receita: Number(mes.receita) },
      pendentes,
      semEstoque: sem_estoque,
      pedidosRecentes,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
