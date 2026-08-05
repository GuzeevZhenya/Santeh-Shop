import { useEffect, useState } from 'react';
import { Star, Quote, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConsentCheckbox from '@/components/store/ConsentCheckbox';
import { supabase } from '@/lib/supabase';
import { DEFAULT_POLICY_VERSION, logConsent } from '@/lib/siteSettings';
import type { Testimonial } from '@/types/database';

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState({ author_name: '', rating: 5, text: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Testimonial[]) || []));
  };

  useEffect(load, []);

  const avg = items.length
    ? items.reduce((s, t) => s + (t.rating || 0), 0) / items.length
    : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.text.trim()) return;
    if (!consent) {
      setError('Нужно согласие на обработку данных');
      return;
    }
    setSubmitting(true);
    setError('');
    await supabase.from('testimonials').insert({
      author_name: form.author_name,
      rating: form.rating,
      text: form.text,
      approved: false,
    });
    try {
      await logConsent({
        source: 'testimonial',
        policy_version: DEFAULT_POLICY_VERSION,
        meta: { author_name: form.author_name },
      });
    } catch {
      /* non-blocking */
    }
    setDone(true);
    setForm({ author_name: '', rating: 5, text: '' });
    setConsent(false);
    setSubmitting(false);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Отзывы о магазине</h1>
      <div className="flex items-center gap-2 mb-8 text-slate-500">
        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        <span className="font-semibold text-[#0F172A]">{avg.toFixed(1)}</span>
        <span>· {items.length} отзывов</span>
      </div>

      <form onSubmit={submit} className="border border-slate-200 rounded-2xl p-6 mb-10 space-y-4">
        <h2 className="font-semibold text-[#0F172A]">Оставить отзыв</h2>
        <Input
          placeholder="Ваше имя"
          value={form.author_name}
          onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
          required
        />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, rating: n }))}>
              <Star
                className={`w-6 h-6 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          rows={4}
          required
          placeholder="Ваш отзыв"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        <ConsentCheckbox checked={consent} onChange={setConsent} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {done && (
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Отзыв появится после модерации
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          <Send className="w-4 h-4" /> Отправить
        </Button>
      </form>

      <div className="space-y-4">
        {items.map((t) => (
          <div key={t.id} className="border border-slate-200 rounded-xl p-5">
            <Quote className="w-5 h-5 text-[#2563EB]/40 mb-2" />
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{t.author_name}</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-3.5 h-3.5 ${n <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600">{t.text}</p>
          </div>
        ))}
        {!items.length && <p className="text-center text-slate-400 py-8">Отзывов пока нет</p>}
      </div>
    </div>
  );
}
