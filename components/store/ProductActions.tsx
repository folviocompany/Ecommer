'use client';

import { useState } from 'react';
import { ShoppingCart, MessageCircle, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import VariationPicker from '@/components/store/VariationPicker';
import { useCart } from '@/contexts/CartContext';
import type { ProductDetail, VariationPublic } from '@/types';
import { STORE_WHATSAPP } from '@/lib/store';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductActions({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<VariationPublic | null>(null);
  const [quantity, setQuantity] = useState(1);

  const price = selectedVariation?.finalPrice ?? product.price;
  const maxQty = Math.min(selectedVariation?.stock ?? 1, 10);
  const waUrl = STORE_WHATSAPP
    ? `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`)}`
    : null;

  function handleAddToCart() {
    if (!selectedVariation) {
      toast.error('Selecione uma variação antes de adicionar ao carrinho.');
      return;
    }
    const parts = [selectedVariation.size, selectedVariation.color].filter(Boolean);
    addItem({
      productId: product.id,
      variationId: selectedVariation.id,
      productName: product.name,
      variationDesc: parts.join(' / '),
      image: product.images[0] ?? '',
      unitPrice: selectedVariation.finalPrice,
      quantity,
    });
    toast.success('Produto adicionado ao carrinho!');
  }

  return (
    <div className="space-y-6">
      <p className="text-3xl font-bold" style={{ color: 'var(--store-color)' }}>
        {formatPrice(price)}
      </p>

      <div className="border-t border-[#1A1A1A] pt-5">
        <VariationPicker
          variations={product.variations}
          onSelect={setSelectedVariation}
        />
      </div>

      {selectedVariation && (
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-[0.3em]">Qtd.</span>
          <div className="flex items-center border border-[#2A2A2A] rounded">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-medium text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="w-10 h-10 flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-xs text-[#555]">{selectedVariation.stock} disponíveis</span>
        </div>
      )}

      <div className="flex gap-3 flex-wrap pt-2">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedVariation || selectedVariation.stock === 0}
          className="text-white font-bold tracking-wide flex-1 sm:flex-none hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--store-color)' }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Adicionar ao carrinho
        </Button>

        {waUrl && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="border-green-600 text-green-500 hover:bg-green-950/40 hover:text-green-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
