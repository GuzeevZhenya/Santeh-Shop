import { useEffect, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
import { useViewHistory } from '@/lib/viewHistory';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

const TOTAL = 4;
const FROM_HISTORY_CATS = 2;

type Props = { product: Product };

/** 2 из часто просматриваемых категорий + остальные похожие на текущий */
export default function ProductRecommendations({ product }: Props) {
  const { ids } = useViewHistory();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: all } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('id', product.id)
        .limit(80);

      if (cancelled || !all?.length) return;
      const catalog = all as Product[];
      const used = new Set<string>();
      const picked: Product[] = [];

      const add = (p: Product) => {
        if (used.has(p.id) || picked.length >= TOTAL) return;
        used.add(p.id);
        picked.push(p);
      };

      const histIds = ids.filter((id) => id !== product.id);
      let topCats: string[] = [];
      if (histIds.length) {
        const { data: viewed } = await supabase
          .from('products')
          .select('id, category_id')
          .in('id', histIds.slice(0, 20));
        const counts = new Map<string, number>();
        (viewed || []).forEach((row) => {
          const cid = row.category_id as string | null;
          if (!cid || cid === product.category_id) return;
          const rank = histIds.indexOf(row.id as string);
          const weight = rank < 0 ? 1 : histIds.length - rank;
          counts.set(cid, (counts.get(cid) || 0) + weight);
        });
        topCats = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([cid]) => cid)
          .slice(0, 3);
      }

      for (const p of catalog) {
        if (picked.length >= FROM_HISTORY_CATS) break;
        if (p.category_id && topCats.includes(p.category_id)) add(p);
      }

      for (const p of catalog) {
        if (picked.length >= TOTAL) break;
        if (p.category_id === product.category_id) add(p);
      }

      if (product.brand) {
        const b = product.brand.toLowerCase();
        for (const p of catalog) {
          if (picked.length >= TOTAL) break;
          if (p.brand?.toLowerCase() === b) add(p);
        }
      }

      for (const p of catalog) {
        if (picked.length >= TOTAL) break;
        add(p);
      }

      if (!cancelled) setItems(picked);
    })();

    return () => {
      cancelled = true;
    };
  }, [product.id, product.category_id, product.brand, ids]);

  if (!items.length) return null;

  return (
    <section className="mt-14 pt-10 border-t border-slate-100">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-[#2563EB] font-semibold mb-1">
          Подборка для вас
        </p>
        <h2 className="text-2xl font-bold text-[#0F172A]">Вам может подойти</h2>
        <p className="text-sm text-slate-500 mt-1">
          С учётом просмотренных категорий и похожих товаров
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
