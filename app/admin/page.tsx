import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderTable from '@/components/admin/OrderTable';
import { AlertTriangle, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

function formatPrice(v: number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function getDashboardData() {
  const [hoje] = await sql`
    SELECT COUNT(*)::int AS pedidos, COALESCE(SUM(total), 0)::numeric AS receita
    FROM orders WHERE status = 'aprovado' AND created_at >= CURRENT_DATE
  `;
  const [mes] = await sql`
    SELECT COUNT(*)::int AS pedidos, COALESCE(SUM(total), 0)::numeric AS receita
    FROM orders WHERE status = 'aprovado' AND created_at >= DATE_TRUNC('month', NOW())
  `;
  const [{ pendentes }] = await sql`SELECT COUNT(*)::int AS pendentes FROM orders WHERE status = 'pendente'`;
  const [{ sem_estoque }] = await sql`SELECT COUNT(*)::int AS sem_estoque FROM variations WHERE active = true AND stock = 0`;
  const recentes = await sql`
    SELECT id, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10
  `;
  return { hoje, mes, pendentes, semEstoque: sem_estoque, recentes };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { hoje, mes, pendentes, semEstoque, recentes } = await getDashboardData();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {semEstoque > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{semEstoque} variação(ões) sem estoque.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-gray-500 flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> Pedidos hoje</p>
          <p className="text-2xl font-bold">{hoje.pedidos}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Receita hoje</p>
          <p className="text-2xl font-bold">{formatPrice(hoje.receita)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-gray-500">Pedidos no mês</p>
          <p className="text-2xl font-bold">{mes.pedidos}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Pendentes</p>
          <p className="text-2xl font-bold">
            {pendentes}
            {pendentes > 0 && <Badge variant="secondary" className="ml-2 text-xs">!</Badge>}
          </p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Pedidos recentes</h2>
        <div className="bg-white rounded-lg border overflow-hidden">
          <OrderTable orders={recentes} />
        </div>
      </div>
    </div>
  );
}
