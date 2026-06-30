'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export default function PerfilPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.newPassword !== form.confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao alterar senha.');
        return;
      }

      toast.success('Senha alterada com sucesso!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch {
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <KeyRound className="h-5 w-5 text-gray-400" />
        <div>
          <h1 className="text-xl font-bold">Meu perfil</h1>
          <p className="text-sm text-gray-500">Altere sua senha de acesso</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-4 border border-gray-800">
        <div>
          <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
            Senha atual
          </label>
          <Input
            type="password"
            value={form.currentPassword}
            onChange={(e) => set('currentPassword', e.target.value)}
            required
            placeholder="Sua senha atual"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
            Nova senha
          </label>
          <Input
            type="password"
            value={form.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            required
            placeholder="Mínimo 8 caracteres"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
            Confirmar nova senha
          </label>
          <Input
            type="password"
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            required
            placeholder="Repita a nova senha"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold tracking-wide"
          style={{ backgroundColor: 'var(--store-color)' }}
        >
          {loading ? 'Salvando...' : 'Alterar senha'}
        </Button>
      </form>
    </div>
  );
}
