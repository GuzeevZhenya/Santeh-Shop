import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { supabase } from '@/lib/supabase';
import type { Banner } from '@/types/database';

/** Full-bleed hero по макету главной */
export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setBanners((data as Banner[]) || []));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <section className="relative min-h-[420px] md:min-h-[520px] bg-[#0F172A] text-white flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <span className="inline-block mb-4 text-xs font-semibold bg-[#2563EB] px-3 py-1 rounded-full">
            Скидки до 40%
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Сезонная распродажа сантехники
          </h1>
          <p className="text-slate-300 mb-8 max-w-lg text-lg">
            Скидки до 40% на ванны и смесители
          </p>
          <Link
            to="/deals"
            className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] px-7 py-3.5 rounded-lg font-medium transition-colors"
          >
            Смотреть предложения
          </Link>
        </div>
      </section>
    );
  }

  const b = banners[i];
  const href = b.product_id
    ? `/product/${b.product_id}`
    : b.category_id
      ? `/catalog/${b.category_id}`
      : '/deals';

  return (
    <section className="relative min-h-[420px] md:min-h-[520px] overflow-hidden bg-[#0F172A]">
      <Image
        src={b.image_url}
        alt={b.title}
        className="absolute inset-0 w-full h-full object-cover"
        fittingType="fill"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/70 to-[#0F172A]/25" />
      <div className="relative max-w-7xl mx-auto px-4 min-h-[420px] md:min-h-[520px] flex items-center py-16">
        <div className="max-w-xl text-white">
          {(b.badge || 'Акция') && (
            <span className="inline-block mb-4 text-xs font-semibold bg-[#2563EB] px-3 py-1 rounded-full">
              {b.badge || 'Акция'}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{b.title}</h1>
          {b.subtitle && (
            <p className="text-slate-200 mb-8 text-base md:text-lg leading-relaxed">{b.subtitle}</p>
          )}
          <Link
            to={href}
            className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] px-7 py-3.5 rounded-lg font-medium transition-colors"
          >
            Смотреть предложения
          </Link>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Назад"
            onClick={() => setI((x) => (x - 1 + banners.length) % banners.length)}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Вперёд"
            onClick={() => setI((x) => (x + 1) % banners.length)}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Слайд ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? 'w-7 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
