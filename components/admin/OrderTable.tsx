import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  cancelado: 'Cancelado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendente: 'secondary',
  aprovado: 'default',
  cancelado: 'destructive',
  em_preparacao: 'secondary',
  enviado: 'default',
  entregue: 'outline',
};

function formatPrice(value: number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderTable({ orders }: { orders: Partial<Order>[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50">
            <TableCell>
              <Link href={`/admin/pedidos/${order.id}`} className="font-medium hover:underline">
                #{order.id}
              </Link>
            </TableCell>
            <TableCell>{order.customer_name}</TableCell>
            <TableCell>{formatPrice(order.total ?? 0)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[order.status ?? ''] ?? 'secondary'}>
                {STATUS_LABELS[order.status ?? ''] ?? order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-500 text-sm">
              {order.created_at ? formatDate(order.created_at) : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
