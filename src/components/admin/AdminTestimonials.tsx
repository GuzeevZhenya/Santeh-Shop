import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Testimonial } from '@/types/database';

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  const load = () =>
    supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Testimonial[]) || []));

  useEffect(() => {
    load();
  }, []);

  const setApproved = async (id: string, approved: boolean) => {
    await supabase.from('testimonials').update({ approved }).eq('id', id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  };

  if (!items.length) {
    return <p className="text-slate-400 text-center py-16">Отзывов пока нет.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((t) => (
        <div key={t.id} className="bg-white border rounded-xl p-4">
          <div className="flex justify-between gap-3 mb-2">
            <p className="font-medium">
              {t.author_name} · {t.rating}/5
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${t.approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'}`}>
              {t.approved ? 'Одобрен' : 'На модерации'}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">{t.text}</p>
          <div className="flex gap-2">
            {!t.approved && (
              <button type="button" onClick={() => setApproved(t.id, true)} className="text-xs px-3 py-1 rounded-lg bg-[#2563EB] text-white">
                Одобрить
              </button>
            )}
            {t.approved && (
              <button type="button" onClick={() => setApproved(t.id, false)} className="text-xs px-3 py-1 rounded-lg border">
                Снять
              </button>
            )}
            <button type="button" onClick={() => remove(t.id)} className="text-xs px-3 py-1 rounded-lg text-red-500 border border-red-100">
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
