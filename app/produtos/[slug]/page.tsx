'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VariationPicker from '@/components/store/VariationPicker';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import type { ProductDetail, VariationPublic } from '@/types';
import { STORE_WHATSAPP } from '@/lib/store';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProdutoPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<VariationPublic | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (!r.ok) router.replace('/produtos');
        return r.json();
      })
      .then(setProduct)
      .catch(() => router.replace('/produtos'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const maxQty = Math.min(selectedVariation?.stock ?? 1, 10);
  const price = selectedVariation?.finalPrice ?? product.price;
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
      productId: product!.id,
      variationId: selectedVariation.id,
      productName: product!.name,
      variationDesc: parts.join(' / '),
      image: product!.images[0] ?? '',
      unitPrice: selectedVariation.finalPrice,
      quantity,
    });
    toast.success('Produto adicionado ao carrinho!');
  }

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Galeria */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
              {product.images[mainImage] ? (
                <Image
                  src={product.images[mainImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">📦</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                      ${i === mainImage ? 'border-[var(--store-color)]' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.category && (
              <p className="text-sm text-gray-500">{product.category.name}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-3xl font-semibold" style={{ color: 'var(--store-color)' }}>
              {formatPrice(price)}
            </p>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <VariationPicker
              variations={product.variations}
              onSelect={setSelectedVariation}
            />

            {selectedVariation && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantidade:</span>
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-lg"
                  >−</button>
                  <span className="px-3 py-1 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    className="px-3 py-1 text-lg"
                  >+</button>
                </div>
                <span className="text-xs text-gray-400">{selectedVariation.stock} disponíveis</span>
              </div>
            )}

            <div className="flex gap-3 flex-wrap pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariation || selectedVariation.stock === 0}
                className="text-white"
                style={{ backgroundColor: 'var(--store-color)' }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar ao carrinho
              </Button>

              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comprar pelo WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
