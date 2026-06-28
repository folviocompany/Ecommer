'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface Category {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setName('');
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDialogOpen(true);
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/admin/categories/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        toast.success('Categoria atualizada!');
      } else {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        toast.success('Categoria criada!');
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !cat.active }),
    });
    load();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={openNew} style={{ backgroundColor: 'var(--store-color)', color: 'white' }}>
          <Plus className="h-4 w-4 mr-2" /> Nova categoria
        </Button>
      </div>

      <div className="bg-white rounded-lg border divide-y">
        {categories.length === 0 && (
          <p className="p-6 text-gray-400 text-sm text-center">Nenhuma categoria cadastrada.</p>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="font-medium">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.slug}</span>
              {!cat.active && <Badge variant="secondary">Inativa</Badge>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toggleActive(cat)}>
                <Trash2 className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome da categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={save}
              disabled={saving}
              style={{ backgroundColor: 'var(--store-color)', color: 'white' }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
