'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function RevealOnScroll({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>('.product-reveal'));
    const headings = Array.from(container.querySelectorAll<HTMLElement>('.reveal-heading'));

    // Set hidden state via JS (never blocks render without JS)
    const hide = (el: HTMLElement, extra?: Partial<CSSStyleDeclaration>) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      if (extra) Object.assign(el.style, extra);
    };

    headings.forEach((h) => hide(h, { transform: 'translateY(18px)', transition: 'opacity 0.65s ease, transform 0.65s ease' }));
    cards.forEach((c) => hide(c));

    const reveal = () => {
      headings.forEach((h, i) => {
        setTimeout(() => {
          h.style.opacity = '1';
          h.style.transform = 'translateY(0)';
        }, i * 120);
      });
      cards.forEach((c, i) => {
        setTimeout(() => {
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        }, headings.length * 120 + i * 75);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.04 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
