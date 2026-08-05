import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/database';
import { cn } from '@/lib/utils';

export default function CategoryNav() {
  const { categoryId } = useParams();
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCats((data as Category[]) || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        <Link
          to="/catalog"
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5',
            !categoryId ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#0F172A]',
          )}
        >
          <LayoutGrid className="w-4 h-4" /> Все
        </Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            to={`/catalog/${c.id}`}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium',
              categoryId === c.id ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#0F172A]',
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
