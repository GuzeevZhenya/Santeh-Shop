import { Link } from 'react-router-dom';
import { Heart, GitCompare, ShoppingCart } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCart } from '@/components/store/CartContext';
import { useFavorites } from '@/lib/favorites';
import { useCompare } from '@/lib/compare';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/database';

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { isFav, toggle } = useFavorites();
  const { isCompared, toggle: toggleCompare } = useCompare();
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : 0;

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] bg-[#F8FAFC]">
        <Image src={product.image_url} alt={product.name} fittingType="fill" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#2563EB] text-white text-xs font-bold px-2 py-1 rounded">
            −{discount}%
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white"
        >
          <Heart
            className={`w-4 h-4 ${isFav(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
          />
        </button>
      </Link>
      <div className="p-3">
        {product.brand && (
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">{product.brand}</p>
        )}
        <Link
          to={`/product/${product.id}`}
          className="font-medium text-sm text-[#0F172A] line-clamp-2 hover:text-[#2563EB] min-h-[2.5rem]"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="font-bold text-[#0F172A]">{formatPrice(product.price)}</p>
            {product.old_price && product.old_price > product.price && (
              <p className="text-xs text-slate-400 line-through">{formatPrice(product.old_price)}</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => toggleCompare(product.id)}
              className={`p-2 rounded-lg border ${isCompared(product.id) ? 'border-[#2563EB] text-[#2563EB]' : 'border-slate-200 text-slate-400'}`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => add(product)}
              className="p-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
