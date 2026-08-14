"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = {
  items: Record<string, number>;
  bump: (productId: string, delta: number) => void;
  set: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      bump: (productId, delta) =>
        set((s) => {
          const next = { ...s.items };
          const qty = Math.max(0, (next[productId] ?? 0) + delta);
          if (qty === 0) delete next[productId];
          else next[productId] = qty;
          return { items: next };
        }),
      set: (productId, qty) =>
        set((s) => {
          const next = { ...s.items };
          if (qty <= 0) delete next[productId];
          else next[productId] = qty;
          return { items: next };
        }),
      remove: (productId) =>
        set((s) => {
          const next = { ...s.items };
          delete next[productId];
          return { items: next };
        }),
      clear: () => set({ items: {} }),
    }),
    { name: "par-aillere-cart" }
  )
);

export function cartCount(items: Record<string, number>): number {
  return Object.values(items).reduce((a, b) => a + b, 0);
}
