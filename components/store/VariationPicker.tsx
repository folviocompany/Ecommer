'use client';

import { useState } from 'react';
import type { VariationPublic } from '@/types';

interface Props {
  variations: VariationPublic[];
  onSelect: (variation: VariationPublic | null) => void;
}

export default function VariationPicker({ variations, onSelect }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colors = [...new Map(
    variations
      .filter((v) => v.color)
      .map((v) => [v.color, { color: v.color!, colorHex: v.colorHex }])
  ).values()];

  // Só mostra tamanhos após cor ser selecionada (quando o produto tem cores)
  const sizesForColor = selectedColor
    ? variations.filter((v) => v.color === selectedColor)
    : colors.length === 0 ? variations : [];

  const uniqueSizes = [...new Set(sizesForColor.map((v) => v.size).filter(Boolean))] as string[];

  function pickColor(color: string) {
    setSelectedColor(color);
    setSelectedSize(null);
    onSelect(null);
  }

  function pickSize(size: string) {
    setSelectedSize(size);
    const match = variations.find(
      (v) => v.color === selectedColor && v.size === size
    ) ?? variations.find((v) => v.size === size);
    onSelect(match ?? null);
  }

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Cor{selectedColor ? `: ${selectedColor}` : ''}
          </p>
          <div className="flex gap-2 flex-wrap">
            {colors.map(({ color, colorHex }) => {
              const hasStock = variations.some(
                (v) => v.color === color && v.stock > 0
              );
              return (
                <button
                  key={color}
                  title={color}
                  onClick={() => pickColor(color!)}
                  disabled={!hasStock}
                  className={`w-8 h-8 rounded-full border-2 transition-all
                    ${selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}
                    ${!hasStock ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                  style={{ backgroundColor: colorHex ?? color! }}
                />
              );
            })}
          </div>
        </div>
      )}

      {uniqueSizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tamanho</p>
          <div className="flex gap-2 flex-wrap">
            {uniqueSizes.map((size) => {
              const variation = variations.find(
                (v) => v.size === size && (selectedColor ? v.color === selectedColor : true)
              );
              const inStock = (variation?.stock ?? 0) > 0;
              return (
                <button
                  key={size}
                  onClick={() => pickSize(size)}
                  disabled={!inStock}
                  className={`px-3 py-1 rounded border text-sm font-medium transition-all
                    ${selectedSize === size
                      ? 'bg-[var(--store-color)] text-white border-[var(--store-color)]'
                      : 'bg-white border-gray-300 hover:border-[var(--store-color)]'}
                    ${!inStock ? 'opacity-30 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
