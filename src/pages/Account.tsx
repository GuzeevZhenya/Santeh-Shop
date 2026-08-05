import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Package, TrendingUp, Percent, LogOut, ShoppingBag, Clock, Heart, MessageSquare,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/lib/AuthContext';
import { computeDiscount, promoCode, STATUS } from '@/lib/loyalty';
import ErrorState from '@/components/store/ErrorState';
import AccountFavorites from '@/components/account/AccountFavorites';
import AccountHistory from '@/components/account/AccountHistory';
import AccountReviews from '@/components/account/AccountReviews';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types/database';

const TABS = [
  { key: 'orders', label: 'Заказы', icon: Package },
  { key: 'favorites', label: 'Избранное', icon: Heart },
  { key: 'history', label: 'Просмотренные', icon: Clock },
  { key: 'reviews', label: 'Мои отзывы', icon: MessageSquare },
] as const;

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('orders');

  const load = () => {
    if (!user?.id) return;
    setLoading(true);
    setError(false);
    supabase
      .from('orders')
      .select('*')
      .eq('customer_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        if (err) setError(true);
        else setOrders((data as Order[]) || []);
        setLoading(false);
      });
  };

  useEffect(load, [user?.id]);

  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total || 0), 0);
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const discount = computeDiscount(totalSpent);
  const code = promoCode(discount.tier, discount.percent);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-[#60A5FA]" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user?.full_name || user?.email}</h1>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Выйти
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={ShoppingBag} label="Заказов" value={orders.length} />
        <Stat icon={Clock} label="Выполнено" value={completedCount} />
        <Stat icon={TrendingUp} label="Потрачено" value={formatPrice(totalSpent)} />
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5" />
            <span className="text-sm text-blue-100">Скидка</span>
          </div>
          <p className="text-3xl font-bold">{discount.percent}%</p>
          <p className="text-sm text-blue-100">Уровень «{discount.tier}»</p>
        </div>
      </div>

      {discount.percent > 0 && (
        <div className="bg-[#F8FAFC] border border-dashed border-[#2563EB] rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#0F172A] mb-1">Ваш персональный промо-код</p>
            <p className="text-sm text-slate-500">Применяется автоматически при оформлении</p>
          </div>
          <span className="px-6 py-3 bg-white border-2 border-[#2563EB] rounded-lg font-mono font-bold text-[#2563EB] text-lg tracking-wider">
            {code}
          </span>
        </div>
      )}
      {discount.next && (
        <p className="text-sm text-slate-500 mb-8 text-center">
          До уровня «{discount.next.tier}» осталось {formatPrice(discount.next.diff)}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 -mb-px ${tab === t.key ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'orders' &&
        (error ? (
          <ErrorState onRetry={load} />
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-[#F8FAFC] animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="mb-4">У вас пока нет заказов</p>
            <Link
              to="/catalog"
              className="inline-block bg-[#2563EB] text-white font-medium px-6 py-3 rounded-lg"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const st = STATUS[o.status] || STATUS.new;
              const date = new Date(o.created_at).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });
              return (
                <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {o.order_number && (
                        <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded">
                          {o.order_number}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.cls}`}>
                        {st.label}
                      </span>
                      <span className="text-sm text-slate-400">от {date}</span>
                    </div>
                    <span className="font-bold text-[#0F172A]">{formatPrice(o.total)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {(o.items || []).map((it, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        {it.image_url && (
                          <Image src={it.image_url} alt="" className="w-9 h-9 rounded object-cover" />
                        )}
                        <span className="flex-1 text-slate-600">
                          {it.name} ×{it.qty}
                        </span>
                        <span className="text-slate-500">{formatPrice(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      {tab === 'favorites' && <AccountFavorites />}
      {tab === 'history' && <AccountHistory />}
      {tab === 'reviews' && <AccountReviews />}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2 text-slate-400">
        <Icon className="w-5 h-5" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}
