"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "genecode-cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (key: string, size: string) => void;
  updateQuantity: (key: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(key: string, size: string) {
  return `${key}:${size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (x) => lineKey(x.key, x.size) === lineKey(item.key, item.size)
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + (item.quantity || 1),
          };
          return next;
        }
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
    },
    []
  );

  const removeItem = useCallback((key: string, size: string) => {
    setItems((prev) =>
      prev.filter((x) => lineKey(x.key, x.size) !== lineKey(key, size))
    );
  }, []);

  const updateQuantity = useCallback((key: string, size: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) =>
        prev.filter((x) => lineKey(x.key, x.size) !== lineKey(key, size))
      );
      return;
    }
    setItems((prev) =>
      prev.map((x) =>
        lineKey(x.key, x.size) === lineKey(key, size) ? { ...x, quantity } : x
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const n = parseFloat(item.price.replace(/[^\d.]/g, ""));
        return sum + (Number.isNaN(n) ? 0 : n) * item.quantity;
      }, 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, total, addItem, removeItem, updateQuantity, clearCart }),
    [items, count, total, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
