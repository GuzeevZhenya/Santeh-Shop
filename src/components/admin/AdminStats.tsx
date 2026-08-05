import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Order, Product } from '@/types/database';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444'];

export default function AdminStats() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState(0);
  const [users, setUsers] = useState(0);

  useEffect(() => {
    supabase.from('orders').select('*').then(({ data }) => setOrders((data as Order[]) || []));
    supabase.from('products').select('*').then(({ data }) => setProducts((data as Product[]) || []));
    supabase.from('categories').select('id', { count: 'exact', head: true }).then(({ count }) => setCats(count || 0));
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => setUsers(count || 0));
  }, []);

  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total || 0), 0);
  const avgCheck = orders.length ? Math.round(revenue / orders.length) : 0;
  const byStatus = ['new', 'processing', 'completed', 'cancelled'].map((st) => ({
    name: st === 'new' ? 'Новые' : st === 'processing' ? 'В обработке' : st === 'completed' ? 'Выполнены' : 'Отменены',
    value: orders.filter((o) => o.status === st).length,
  }));

  const months = ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
  const revenueByMonth = months.map((m, i) => ({
    name: m,
    total: orders
      .filter((o) => o.status !== 'cancelled' && new Date(o.created_at).getMonth() === i)
      .reduce((s, o) => s + Number(o.total || 0), 0),
  })).filter((_, i) => {
    const now = new Date().getMonth();
    return i >= now - 5 && i <= now;
  });

  const exportCsv = () => {
    const rows = [
      ['number', 'name', 'phone', 'total', 'status', 'date'],
      ...orders.map((o) => [
        o.order_number,
        o.customer_name,
        o.phone,
        o.total,
        o.status,
        o.created_at,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
  };

  const recent = [...orders]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi label="Заказов" value={orders.length} />
        <Kpi label="Выручка" value={formatPrice(revenue)} />
        <Kpi label="Товаров" value={products.length} />
        <Kpi label="Категории" value={cats} />
        <Kpi label="Пользователей" value={users} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded-lg text-sm"
        >
          <Download className="w-4 h-4" /> Экспорт заказов (CSV)
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-semibold mb-4">Выручка по месяцам</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByMonth}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Заказы по статусам</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Доля статусов</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Последние заказы</h3>
          <div className="space-y-3">
            {recent.map((o) => (
              <div key={o.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-slate-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(o.total)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold mb-2">Средние показатели</h3>
          <Row label="Средний чек" value={formatPrice(avgCheck)} />
          <Row
            label="Выполнено"
            value={`${orders.filter((o) => o.status === 'completed').length} из ${orders.length}`}
          />
          <Row label="Активных товаров" value={products.filter((p) => p.is_active).length} />
          <Row label="Акций дня" value={products.filter((p) => p.is_deal_of_day).length} />
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
