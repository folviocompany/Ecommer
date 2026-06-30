import Link from 'next/link';
import { MessageCircle, Instagram, Mail } from 'lucide-react';
import { STORE_NAME, STORE_WHATSAPP } from '@/lib/store';

const categories = [
  { name: 'Camisetas', slug: 'camisetas' },
  { name: 'Moletons', slug: 'moletons' },
  { name: 'Bonés', slug: 'bones' },
  { name: 'Acessórios', slug: 'acessorios' },
];

export default function Footer() {
  const waLink = STORE_WHATSAPP
    ? `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent('Olá, tenho uma dúvida sobre um pedido.')}`
    : null;

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-2">
          <p className="font-heading text-3xl text-[#F97316] tracking-wider mb-3">{STORE_NAME}</p>
          <p className="text-[#A3A3A3] text-sm leading-relaxed max-w-xs mb-6">
            Drops exclusivos para quem vive o streetwear de verdade. Peças limitadas, identidade autêntica.
          </p>
          <div className="flex gap-3">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:border-green-500 hover:text-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:border-[#F97316] hover:text-[#F97316] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <p className="text-white font-semibold text-xs tracking-[0.3em] mb-5 uppercase">Categorias</p>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/produtos?categoria=${cat.slug}`}
                  className="text-[#A3A3A3] text-sm hover:text-[#F97316] transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/produtos" className="text-[#F97316] text-sm font-medium hover:text-[#EA6C00] transition-colors">
                Ver tudo →
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-white font-semibold text-xs tracking-[0.3em] mb-5 uppercase">Atendimento</p>
          <ul className="space-y-3">
            {waLink && (
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#A3A3A3] text-sm hover:text-green-500 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  WhatsApp
                </a>
              </li>
            )}
            <li>
              <span className="flex items-center gap-2 text-[#A3A3A3] text-sm">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                contato@dropstore.com
              </span>
            </li>
            <li className="pt-3">
              <p className="text-[#F97316] text-[10px] font-bold tracking-[0.3em] uppercase mb-3">Pagamento aceito</p>
              <div className="flex gap-2 flex-wrap">
                <span className="border border-[#2A2A2A] text-[#A3A3A3] text-[10px] px-2 py-1 rounded tracking-wide">PIX</span>
                <span className="border border-[#2A2A2A] text-[#A3A3A3] text-[10px] px-2 py-1 rounded tracking-wide">CRÉDITO</span>
                <span className="border border-[#2A2A2A] text-[#A3A3A3] text-[10px] px-2 py-1 rounded tracking-wide">BOLETO</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#444] text-xs">
            &copy; {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados.
          </p>
          <div className="flex gap-5">
            <Link href="#" className="text-[#444] text-xs hover:text-[#A3A3A3] transition-colors">
              Política de Privacidade
            </Link>
            <Link href="#" className="text-[#444] text-xs hover:text-[#A3A3A3] transition-colors">
              Trocas e Devoluções
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
