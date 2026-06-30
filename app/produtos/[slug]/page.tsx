'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ShoppingCart, ChevronRight, Package, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VariationPicker from '@/components/store/VariationPicker';
import RelatedProducts from '@/components/store/RelatedProducts';
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
        if (!r.ok) {
          router.replace('/produtos');
          return null;
        }
        return r.json();
      })
      .then((data) => { if (data) setProduct(data); })
      .catch(() => router.replace('/produtos'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="bg-[#0A0A0A] min-h-screen">
          <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-xl bg-[#1A1A1A]" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-32 bg-[#1A1A1A]" />
              <Skeleton className="h-10 w-3/4 bg-[#1A1A1A]" />
              <Skeleton className="h-8 w-1/3 bg-[#1A1A1A]" />
              <Skeleton className="h-24 w-full bg-[#1A1A1A]" />
            </div>
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
      <main className="bg-[#0A0A0A] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#555] mb-8 flex-wrap">
            <Link href="/" className="hover:text-[#F97316] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href="/produtos" className="hover:text-[#F97316] transition-colors">Produtos</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <Link
                  href={`/produtos?categoria=${product.category.slug}`}
                  className="hover:text-[#F97316] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-[#A3A3A3] line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">

            {/* Galeria */}
            <div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1A1A1A] mb-3">
                {product.images[mainImage] ? (
                  <Image
                    src={product.images[mainImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333]">
                    <Package className="w-16 h-16" />
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                        ${i === mainImage
                          ? 'border-[#F97316] opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {product.category && (
                <p className="text-[#F97316] text-[10px] font-bold tracking-[0.4em] uppercase">
                  {product.category.name}
                </p>
              )}

              <h1 className="font-heading text-3xl md:text-4xl text-white leading-tight tracking-wide">
                {product.name}
              </h1>

              <p className="text-3xl font-bold" style={{ color: 'var(--store-color)' }}>
                {formatPrice(price)}
              </p>

              {product.description && (
                <p className="text-[#A3A3A3] leading-relaxed text-sm border-t border-[#1A1A1A] pt-5">
                  {product.description}
                </p>
              )}

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
                      className="w-9 h-9 flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-[#A3A3A3] hover:text-white transition-colors"
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
          </div>

          {/* Related Products */}
          {product.category && (
            <RelatedProducts
              categorySlug={product.category.slug}
              currentSlug={product.slug}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
