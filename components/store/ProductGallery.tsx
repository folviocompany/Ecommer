'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface Props {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: Props) {
  const [mainImage, setMainImage] = useState(0);

  return (
    <div>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1A1A1A] mb-3">
        {images[mainImage] ? (
          <Image
            src={images[mainImage]}
            alt={name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#333]">
            <Package className="w-16 h-16" />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImage(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${i === mainImage
                  ? 'border-[#F97316] opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
