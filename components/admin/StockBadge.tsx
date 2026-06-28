import { Badge } from '@/components/ui/badge';

export default function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Sem estoque</Badge>;
  if (stock <= 5) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">{stock} un.</Badge>;
  return <Badge variant="outline" className="border-green-500 text-green-700">{stock} un.</Badge>;
}
