import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { categoryIcon, LayoutGrid } from '@/lib/categoryIcons';
import type { Category } from '@/types/database';

type Props = {
  /** Сколько категорий показать до карточки «Все» (на главной). Если не задано — все. */
  previewLimit?: number;
  title?: string;
  showAllCard?: boolean;
};

export default function CategoryGrid({
  previewLimit,
  title = 'Категории',
  showAllCard = true,
}: Props) {
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCats((data as Category[]) || []));
  }, []);

  const list =
    previewLimit != null ? cats.slice(0, previewLimit) : cats;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {list.map((c) => {
          const Icon = categoryIcon(c.slug, c.icon);
          return (
            <Link
              key={c.id}
              to={`/catalog/${c.id}`}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-8 sm:py-10 text-center hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
            >
              <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-[#2563EB]" strokeWidth={1.5} />
              <span className="text-sm sm:text-base font-medium text-[#0F172A] leading-snug">
                {c.name}
              </span>
            </Link>
          );
        })}
        {showAllCard && (
          <Link
            to="/categories"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2563EB]/40 bg-[#2563EB]/5 px-4 py-8 sm:py-10 text-center hover:bg-[#2563EB]/10 transition-all"
          >
            <LayoutGrid className="w-8 h-8 sm:w-9 sm:h-9 text-[#2563EB]" strokeWidth={1.5} />
            <span className="text-sm sm:text-base font-semibold text-[#2563EB] leading-snug">
              Все категории
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
