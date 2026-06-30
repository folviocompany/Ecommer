'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STORE_NAME } from '@/lib/store';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Página não encontrada.</p>
    </div>
  );
}

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [available, setAvailable] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setAvailable(false); return; }
    fetch('/api/admin/setup')
      .then((r) => r.json())
      .then((d) => setAvailable(d.available))
      .catch(() => setAvailable(false));
  }, [token]);

  if (available === null) return null;
  if (!token || available === false) return <NotFound />;

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar administrador.');
        return;
      }

      router.replace('/admin/login');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[#F97316] font-bold text-sm tracking-widest uppercase mb-2">
            {STORE_NAME}
          </p>
          <h1 className="text-white text-2xl font-bold">Configuração inicial</h1>
          <p className="text-gray-400 text-sm mt-1">
            Crie o administrador do painel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-4 border border-gray-800">
          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Nome</label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              placeholder="Seu nome"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
              placeholder="admin@exemplo.com"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Senha</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Confirmar senha</label>
            <Input
              type="password"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
              required
              placeholder="Repita a senha"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold tracking-wide"
            style={{ backgroundColor: 'var(--store-color)' }}
          >
            {loading ? 'Criando...' : 'Criar administrador'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Esta página só funciona uma vez e ficará inacessível após o cadastro.
        </p>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupForm />
    </Suspense>
  );
}
