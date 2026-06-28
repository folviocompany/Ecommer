import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import sql from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import StockBadge from '@/components/admin/StockBadge';

function formatPrice(v: number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function getProducts() {
  return sql`
    SELECT
      p.id, p.name, p.price, p.images, p.featured, p.active,
      c.name AS category_name,
      COALESCE(SUM(v.stock) FILTER (WHERE v.active = true), 0)::int AS total_stock
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN variations v ON v.product_id = p.id
    GROUP BY p.id, c.name
    ORDER BY p.created_at DESC
  `;
}

export default async function AdminProdutosPage() {
  const products = await getProducts();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo">
          <Button style={{ backgroundColor: 'var(--store-color)', color: 'white' }}>
            <Plus className="h-4 w-4 mr-2" /> Novo produto
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p: Record<string, unknown>) => (
              <TableRow key={p.id as number}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                      {(p.images as string[])[0] ? (
                        <Image src={(p.images as string[])[0]} alt="" fill className="object-cover" />
                      ) : <span className="flex items-center justify-center h-full text-gray-300">📦</span>}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{String(p.name)}</p>
                      {Boolean(p.featured) && <Badge variant="secondary" className="text-xs">Destaque</Badge>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{(p.category_name as string) ?? '—'}</TableCell>
                <TableCell className="text-sm">{formatPrice(p.price as number)}</TableCell>
                <TableCell><StockBadge stock={p.total_stock as number} /></TableCell>
                <TableCell>
                  <Badge variant={p.active ? 'default' : 'secondary'}>
                    {p.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/produtos/${p.id}`}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
