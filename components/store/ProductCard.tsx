import Link from 'next/link';
import Image from 'next/image';
import { Package, Eye } from 'lucide-react';
import type { ProductPublic } from '@/types';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductCard({ product }: { product: ProductPublic }) {
  return (
    <Link href={`/produtos/${product.slug}`} className="group block">
      <div className="bg-[#1A1A1A] rounded-lg overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.18)]">

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
            <div className="w-full h-full flex items-center justify-center text-[#333]">
              <Package className="w-12 h-12" />
            </div>
          )}

          {/* Hover overlay */}
          {product.hasStock && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <span className="flex items-center gap-2 bg-[#F97316] text-white text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-2.5 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                <Eye className="w-3.5 h-3.5" />
                Ver produto
              </span>
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
            <p className="text-[10px] text-[#F97316] uppercase tracking-[0.25em] mb-2 font-semibold">
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
