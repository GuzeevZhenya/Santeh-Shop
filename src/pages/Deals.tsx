import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import ErrorState from '@/components/store/ErrorState';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

export default function Deals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or('is_deal_of_day.eq.true,old_price.not.is.null')
      .order('updated_at', { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        if (err) setError(true);
        else setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-[#2563EB]/10 p-2.5 rounded-lg">
          <Flame className="w-6 h-6 text-[#2563EB]" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Суперцены</h1>
      </div>
      <p className="text-slate-500 mb-8">Товары со скидкой</p>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#F8FAFC] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState />
      ) : products.length === 0 ? (
        <p className="text-slate-400 text-center py-20">Акций пока нет</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
