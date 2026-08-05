import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { supabase } from '@/lib/supabase';
import type { Banner } from '@/types/database';

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
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <section className="relative h-[320px] md:h-[420px] bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] text-white flex items-center">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">АкваМаркет</h1>
          <p className="text-slate-300 mb-6 max-w-lg">Сантехника премиального качества с доставкой по Жлобину</p>
          <Link to="/catalog" className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-3 rounded-lg font-medium">
            В каталог
          </Link>
        </div>
      </section>
    );
  }

  const b = banners[i];
  const href = b.product_id ? `/product/${b.product_id}` : b.category_id ? `/catalog/${b.category_id}` : '/catalog';

  return (
    <section className="relative h-[320px] md:h-[420px] overflow-hidden bg-[#0F172A]">
      <Image src={b.image_url} alt={b.title} className="absolute inset-0 opacity-60" fittingType="fill" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl text-white">
          {b.badge && (
            <span className="inline-block mb-3 text-xs font-semibold bg-[#2563EB] px-3 py-1 rounded-full">
              {b.badge}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{b.title}</h1>
          {b.subtitle && <p className="text-slate-200 mb-6">{b.subtitle}</p>}
          <Link to={href} className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-3 rounded-lg font-medium">
            Смотреть
          </Link>
        </div>
      </div>
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setI((x) => (x - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setI((x) => (x + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </section>
  );
}
