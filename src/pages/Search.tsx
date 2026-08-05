import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

const match = (p: Product, q: string) => {
  const s = (p.name + ' ' + (p.brand || '') + ' ' + (p.specs || '')).toLowerCase();
  return s.includes(q.toLowerCase());
};

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setInput(q), [q]);
  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(300)
      .then(({ data }) => {
        setAll((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  const results = q ? all.filter((p) => match(p, q)) : [];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-6">Поиск товаров</h1>
      <form onSubmit={submit} className="relative mb-8 max-w-xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Название, бренд..."
          className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-[#2563EB] outline-none"
        />
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </form>
      {!q ? (
        <p className="text-slate-400">Введите запрос</p>
      ) : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#F8FAFC] animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">Ничего не найдено по «{q}»</p>
          <Link to="/catalog" className="text-[#2563EB] hover:underline">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
