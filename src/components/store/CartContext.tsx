import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import type { CartItem, Product } from '@/types/database';

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product, variant?: string) => void;
  remove: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

function storageKey(userId?: string | null) {
  return `aqua_cart_${userId || 'anon'}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(user?.id));
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(storageKey(user?.id), JSON.stringify(items));
  }, [items, user?.id]);

  const api = useMemo<CartCtx>(() => {
    const add = (product: Product, variant = '') => {
      const key = `${product.id}|${variant}`;
      setItems((prev) => {
        const found = prev.find((i) => i.key === key);
        if (found) {
          return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
        }
        return [
          ...prev,
          {
            key,
            id: product.id,
            name: product.name,
            price: Number(product.price),
            qty: 1,
            image_url: product.image_url,
            variant: variant || undefined,
          },
        ];
      });
    };
    const remove = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));
    const updateQty = (key: string, qty: number) => {
      if (qty <= 0) return remove(key);
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
    };
    const clear = () => setItems([]);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    return { items, count, total, add, remove, updateQty, clear };
  }, [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart outside CartProvider');
  return ctx;
}
