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
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-[0.3em] mb-3">
            Cor{selectedColor ? <span className="text-white normal-case tracking-normal font-medium ml-2">{selectedColor}</span> : ''}
          </p>
          <div className="flex gap-3 flex-wrap">
            {colors.map(({ color, colorHex }) => {
              const hasStock = variations.some((v) => v.color === color && v.stock > 0);
              return (
                <button
                  key={color}
                  title={color}
                  onClick={() => pickColor(color!)}
                  disabled={!hasStock}
                  className={`w-10 h-10 rounded-full transition-all relative
                    ${selectedColor === color
                      ? 'ring-2 ring-[#F97316] ring-offset-2 ring-offset-[#0A0A0A] scale-110'
                      : 'ring-1 ring-[#333] ring-offset-1 ring-offset-[#0A0A0A]'}
                    ${!hasStock ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 cursor-pointer hover:ring-[#F97316]'}`}
                  style={{ backgroundColor: colorHex ?? color! }}
                />
              );
            })}
          </div>
        </div>
      )}

      {uniqueSizes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-[0.3em] mb-3">Tamanho</p>
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
                  className={`px-4 py-3 text-xs font-bold tracking-wide transition-all border
                    ${selectedSize === size
                      ? 'bg-[#F97316] text-white border-[#F97316]'
                      : 'bg-transparent text-[#A3A3A3] border-[#333] hover:border-[#F97316] hover:text-white'}
                    ${!inStock ? 'opacity-25 cursor-not-allowed line-through' : 'cursor-pointer'}`}
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
