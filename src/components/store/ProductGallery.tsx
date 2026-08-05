import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Image } from '@/components/ui/image';

type Props = {
  images: string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [];

  useEffect(() => {
    setActive(0);
  }, [images.join('|')]);

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % list.length), 5000);
    return () => clearInterval(t);
  }, [list.length]);

  if (!list.length) {
    return (
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-300">
        <ShoppingCart className="w-16 h-16" />
      </div>
    );
  }

  const prev = () => setActive((i) => (i - 1 + list.length) % list.length);
  const next = () => setActive((i) => (i + 1) % list.length);

  return (
    <div className="space-y-3">
      <div className="relative group aspect-square rounded-2xl overflow-hidden bg-[#F8FAFC] shadow-sm ring-1 ring-slate-100">
        <Image
          key={list[active]}
          src={list[active]}
          alt={alt}
          fittingType="fit"
          className="w-full h-full object-contain transition-opacity duration-300"
        />
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Предыдущее"
            >
              <ChevronLeft className="w-5 h-5 text-[#0F172A]" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Следующее"
            >
              <ChevronRight className="w-5 h-5 text-[#0F172A]" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-[#2563EB]' : 'w-1.5 bg-white/80'}`}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${
                i === active ? 'border-[#2563EB]' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" fittingType="fill" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
