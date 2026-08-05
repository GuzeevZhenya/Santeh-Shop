import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

type FavCtx = {
  ids: string[];
  loading: boolean;
  isFav: (id: string) => boolean;
  toggle: (productId: string) => Promise<void>;
};

const Ctx = createContext<FavCtx | null>(null);

function lsKey(uid?: string | null) {
  return `aqua_favorites_${uid || 'anon'}`;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (isAuthenticated && user?.id) {
        const { data } = await supabase.from('favorites').select('product_id').eq('user_id', user.id);
        if (!cancelled) setIds((data || []).map((r) => r.product_id));
      } else {
        try {
          const raw = localStorage.getItem(lsKey());
          if (!cancelled) setIds(raw ? JSON.parse(raw) : []);
        } catch {
          if (!cancelled) setIds([]);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem(lsKey(), JSON.stringify(ids));
  }, [ids, isAuthenticated]);

  const api = useMemo<FavCtx>(() => {
    const isFav = (id: string) => ids.includes(id);
    const toggle = async (productId: string) => {
      if (isAuthenticated && user?.id) {
        if (ids.includes(productId)) {
          await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
          setIds((prev) => prev.filter((x) => x !== productId));
        } else {
          await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
          setIds((prev) => [...prev, productId]);
        }
      } else {
        setIds((prev) =>
          prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId],
        );
      }
    };
    return { ids, loading, isFav, toggle };
  }, [ids, loading, isAuthenticated, user?.id]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFavorites outside provider');
  return ctx;
}
