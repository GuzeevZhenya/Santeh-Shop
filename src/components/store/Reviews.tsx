import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConsentCheckbox from '@/components/store/ConsentCheckbox';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { DEFAULT_POLICY_VERSION, logConsent } from '@/lib/siteSettings';
import type { Review } from '@/types/database';

export default function Reviews({ productId }: { productId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Review[]) || []));
  };

  useEffect(load, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) return;
    if (!consent) {
      setError('Нужно согласие на обработку данных');
      return;
    }
    setSending(true);
    setError('');
    await supabase.from('reviews').insert({
      product_id: productId,
      author_name: author,
      author_id: isAuthenticated ? user?.id : null,
      rating,
      text,
    });
    try {
      await logConsent({
        source: 'review',
        policy_version: DEFAULT_POLICY_VERSION,
        meta: { product_id: productId, author_name: author },
      });
    } catch {
      /* non-blocking */
    }
    setText('');
    setConsent(false);
    setSending(false);
    load();
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-[#0F172A] mb-4">Отзывы ({items.length})</h2>
      <form onSubmit={submit} className="bg-[#F8FAFC] rounded-xl p-4 mb-6 space-y-3">
        <Input
          placeholder="Ваше имя"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star
                className={`w-5 h-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Ваш отзыв"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        <ConsentCheckbox checked={consent} onChange={setConsent} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={sending}>
          Отправить отзыв
        </Button>
      </form>
      <div className="space-y-4">
        {items.map((r) => (
          <div key={r.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-[#0F172A]">{r.author_name}</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
            {r.text && <p className="text-sm text-slate-600">{r.text}</p>}
          </div>
        ))}
        {!items.length && <p className="text-slate-400 text-sm">Отзывов пока нет — будьте первым</p>}
      </div>
    </div>
  );
}
