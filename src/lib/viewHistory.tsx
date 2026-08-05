import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

const MAX = 20;

type HistCtx = {
  ids: string[];
  push: (id: string) => void;
};

const Ctx = createContext<HistCtx | null>(null);

function key(uid?: string | null) {
  return `aqua_history_${uid || 'anon'}`;
}

export function ViewHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(key(user?.id)) || '[]'));
    } catch {
      setIds([]);
    }
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(key(user?.id), JSON.stringify(ids));
  }, [ids, user?.id]);

  const api = useMemo<HistCtx>(
    () => ({
      ids,
      push: (id) =>
        setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, MAX)),
    }),
    [ids],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useViewHistory() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useViewHistory outside provider');
  return ctx;
}
