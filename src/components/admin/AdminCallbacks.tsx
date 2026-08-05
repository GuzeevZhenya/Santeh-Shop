import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Callback } from '@/types/database';

export default function AdminCallbacks() {
  const [items, setItems] = useState<Callback[]>([]);

  const load = () =>
    supabase
      .from('callbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Callback[]) || []));

  useEffect(() => {
    load();
  }, []);

  const markDone = async (id: string) => {
    await supabase.from('callbacks').update({ status: 'done' }).eq('id', id);
    load();
  };

  return (
    <div className="space-y-3">
      {items.map((c) => (
        <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {c.name || 'Без имени'}{' '}
              <a href={`tel:${c.phone}`} className="text-[#2563EB]">
                {c.phone}
              </a>
            </p>
            {c.purpose && <p className="text-sm text-slate-500">Цель: {c.purpose}</p>}
            <p className="text-xs text-slate-400 mt-1">
              {new Date(c.created_at).toLocaleString('ru-RU')}
            </p>
          </div>
          {c.status === 'done' ? (
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">Обработан</span>
          ) : (
            <button
              type="button"
              onClick={() => markDone(c.id)}
              className="text-xs px-3 py-1 rounded-full bg-blue-50 text-[#2563EB]"
            >
              Отметить
            </button>
          )}
        </div>
      ))}
      {!items.length && <p className="text-slate-400 text-center py-12">Заявок пока нет</p>}
    </div>
  );
}
