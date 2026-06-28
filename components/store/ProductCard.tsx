import Link from 'next/link';
import Image from 'next/image';
import type { ProductPublic } from '@/types';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductCard({ product }: { product: ProductPublic }) {
  return (
    <Link href={`/produtos/${product.slug}`} className="group block">
      <div className="bg-[#1A1A1A] rounded-lg overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.12)]">

        {/* Image */}
        <div className="relative aspect-square bg-[#242424] overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-[#333]">
              📦
            </div>
          )}
          {!product.hasStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-[#1A1A1A] text-[#A3A3A3] text-[10px] font-bold px-3 py-1.5 tracking-[0.3em] uppercase">
                ESGOTADO
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category?.name && (
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-[0.25em] mb-2">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm font-medium text-white group-hover:text-[#F97316] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="mt-3 text-base font-bold text-[#F97316]">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
