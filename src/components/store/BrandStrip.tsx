import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/** Лента брендов из каталога — светлая полоса как на макете */
export default function BrandStrip() {
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .not('brand', 'is', null)
      .then(({ data }) => {
        const rows = (data || []) as { brand: string | null }[];
        const uniq = [
          ...new Set(
            rows
              .map((r) => r.brand?.trim())
              .filter((b): b is string => Boolean(b)),
          ),
        ].sort((a, b) => a.localeCompare(b, 'ru'));
        setBrands(uniq);
      });
  }, []);

  if (!brands.length) return null;

  const loop = [...brands, ...brands, ...brands];

  return (
    <div className="bg-[#F1F5F9] overflow-hidden py-5">
      <div className="animate-marquee flex w-max items-center gap-10 md:gap-14 px-4">
        {loop.map((b, i) => (
          <Link
            key={`${b}-${i}`}
            to={`/search?q=${encodeURIComponent(b)}`}
            className="shrink-0 text-sm md:text-base font-semibold tracking-wide text-slate-400 hover:text-[#0F172A] transition-colors uppercase"
          >
            {b}
          </Link>
        ))}
      </div>
    </div>
  );
}
