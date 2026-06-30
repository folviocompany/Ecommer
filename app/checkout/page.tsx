'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';

function formatPrice(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '',
    street: '', number: '', complement: '', neighborhood: '',
    city: '', state: '', zipCode: '', notes: '',
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) {
      toast.error('Seu carrinho está vazio.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variationId: i.variationId,
            quantity: i.quantity,
          })),
          customer: { name: form.name, email: form.email, phone: form.phone, cpf: form.cpf },
          shippingAddress: {
            street: form.street, number: form.number, complement: form.complement,
            neighborhood: form.neighborhood, city: form.city, state: form.state, zipCode: form.zipCode,
          },
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 409) {
          toast.error(`Estoque insuficiente para o item. Disponível: ${err.available}`);
        } else {
          toast.error('Erro ao processar o pedido. Tente novamente.');
        }
        return;
      }

      const { checkoutUrl } = await res.json();
      if (!checkoutUrl) {
        toast.error('Erro ao obter URL de pagamento. Tente novamente.');
        return;
      }
      clearCart();
      window.location.href = checkoutUrl;
    } catch {
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) {
    router.replace('/carrinho');
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Finalizar compra</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section className="space-y-3">
              <h2 className="font-semibold text-lg">Dados pessoais</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Input placeholder="Nome completo *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </div>
                <Input placeholder="E-mail *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                <Input placeholder="Telefone *" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
                <Input placeholder="CPF *" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} required />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold text-lg">Endereço de entrega</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Input placeholder="Rua / Avenida *" value={form.street} onChange={(e) => set('street', e.target.value)} required />
                </div>
                <Input placeholder="Número *" value={form.number} onChange={(e) => set('number', e.target.value)} required />
                <Input placeholder="Complemento" value={form.complement} onChange={(e) => set('complement', e.target.value)} />
                <Input placeholder="Bairro *" value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} required />
                <Input placeholder="CEP *" value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} required />
                <Input placeholder="Cidade *" value={form.city} onChange={(e) => set('city', e.target.value)} required />
                <Input placeholder="Estado (UF) *" value={form.state} onChange={(e) => set('state', e.target.value)} maxLength={2} required />
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-lg">Observações</h2>
              <Textarea
                placeholder="Alguma observação sobre o pedido? (opcional)"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={2}
              />
            </section>
          </div>

          <div>
            <div className="border rounded-lg p-4 space-y-3 sticky top-20">
              <h2 className="font-semibold">Resumo do pedido</h2>
              {items.map((item) => (
                <div key={item.variationId} className="text-sm flex justify-between gap-2">
                  <span className="truncate">{item.productName} × {item.quantity}</span>
                  <span className="shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span style={{ color: 'var(--store-color)' }}>{formatPrice(total)}</span>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full text-white"
                style={{ backgroundColor: 'var(--store-color)' }}
              >
                {submitting ? 'Processando...' : 'Ir para pagamento'}
              </Button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
