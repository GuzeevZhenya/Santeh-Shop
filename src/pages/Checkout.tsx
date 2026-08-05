import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check, Loader2, ArrowLeft, Percent, Truck, Store, CreditCard, Banknote,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/components/store/CartContext';
import { computeDiscount, type LoyaltyTier } from '@/lib/loyalty';
import { formatPrice } from '@/lib/utils';
import { DEFAULT_POLICY_VERSION } from '@/lib/siteSettings';
import ConsentCheckbox from '@/components/store/ConsentCheckbox';
import type { Order } from '@/types/database';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    comment: '',
  });
  const [consent, setConsent] = useState(false);
  const [payment, setPayment] = useState<'cash' | 'card'>('cash');
  const [delivery, setDelivery] = useState<'delivery' | 'pickup'>('delivery');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [discount, setDiscount] = useState<{ percent: number; tier: LoyaltyTier }>({
    percent: 0,
    tier: 'Старт',
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    supabase
      .from('orders')
      .select('total,status')
      .eq('customer_user_id', user.id)
      .then(({ data }) => {
        const spent = (data || [])
          .filter((o) => o.status !== 'cancelled')
          .reduce((s, o) => s + Number(o.total || 0), 0);
        setDiscount(computeDiscount(spent));
      });
  }, [isAuthenticated, user?.id]);

  const discountedTotal =
    discount.percent > 0 ? Math.round(total * (1 - discount.percent / 100)) : total;
  const saved = total - discountedTotal;
  const deliveryCost = delivery === 'delivery' && discountedTotal < 150 ? 20 : 0;
  const finalTotal = discountedTotal + deliveryCost;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone) {
      setError('Заполните имя и телефон');
      return;
    }
    if (delivery === 'delivery' && !form.address) {
      setError('Укажите адрес доставки');
      return;
    }
    if (!consent) {
      setError('Необходимо согласие с офертой и политикой');
      return;
    }
    setSubmitting(true);
    setError('');
    const payload = {
      customer_name: form.customer_name,
      phone: form.phone,
      address: delivery === 'pickup' ? 'Самовывоз' : form.address,
      comment: form.comment,
      customer_email: form.email || null,
      items: items.map((i) => ({
        product_id: i.id,
        name: i.variant ? `${i.name} (${i.variant})` : i.name,
        price: i.price,
        qty: i.qty,
        image_url: i.image_url,
      })),
      total: finalTotal,
      payment_method: payment,
      delivery_method: delivery,
      delivery_cost: deliveryCost,
      consent: true,
      policy_version: DEFAULT_POLICY_VERSION,
    };

    const { data, error: err } = await supabase.rpc('create_order', { payload });
    setSubmitting(false);
    if (err) {
      setError('Не удалось отправить заявку. Проверьте подключение к Supabase (миграции 001–002).');
      return;
    }
    const order = data as Order;
    clear();
    setOrderNumber(order?.order_number || '');
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-3">Заявка отправлена!</h1>
        {orderNumber && (
          <p className="text-sm font-mono text-[#2563EB] mb-3">Номер заявки: {orderNumber}</p>
        )}
        <p className="text-slate-600 mb-8">
          Спасибо за заказ. Менеджер свяжется для подтверждения.
        </p>
        <Link
          to={isAuthenticated ? '/account' : '/'}
          className="inline-block bg-[#2563EB] text-white font-medium px-7 py-3.5 rounded-lg"
        >
          {isAuthenticated ? 'Мои заказы' : 'На главную'}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Корзина пуста</h1>
        <Link to="/catalog" className="text-[#2563EB] hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const inputCls =
    'w-full px-4 py-3.5 bg-transparent border-b-2 border-slate-200 focus:border-[#2563EB] outline-none text-lg';
  const optCls = 'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        type="button"
        onClick={() => navigate('/cart')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-[#2563EB] mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Назад в корзину
      </button>
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Оформление заявки</h1>
      <p className="text-slate-500 mb-8">Менеджер перезвонит для подтверждения.</p>

      <div className="bg-[#F8FAFC] rounded-xl p-5 mb-6">
        {items.map((i) => (
          <div key={i.key} className="flex justify-between py-2 text-sm">
            <span className="text-slate-600">
              {i.name} ×{i.qty}
            </span>
            <span className="font-medium">{formatPrice(i.price * i.qty)}</span>
          </div>
        ))}
        {discount.percent > 0 && (
          <div className="flex justify-between py-2 text-sm text-[#2563EB]">
            <span className="flex items-center gap-1.5">
              <Percent className="w-4 h-4" /> Скидка «{discount.tier}» ({discount.percent}%)
            </span>
            <span>−{formatPrice(saved)}</span>
          </div>
        )}
        {delivery === 'delivery' && (
          <div className="flex justify-between py-2 text-sm text-slate-600">
            <span>Доставка</span>
            <span>{deliveryCost > 0 ? formatPrice(deliveryCost) : 'бесплатно'}</span>
          </div>
        )}
        <div className="border-t border-slate-200 mt-2 pt-3 flex justify-between font-bold">
          <span>Итого</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <label className={`${optCls} ${delivery === 'delivery' ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-slate-200'}`}>
            <input type="radio" className="sr-only" checked={delivery === 'delivery'} onChange={() => setDelivery('delivery')} />
            <Truck className="w-5 h-5 text-[#2563EB]" />
            <div>
              <p className="font-medium text-sm">Доставка</p>
              <p className="text-xs text-slate-500">бесплатно от 150 руб.</p>
            </div>
          </label>
          <label className={`${optCls} ${delivery === 'pickup' ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-slate-200'}`}>
            <input type="radio" className="sr-only" checked={delivery === 'pickup'} onChange={() => setDelivery('pickup')} />
            <Store className="w-5 h-5 text-[#2563EB]" />
            <div>
              <p className="font-medium text-sm">Самовывоз</p>
              <p className="text-xs text-slate-500">ул. Барташова 1</p>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={`${optCls} ${payment === 'cash' ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-slate-200'}`}>
            <input type="radio" className="sr-only" checked={payment === 'cash'} onChange={() => setPayment('cash')} />
            <Banknote className="w-5 h-5 text-[#2563EB]" />
            <div>
              <p className="font-medium text-sm">Наличными</p>
              <p className="text-xs text-slate-500">при получении</p>
            </div>
          </label>
          <label className={`${optCls} ${payment === 'card' ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-slate-200'}`}>
            <input type="radio" className="sr-only" checked={payment === 'card'} onChange={() => setPayment('card')} />
            <CreditCard className="w-5 h-5 text-[#2563EB]" />
            <div>
              <p className="font-medium text-sm">Картой</p>
              <p className="text-xs text-slate-500">при получении</p>
            </div>
          </label>
        </div>

        <input className={inputCls} placeholder="Имя *" value={form.customer_name} onChange={set('customer_name')} />
        <input className={inputCls} placeholder="Телефон *" value={form.phone} onChange={set('phone')} />
        <input className={inputCls} placeholder="Email (необязательно)" value={form.email} onChange={set('email')} />
        {delivery === 'delivery' && (
          <input className={inputCls} placeholder="Адрес доставки *" value={form.address} onChange={set('address')} />
        )}
        <textarea className={inputCls + ' resize-none'} rows={3} placeholder="Комментарий" value={form.comment} onChange={set('comment')} />

        <ConsentCheckbox checked={consent} onChange={setConsent} includeOffer />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-medium px-6 py-4 rounded-lg text-lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Отправка...
            </>
          ) : (
            `Отправить заявку — ${formatPrice(finalTotal)}`
          )}
        </button>
      </form>
    </div>
  );
}
