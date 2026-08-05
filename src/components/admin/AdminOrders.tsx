import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { STATUS } from '@/lib/loyalty';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/database';

const FILTERS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новый' },
  { key: 'processing', label: 'В обработке' },
  { key: 'completed', label: 'Выполнен' },
  { key: 'cancelled', label: 'Отменён' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState<Record<string, string>>({});

  const load = () => {
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = (data as Order[]) || [];
        setOrders(list);
        const map: Record<string, string> = {};
        list.forEach((o) => {
          map[o.id] = o.admin_comment || '';
        });
        setAdminComment(map);
      });
  };

  useEffect(load, []);

  const setStatus = async (id: string, status: OrderStatus) => {
    await supabase.rpc('update_order_status', { p_order_id: id, p_new_status: status });
    load();
  };

  const saveComment = async (id: string) => {
    await supabase.from('orders').update({ admin_comment: adminComment[id] || null }).eq('id', id);
    load();
  };

  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const groups = shown.reduce<Record<string, Order[]>>((acc, o) => {
    const key = new Date(o.created_at)
      .toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      .toUpperCase();
    (acc[key] ||= []).push(o);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === f.key ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {Object.entries(groups).map(([date, list]) => (
        <div key={date} className="mb-8">
          <h3 className="font-bold text-[#0F172A] mb-1">
            {date}{' '}
            <span className="text-slate-400 font-normal text-sm">{list.length} заказ(ов)</span>
          </h3>
          <div className="space-y-3 mt-3">
            {list.map((o) => {
              const st = STATUS[o.status] || STATUS.new;
              const open = openId === o.id;
              return (
                <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setOpenId(open ? null : o.id)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded">
                            {o.order_number}
                          </span>
                          <span className="font-semibold">{o.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {o.phone} · {(o.items || []).length} тов.
                          {o.customer_email ? ` · ${o.customer_email}` : ''}
                        </p>
                      </div>
                      <p className="font-bold text-lg">{formatPrice(o.total)}</p>
                    </div>
                  </button>

                  {open && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-sm">
                      <p>
                        <span className="text-slate-400">Адрес: </span>
                        {o.address || '—'}
                      </p>
                      <p>
                        <span className="text-slate-400">Email: </span>
                        {o.customer_email || '—'}
                      </p>
                      <p>
                        <span className="text-slate-400">Комментарий клиента: </span>
                        {o.comment || '—'}
                      </p>
                      <p>
                        <span className="text-slate-400">Доставка / оплата: </span>
                        {o.delivery_method} / {o.payment_method} · доставка {formatPrice(o.delivery_cost)}
                      </p>
                      {o.consent_at && (
                        <p className="text-xs text-slate-400">
                          Согласие ПДн: {new Date(o.consent_at).toLocaleString('ru-RU')} · v
                          {o.policy_version}
                        </p>
                      )}
                      <ul className="space-y-1">
                        {(o.items || []).map((it, i) => (
                          <li key={i} className="flex justify-between">
                            <span>
                              {it.name} ×{it.qty}
                            </span>
                            <span>{formatPrice(it.price * it.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <div>
                        <label className="text-slate-400 text-xs">Внутренний комментарий</label>
                        <textarea
                          value={adminComment[o.id] || ''}
                          onChange={(e) =>
                            setAdminComment((m) => ({ ...m, [o.id]: e.target.value }))
                          }
                          rows={2}
                          className="w-full mt-1 rounded-lg border border-slate-200 p-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => saveComment(o.id)}
                          className="mt-2 text-xs text-[#2563EB] hover:underline"
                        >
                          Сохранить комментарий
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['new', 'processing', 'completed', 'cancelled'] as OrderStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(o.id, s)}
                        className={`text-xs px-3 py-1 rounded-full border ${o.status === s ? 'border-[#2563EB] text-[#2563EB]' : 'border-slate-200 text-slate-500'}`}
                      >
                        {STATUS[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {!shown.length && <p className="text-slate-400 text-center py-12">Заказов нет</p>}
    </div>
  );
}
