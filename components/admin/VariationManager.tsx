'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  initial?: VariationRow[];
  onChange: (rows: VariationRow[]) => void;
}

const EMPTY: VariationRow = { size: '', color: '', colorHex: '#000000', sku: '', stock: 0, priceModifier: 0 };

export default function VariationManager({ initial = [], onChange }: Props) {
  const [rows, setRows] = useState<VariationRow[]>(initial.length ? initial : [{ ...EMPTY }]);

  function update(index: number, field: keyof VariationRow, value: string | number) {
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    setRows(next);
    onChange(next.filter((r) => !r._deleted));
  }

  function addRow() {
    const next = [...rows, { ...EMPTY }];
    setRows(next);
    onChange(next.filter((r) => !r._deleted));
  }

  function removeRow(index: number) {
    const row = rows[index];
    let next: VariationRow[];
    if (row.id) {
      // Soft delete — manter na lista mas marcar
      next = rows.map((r, i) => (i === index ? { ...r, _deleted: true } : r));
    } else {
      next = rows.filter((_, i) => i !== index);
    }
    setRows(next);
    onChange(next.filter((r) => !r._deleted));
  }

  const visible = rows.filter((r) => !r._deleted);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-gray-500 text-xs">
              <th className="text-left pb-2 pr-2">Tamanho</th>
              <th className="text-left pb-2 pr-2">Cor</th>
              <th className="text-left pb-2 pr-2">Hex</th>
              <th className="text-left pb-2 pr-2">SKU</th>
              <th className="text-left pb-2 pr-2">Estoque</th>
              <th className="text-left pb-2 pr-2">Dif. preço</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) =>
              row._deleted ? null : (
                <tr key={i} className="border-b">
                  {(['size', 'color', 'colorHex', 'sku'] as const).map((field) => (
                    <td key={field} className="py-1 pr-2">
                      {field === 'colorHex' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={row.colorHex}
                            onChange={(e) => update(i, 'colorHex', e.target.value)}
                            className="w-8 h-8 border rounded cursor-pointer"
                          />
                          <Input
                            value={row.colorHex}
                            onChange={(e) => update(i, 'colorHex', e.target.value)}
                            className="w-24 h-8 text-xs"
                          />
                        </div>
                      ) : (
                        <Input
                          value={row[field] as string}
                          onChange={(e) => update(i, field, e.target.value)}
                          className="h-8 text-xs"
                          placeholder={field}
                        />
                      )}
                    </td>
                  ))}
                  {(['stock', 'priceModifier'] as const).map((field) => (
                    <td key={field} className="py-1 pr-2">
                      <Input
                        type="number"
                        value={row[field]}
                        onChange={(e) => update(i, field, Number(e.target.value))}
                        className="h-8 w-20 text-xs"
                      />
                    </td>
                  ))}
                  <td className="py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => removeRow(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4 mr-1" />
        Adicionar variação
      </Button>
      {visible.length === 0 && (
        <p className="text-xs text-gray-400">Nenhuma variação adicionada.</p>
      )}
    </div>
  );
}
