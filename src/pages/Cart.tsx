import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCart } from '@/components/store/CartContext';
import { formatPrice } from '@/lib/utils';

export default function Cart() {
  const { items, remove, updateQty, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 mx-auto bg-[#F8FAFC] rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Корзина пуста</h1>
        <p className="text-slate-500 mb-8">Добавьте товары из каталога, чтобы оформить заявку</p>
        <Link
          to="/catalog"
          className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-7 py-3.5 rounded-lg"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Корзина ({count})</h1>
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4"
          >
            <Link
              to={`/product/${item.id}`}
              className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-[#F8FAFC]"
            >
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} fittingType="fill" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ShoppingCart className="w-8 h-8" />
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${item.id}`}
                className="font-medium text-[#1E293B] hover:text-[#2563EB] line-clamp-2"
              >
                {item.name}
              </Link>
              {item.variant && <p className="text-xs text-slate-500 mt-0.5">{item.variant}</p>}
              <p className="text-lg font-bold text-[#0F172A] mt-1">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => updateQty(item.key, item.qty - 1)}
                className="p-2 hover:text-[#2563EB]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">{item.qty}</span>
              <button
                type="button"
                onClick={() => updateQty(item.key, item.qty + 1)}
                className="p-2 hover:text-[#2563EB]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="w-28 text-right font-bold text-[#0F172A] hidden sm:block">
              {formatPrice(item.price * item.qty)}
            </p>
            <button
              type="button"
              onClick={() => remove(item.key)}
              className="p-2 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8FAFC] rounded-xl p-6">
        <div>
          <p className="text-slate-500 text-sm">Итого к оплате</p>
          <p className="text-3xl font-bold text-[#0F172A]">{formatPrice(total)}</p>
        </div>
        <Link
          to="/checkout"
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-8 py-3.5 rounded-lg"
        >
          Оформить заявку <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
