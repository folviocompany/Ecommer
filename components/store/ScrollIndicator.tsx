'use client';

import { ChevronDown } from 'lucide-react';

export default function ScrollIndicator({ targetId }: { targetId: string }) {
  function handleClick() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#A3A3A3] animate-bounce cursor-pointer hover:text-[#F97316] transition-colors"
      aria-label="Ver produtos em destaque"
    >
      <span className="text-[10px] tracking-[0.4em] uppercase font-medium">Scroll</span>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}
