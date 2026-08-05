import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingCart, ArrowLeft, Check, Truck, Shield, RotateCcw, Heart, GitCompare, Star,
} from 'lucide-react';
import ProductGallery from '@/components/store/ProductGallery';
import ProductRecommendations from '@/components/store/ProductRecommendations';
import Reviews from '@/components/store/Reviews';
import { useCart } from '@/components/store/CartContext';
import { useFavorites } from '@/lib/favorites';
import { useCompare } from '@/lib/compare';
import { useViewHistory } from '@/lib/viewHistory';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/database';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const { isFav, toggle } = useFavorites();
  const { isCompared, toggle: toggleCompare } = useCompare();
  const { push } = useViewHistory();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err || !data) setError(true);
        else {
          const p = data as Product;
          setProduct(p);
          push(p.id);
          const sel: Record<string, string> = {};
          (p.variants || []).forEach((v) => {
            if (v.options?.length) sel[v.name] = v.options[0];
          });
          setSelected(sel);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-slate-100 rounded animate-pulse" />
            <div className="h-12 w-40 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 mb-4">Товар не найден</p>
        <Link to="/catalog" className="text-[#2563EB] hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const gallery = product.gallery?.length
    ? product.gallery
    : product.image_url
      ? [product.image_url]
      : [];
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : 0;
  const variantText = (product.variants || [])
    .map((v) => `${v.name}: ${selected[v.name]}`)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="bg-gradient-to-b from-[#F8FAFC] via-white to-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => history.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#2563EB] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <ProductGallery images={gallery} alt={product.name} />

          <div className="lg:pt-2">
            {product.brand && (
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium mb-3">
                {product.brand}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-[#0F172A]">{product.rating?.toFixed(1) || '5.0'}</span>
              <span>· рейтинг покупателей</span>
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-8 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <span className="text-4xl font-bold text-[#2563EB]">{formatPrice(product.price)}</span>
              {product.old_price && product.old_price > product.price && (
                <>
                  <span className="text-lg text-slate-400 line-through mb-1">
                    {formatPrice(product.old_price)}
                  </span>
                  <span className="mb-1.5 bg-[#2563EB] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    −{discount}%
                  </span>
                </>
              )}
            </div>

            {(product.variants || []).map((v) => (
              <div key={v.name} className="mb-5">
                <p className="text-sm font-medium text-slate-700 mb-2">{v.name}</p>
                <div className="flex flex-wrap gap-2">
                  {v.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelected((s) => ({ ...s, [v.name]: opt }))}
                      className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                        selected[v.name] === opt
                          ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-medium'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                type="button"
                onClick={() => {
                  add(product, variantText);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1500);
                }}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
              >
                {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {added ? 'Добавлено' : 'В корзину'}
              </button>
              <button
                type="button"
                onClick={() => toggle(product.id)}
                className={`p-4 rounded-xl border bg-white transition-colors ${
                  isFav(product.id)
                    ? 'border-red-200 text-red-500'
                    : 'border-slate-200 text-slate-400 hover:text-red-400'
                }`}
                aria-label="Избранное"
              >
                <Heart className={`w-5 h-5 ${isFav(product.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(product.id)}
                className={`p-4 rounded-xl border bg-white transition-colors ${
                  isCompared(product.id)
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-slate-200 text-slate-400 hover:text-[#2563EB]'
                }`}
                aria-label="Сравнить"
              >
                <GitCompare className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { icon: Truck, t: 'Доставка', d: 'от 150 руб. — 0' },
                { icon: Shield, t: 'Гарантия', d: 'от производителя' },
                { icon: RotateCcw, t: 'Возврат', d: '14 дней' },
              ].map(({ icon: Icon, t, d }) => (
                <div
                  key={t}
                  className="rounded-xl bg-white border border-slate-100 p-3 text-center"
                >
                  <Icon className="w-5 h-5 text-[#2563EB] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-[#0F172A]">{t}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d}</p>
                </div>
              ))}
            </div>

            {product.description && (
              <div className="mb-6 rounded-2xl bg-white border border-slate-100 p-5">
                <h2 className="font-semibold text-[#0F172A] mb-2">Описание</h2>
                <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
            {product.specs && (
              <div className="rounded-2xl bg-white border border-slate-100 p-5">
                <h2 className="font-semibold text-[#0F172A] mb-2">Характеристики</h2>
                <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">
                  {product.specs}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <Reviews productId={product.id} />
        </div>

        <ProductRecommendations product={product} />
      </div>
    </div>
  );
}
