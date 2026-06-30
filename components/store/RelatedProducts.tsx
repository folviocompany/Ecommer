'use client';

import { useEffect, useState } from 'react';
import type { ProductPublic } from '@/types';
import ProductGrid from '@/components/store/ProductGrid';

interface Props {
  categorySlug: string;
  currentSlug: string;
}

export default function RelatedProducts({ categorySlug, currentSlug }: Props) {
  const [products, setProducts] = useState<ProductPublic[]>([]);

  useEffect(() => {
    fetch(`/api/products?category=${categorySlug}`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.products ?? [])
          .filter((p: ProductPublic) => p.slug !== currentSlug)
          .slice(0, 4);
        setProducts(filtered);
      })
      .catch(() => {});
  }, [categorySlug, currentSlug]);

  if (!products.length) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[#1A1A1A]">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-1 h-8 bg-[#F97316]" />
        <div>
          <p className="text-[#F97316] text-[10px] font-bold tracking-[0.4em] uppercase mb-1">
            Da mesma categoria
          </p>
          <h2 className="font-heading text-2xl md:text-3xl text-white tracking-wide leading-none">
            VOCÊ TAMBÉM PODE GOSTAR
          </h2>
        </div>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
