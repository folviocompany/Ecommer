import Link from 'next/link';
import { Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

export default async function PendentePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <Clock className="h-20 w-20 mx-auto text-yellow-500" />
        <h1 className="text-3xl font-bold">Pagamento em análise</h1>
        <p className="text-gray-600">
          Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail assim que
          for aprovado.
        </p>
        {orderId && (
          <p className="text-sm text-gray-400">Pedido #{orderId}</p>
        )}
        <Link href="/produtos">
          <Button style={{ backgroundColor: 'var(--store-color)', color: 'white' }}>
            Voltar à loja
          </Button>
        </Link>
      </main>
      <Footer />
    </>
  );
}
