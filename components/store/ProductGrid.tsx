import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductPublic } from '@/types';

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square rounded-lg mb-3" />
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products }: { products: ProductPublic[] }) {
  if (!products.length) {
    return (
      <p className="text-center text-gray-500 py-16">Nenhum produto encontrado.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p, i) => (
        <div key={p.id} className="product-reveal">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
