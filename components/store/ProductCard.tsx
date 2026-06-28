import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { ProductPublic } from '@/types';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductCard({ product }: { product: ProductPublic }) {
  return (
    <Link href={`/produtos/${product.slug}`} className="group block">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            📦
          </div>
        )}
        {!product.hasStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">Esgotado</Badge>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{product.category?.name}</p>
      <h3 className="font-medium text-gray-900 group-hover:text-[var(--store-color)] transition-colors line-clamp-2">
        {product.name}
      </h3>
      <p className="mt-1 font-semibold" style={{ color: 'var(--store-color)' }}>
        {formatPrice(product.price)}
      </p>
    </Link>
  );
}
