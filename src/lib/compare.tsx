import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const MAX = 4;
const KEY = 'aqua_compare';

type CompareCtx = {
  ids: string[];
  isCompared: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const api = useMemo<CompareCtx>(
    () => ({
      ids,
      isCompared: (id) => ids.includes(id),
      toggle: (id) =>
        setIds((prev) => {
          if (prev.includes(id)) return prev.filter((x) => x !== id);
          if (prev.length >= MAX) return prev;
          return [...prev, id];
        }),
      remove: (id) => setIds((prev) => prev.filter((x) => x !== id)),
      clear: () => setIds([]),
    }),
    [ids],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCompare outside provider');
  return ctx;
}
