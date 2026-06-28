'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';

export default function CategoryFilter({ categories }: { categories: Pick<Category, 'id' | 'name' | 'slug'>[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('category');

  function select(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    router.push(`/produtos?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!current ? 'default' : 'outline'}
        size="sm"
        onClick={() => select(null)}
        style={!current ? { backgroundColor: 'var(--store-color)', color: 'white' } : {}}
      >
        Todos
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={current === cat.slug ? 'default' : 'outline'}
          size="sm"
          onClick={() => select(cat.slug)}
          style={current === cat.slug ? { backgroundColor: 'var(--store-color)', color: 'white' } : {}}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
}
