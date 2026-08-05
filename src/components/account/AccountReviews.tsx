import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types/database';

export default function AccountReviews() {
  const { user } = useAuth();
  const [items, setItems] = useState<Review[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('reviews')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Review[]) || []));
  }, [user?.id]);

  if (!items.length) {
    return <p className="text-center py-12 text-slate-400">Вы ещё не оставляли отзывы</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="border border-slate-200 rounded-xl p-4">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-4 h-4 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
