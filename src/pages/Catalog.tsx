import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import CategoryNav from '@/components/store/CategoryNav';
import ErrorState from '@/components/store/ErrorState';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/types/database';

const match = (p: Product, q: string) => {
  const s = (
    p.name +
    ' ' +
    (p.brand || '') +
    ' ' +
    (p.specs || '') +
    ' ' +
    (p.variants || []).flatMap((v) => [v.name, ...(v.options || [])]).join(' ')
  ).toLowerCase();
  return s.includes(q.toLowerCase());
};

export default function Catalog() {
  const { categoryId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories((data as Category[]) || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data, error: err }) => {
        if (err) setError(true);
        else setAll((data as Product[]) || []);
        setLoading(false);
      });
  }, [categoryId]);

  const activeCat = categories.find((c) => c.id === categoryId);
  const q = search.trim().toLowerCase();
  const inCat = all.filter((p) => !categoryId || p.category_id === categoryId);
  const shown = q ? inCat.filter((p) => match(p, q)) : inCat;
  const otherCats =
    q && shown.length === 0
      ? [
          ...new Set(
            all
              .filter((p) => match(p, q) && (!categoryId || p.category_id !== categoryId))
              .map((p) => p.category_id),
          ),
        ]
          .map((cid) => categories.find((c) => c.id === cid))
          .filter(Boolean) as Category[]
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-1">
        {activeCat?.name || 'Каталог'}
      </h1>
      <p className="text-slate-500 mb-6">Сантехника премиального качества с доставкой</p>

      <div className="relative mb-4 max-w-xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск в этой категории..."
          className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-[#2563EB] outline-none"
        />
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      <CategoryNav />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#F8FAFC] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState />
      ) : shown.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-3">
            {q
              ? `В категории «${activeCat?.name || 'Каталог'}» по запросу «${search}» ничего не найдено.`
              : 'Товаров пока нет'}
          </p>
          {otherCats.length > 0 && (
            <>
              <p className="text-sm text-slate-400 mb-3">Но найдено в других категориях:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {otherCats.map((c) => (
                  <Link
                    key={c.id}
                    to={`/catalog/${c.id}`}
                    className="px-4 py-2 rounded-full bg-blue-50 text-[#2563EB] text-sm font-medium"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
