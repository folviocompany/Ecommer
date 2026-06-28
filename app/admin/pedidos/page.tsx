import sql from '@/lib/db';
import OrderTable from '@/components/admin/OrderTable';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'em_preparacao', label: 'Em preparação' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
];

async function getOrders(status?: string) {
  if (status) {
    return sql`SELECT id, customer_name, total, status, created_at FROM orders WHERE status = ${status} ORDER BY created_at DESC`;
  }
  return sql`SELECT id, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC`;
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await getOrders(status);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <Link key={s.value} href={s.value ? `/admin/pedidos?status=${s.value}` : '/admin/pedidos'}>
            <Badge
              variant={status === s.value || (!status && !s.value) ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1"
              style={status === s.value || (!status && !s.value)
                ? { backgroundColor: 'var(--store-color)', color: 'white' }
                : {}}
            >
              {s.label}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}
