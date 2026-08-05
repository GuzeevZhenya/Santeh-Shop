import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, GitCompare, ShoppingCart, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCompare } from '@/lib/compare';
import { useCart } from '@/components/store/CartContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/database';

export default function Compare() {
  const { ids, remove, clear } = useCompare();
  const { add } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('products')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        const map = new Map(((data as Product[]) || []).map((p) => [p.id, p]));
        setProducts(ids.map((id) => map.get(id)).filter(Boolean) as Product[]);
        setLoading(false);
      });
  }, [ids]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <GitCompare className="w-14 h-14 mx-auto mb-4 text-slate-200" />
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Список сравнения пуст</h1>
        <p className="text-slate-500 mb-6">Добавляйте до 4 товаров с карточки товара.</p>
        <Link to="/catalog" className="inline-block bg-[#2563EB] text-white font-medium px-6 py-3 rounded-lg">
          В каталог
        </Link>
      </div>
    );
  }

  const rows = [
    { label: 'Цена', render: (p: Product) => <span className="font-bold">{formatPrice(p.price)}</span> },
    {
      label: 'Старая цена',
      render: (p: Product) =>
        p.old_price ? (
          <span className="text-slate-400 line-through">{formatPrice(p.old_price)}</span>
        ) : (
          '—'
        ),
    },
    { label: 'Бренд', render: (p: Product) => p.brand || '—' },
    {
      label: 'Описание',
      render: (p: Product) => (
        <span className="text-sm text-slate-600 line-clamp-4">{p.description || '—'}</span>
      ),
    },
    {
      label: 'Характеристики',
      render: (p: Product) => (
        <span className="text-sm text-slate-600 whitespace-pre-line">{p.specs || '—'}</span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A]">Сравнение</h1>
        <button type="button" onClick={clear} className="text-sm text-slate-500 hover:text-red-500">
          Очистить
        </button>
      </div>
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th className="w-40" />
            {products.map((p) => (
              <th key={p.id} className="p-4 align-top">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="absolute -top-2 -right-2 p-1 bg-white border rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="aspect-square bg-[#F8FAFC] rounded-xl mb-3 overflow-hidden">
                    <Image src={p.image_url} alt={p.name} fittingType="fill" />
                  </div>
                  <p className="text-sm font-medium text-[#0F172A] mb-2">{p.name}</p>
                  <button
                    type="button"
                    onClick={() => add(p)}
                    className="inline-flex items-center gap-1 text-xs bg-[#2563EB] text-white px-3 py-1.5 rounded-lg"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> В корзину
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.label} className={idx % 2 ? 'bg-[#F8FAFC]' : 'bg-white'}>
              <td className="p-3 text-sm text-slate-500 font-medium">{row.label}</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-sm text-center">
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
