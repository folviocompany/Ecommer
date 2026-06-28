import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { STORE_NAME, STORE_WHATSAPP } from '@/lib/store';

export default function Footer() {
  const waLink = STORE_WHATSAPP
    ? `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent('Olá, tenho uma dúvida sobre um pedido.')}`
    : null;

  return (
    <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A] text-sm text-[#A3A3A3]">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          &copy; {new Date().getFullYear()}{' '}
          <span className="font-heading text-base text-[#F97316]">{STORE_NAME}</span>
          . Todos os direitos reservados.
        </p>
        {waLink && (
          <Link
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-green-500 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Fale pelo WhatsApp
          </Link>
        )}
      </div>
    </footer>
  );
}
