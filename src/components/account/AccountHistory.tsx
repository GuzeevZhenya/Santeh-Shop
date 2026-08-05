import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/store/ProductCard';
import { useViewHistory } from '@/lib/viewHistory';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

export default function AccountHistory() {
  const { ids } = useViewHistory();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      return;
    }
    supabase
      .from('products')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        const map = new Map(((data as Product[]) || []).map((p) => [p.id, p]));
        setProducts(ids.map((id) => map.get(id)).filter(Boolean) as Product[]);
      });
  }, [ids]);

  if (!products.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="mb-3">История просмотров пуста</p>
        <Link to="/catalog" className="text-[#2563EB] hover:underline">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
