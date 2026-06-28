'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import VariationManager from './VariationManager';
import type { Category } from '@/types';

interface VariationRow {
  id?: number;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
  priceModifier: number;
  _deleted?: boolean;
}

interface Props {
  categories: Pick<Category, 'id' | 'name'>[];
  initial?: {
    id?: number;
    name?: string;
    categoryId?: number | null;
    description?: string | null;
    price?: number;
    images?: string[];
    featured?: boolean;
    variations?: VariationRow[];
  };
}

export default function ProductForm({ categories, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState<string>(String(initial?.categoryId ?? ''));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [imagesRaw, setImagesRaw] = useState((initial?.images ?? []).join('\n'));
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [variations, setVariations] = useState<VariationRow[]>(initial?.variations ?? []);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const images = imagesRaw.split('\n').map((s) => s.trim()).filter(Boolean);
      const body = {
        name,
        categoryId: categoryId ? Number(categoryId) : null,
        description,
        price: Number(price),
        images,
        featured,
        variations: isEdit
          ? {
              add: variations.filter((v) => !v.id),
              update: variations.filter((v) => v.id),
              remove: [],
            }
          : variations,
      };

      const url = isEdit ? `/api/admin/products/${initial!.id}` : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success(isEdit ? 'Produto atualizado!' : 'Produto criado!');
      router.push('/admin/produtos');
      router.refresh();
    } catch (err) {
      toast.error('Erro ao salvar produto.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Nome *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Categoria</label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Preço base (R$) *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">URLs das imagens (uma por linha)</label>
          <Textarea
            value={imagesRaw}
            onChange={(e) => setImagesRaw(e.target.value)}
            rows={3}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="featured" className="text-sm font-medium">Destacar na home</label>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Variações</p>
        <VariationManager initial={variations} onChange={setVariations} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} style={{ backgroundColor: 'var(--store-color)', color: 'white' }}>
          {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
