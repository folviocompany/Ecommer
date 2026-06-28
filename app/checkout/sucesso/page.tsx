import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  cancelado: 'Cancelado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
};

async function getOrder(id: string) {
  try {
    const res = await fetch(`${BASE}/api/admin/orders/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function formatPrice(v: number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
        <h1 className="text-3xl font-bold">Pedido recebido!</h1>
        <p className="text-gray-600">
          Obrigado pela sua compra. Você receberá uma confirmação por e-mail em breve.
        </p>

        {order && (
          <div className="border rounded-lg p-4 text-left space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Pedido #{order.id}</span>
              <Badge>{STATUS_LABELS[order.status] ?? order.status}</Badge>
            </div>
            {order.items?.map((item: { id: number; product_name: string; variation_desc: string; quantity: number; subtotal: number }) => (
              <div key={item.id} className="text-sm flex justify-between">
                <span>{item.product_name} {item.variation_desc ? `(${item.variation_desc})` : ''} × {item.quantity}</span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        <Link href="/produtos">
          <Button style={{ backgroundColor: 'var(--store-color)', color: 'white' }}>
            Continuar comprando
          </Button>
        </Link>
      </main>
      <Footer />
    </>
  );
}
