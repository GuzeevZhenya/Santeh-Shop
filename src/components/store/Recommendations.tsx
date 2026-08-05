import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

export default function Recommendations() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(4)
      .then(({ data }) => setItems((data as Product[]) || []));
  }, []);

  if (!items.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Рекомендуем</h2>
        <Link to="/catalog" className="flex items-center gap-1 text-[#2563EB] text-sm font-medium">
          Смотреть все <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
