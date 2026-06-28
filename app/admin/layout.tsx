import Sidebar from '@/components/admin/Sidebar';

// Todas as páginas admin são dinâmicas: dependem de auth e dados do banco em runtime
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </div>
    </div>
  );
}
