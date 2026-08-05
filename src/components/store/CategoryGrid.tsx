import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { categoryIcon, LayoutGrid } from '@/lib/categoryIcons';
import type { Category } from '@/types/database';

export const CATEGORY_GRID_CLASS = 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4';
export const CATEGORY_CARD_CLASS =
  'flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-white px-3 py-4 sm:px-4 sm:py-5 text-center hover:border-[#2563EB]/40 hover:shadow-sm transition-all';


const MAX = 7;

type Props = {
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
      .limit(MAX)
      .then(({ data }) => setCats((data as Category[]) || []));
  }, []);

  const list = previewLimit != null ? cats.slice(0, previewLimit) : cats;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-6">{title}</h2>
      )}
      <div className={CATEGORY_GRID_CLASS}>
        {list.map((c) => {
          const Icon = categoryIcon(c.slug, c.icon);
          return (
            <Link key={c.id} to={`/catalog/${c.id}`} className={CATEGORY_CARD_CLASS}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" strokeWidth={1.5} />
              <span className="text-sm font-medium text-[#0F172A] leading-snug">
                {c.name}
              </span>
            </Link>
          );
        })}
        {showAllCard && (
          <Link to="/categories" className={CATEGORY_CARD_CLASS}>
            <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" strokeWidth={1.5} />
            <span className="text-sm font-medium text-[#0F172A] leading-snug">
              Все категории
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
