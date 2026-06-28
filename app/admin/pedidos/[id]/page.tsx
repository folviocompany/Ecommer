'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Order, OrderItem, OrderStatus, ShippingAddress } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  cancelado: 'Cancelado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
};

const STATUS_FLOW: OrderStatus[] = ['aprovado', 'em_preparacao', 'enviado', 'entregue', 'cancelado'];

function formatPrice(v: number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(v: string) {
  return new Date(v).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/orders/${id}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
      setNewStatus(data.status);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function updateStatus() {
    if (!newStatus || newStatus === order?.status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success('Status atualizado!');
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!order) return <div className="p-6 text-gray-400">Carregando...</div>;

  const address: ShippingAddress | null = order.shipping_address
    ? JSON.parse(order.shipping_address)
    : null;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
        <Badge>{STATUS_LABELS[order.status] ?? order.status}</Badge>
        <span className="text-sm text-gray-400">{formatDate(order.created_at)}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold">Cliente</h2>
          <p className="text-sm">{order.customer_name}</p>
          <p className="text-sm text-gray-500">{order.customer_email}</p>
          {order.customer_phone && <p className="text-sm text-gray-500">{order.customer_phone}</p>}
          {order.customer_cpf && <p className="text-sm text-gray-500">CPF: {order.customer_cpf}</p>}
        </div>

        {address && (
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">Endereço de entrega</h2>
            <p className="text-sm">{address.street}, {address.number}{address.complement ? ` - ${address.complement}` : ''}</p>
            <p className="text-sm text-gray-500">{address.neighborhood}</p>
            <p className="text-sm text-gray-500">{address.city} - {address.state} / {address.zipCode}</p>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Itens</h2>
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product_name}
              {item.variation_desc && <span className="text-gray-400 ml-1">({item.variation_desc})</span>}
              {' '}× {item.quantity}
            </span>
            <span>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between text-sm">
          <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Frete</span><span>{formatPrice(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span style={{ color: 'var(--store-color)' }}>{formatPrice(order.total)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-1">Observações</h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Atualizar status</h2>
        <div className="flex gap-3">
          <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? '')}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={updateStatus}
            disabled={saving || newStatus === order.status}
            style={{ backgroundColor: 'var(--store-color)', color: 'white' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
