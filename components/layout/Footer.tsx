import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Loja';
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? '';

export default function Footer() {
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá, tenho uma dúvida sobre um pedido.')}`
    : null;

  return (
    <footer className="mt-auto border-t bg-gray-50 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          &copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
        </p>
        {waLink && (
          <Link
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Fale pelo WhatsApp
          </Link>
        )}
      </div>
    </footer>
  );
}
