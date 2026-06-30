'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '',
    street: '', number: '', complement: '', neighborhood: '',
    city: '', state: '', zipCode: '', notes: '',
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    set('zipCode', formatted);
  }

  async function handleCepBlur() {
    const cleaned = form.zipCode.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setForm((f) => ({
        ...f,
        street: data.logradouro || f.street,
        neighborhood: data.bairro || f.neighborhood,
        city: data.localidade || f.city,
        state: data.uf || f.state,
      }));
    } catch {
      // user can fill manually
    } finally {
      setCepLoading(false);
    }
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
        <h1 className="text-2xl font-bold mb-2">Finalizar compra</h1>
        <p className="text-sm text-gray-500 mb-8">Preencha seus dados para concluir o pedido</p>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8 order-2 md:order-1">

            {/* Dados pessoais */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#F97316] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <h2 className="font-semibold text-lg">Dados pessoais</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Nome completo *">
                    <Input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Seu nome completo" />
                  </Field>
                </div>
                <Field label="E-mail *">
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="seu@email.com" />
                </Field>
                <Field label="Telefone *">
                  <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="(00) 00000-0000" />
                </Field>
                <Field label="CPF *">
                  <Input value={form.cpf} onChange={(e) => set('cpf', e.target.value)} required placeholder="000.000.000-00" />
                </Field>
              </div>
            </section>

            {/* Endereço */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#F97316] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <h2 className="font-semibold text-lg">Endereço de entrega</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={`CEP * ${cepLoading ? '(buscando...)' : ''}`}>
                  <Input
                    value={form.zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={handleCepBlur}
                    required
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Rua / Avenida *">
                    <Input value={form.street} onChange={(e) => set('street', e.target.value)} required placeholder="Nome da rua" />
                  </Field>
                </div>
                <Field label="Número *">
                  <Input value={form.number} onChange={(e) => set('number', e.target.value)} required placeholder="123" />
                </Field>
                <Field label="Complemento">
                  <Input value={form.complement} onChange={(e) => set('complement', e.target.value)} placeholder="Apto, Bloco..." />
                </Field>
                <Field label="Bairro *">
                  <Input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} required placeholder="Seu bairro" />
                </Field>
                <Field label="Cidade *">
                  <Input value={form.city} onChange={(e) => set('city', e.target.value)} required placeholder="Sua cidade" />
                </Field>
                <Field label="Estado (UF) *">
                  <Input value={form.state} onChange={(e) => set('state', e.target.value)} maxLength={2} required placeholder="SP" />
                </Field>
              </div>
            </section>

            {/* Observações */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#F97316] text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <h2 className="font-semibold text-lg">Observações</h2>
              </div>
              <Textarea
                placeholder="Alguma observação sobre o pedido? (opcional)"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
              />
            </section>
          </div>

          {/* Order summary */}
          <div className="order-1 md:order-2">
            <div className="border rounded-lg p-4 space-y-4 sticky top-20">
              <h2 className="font-semibold text-base">Resumo do pedido</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.variationId} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded bg-gray-100 shrink-0 overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.variationDesc} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span style={{ color: 'var(--store-color)' }}>{formatPrice(total)}</span>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full text-white font-bold tracking-wide"
                style={{ backgroundColor: 'var(--store-color)' }}
              >
                {submitting ? 'Processando...' : 'Ir para pagamento →'}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Pagamento seguro via Mercado Pago
              </p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
