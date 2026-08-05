import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { useFavorites } from '@/lib/favorites';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

export default function Favorites() {
  const { ids, loading: fLoading } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fLoading) return;
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .in('id', ids)
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, [ids, fLoading]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#2563EB]/10 p-2.5 rounded-lg">
          <Heart className="w-6 h-6 text-[#2563EB]" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Избранное</h1>
      </div>
      {loading || fLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#F8FAFC] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">Здесь будут сохранённые товары</p>
          <Link to="/catalog" className="text-[#2563EB] hover:underline">
            Перейти в каталог
          </Link>
        </div>
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
