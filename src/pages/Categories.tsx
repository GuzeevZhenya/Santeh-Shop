import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { categoryIcon } from '@/lib/categoryIcons';
import type { Category } from '@/types/database';

export default function Categories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCats((data as Category[]) || []));

    supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true)
      .then(({ data }) => {
        const map: Record<string, number> = {};
        (data || []).forEach((row) => {
          const id = row.category_id as string | null;
          if (!id) return;
          map[id] = (map[id] || 0) + 1;
        });
        setCounts(map);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Все категории</h1>
      <p className="text-slate-500 mb-8">Выберите раздел сантехники</p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {cats.map((c) => {
          const Icon = categoryIcon(c.slug, c.icon);
          const n = counts[c.id] || 0;
          return (
            <Link
              key={c.id}
              to={`/catalog/${c.id}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-10 sm:py-12 text-center hover:border-[#2563EB]/50 hover:shadow-md transition-all"
            >
              <Icon className="w-10 h-10 text-[#2563EB] group-hover:scale-105 transition-transform" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-semibold text-[#0F172A]">{c.name}</span>
              <span className="text-xs text-slate-400">
                {n} {n === 1 ? 'товар' : n > 1 && n < 5 ? 'товара' : 'товаров'}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-[#2563EB] font-medium hover:gap-3 transition-all"
        >
          Смотреть все товары <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
