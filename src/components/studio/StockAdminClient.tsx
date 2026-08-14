"use client";

import type { Product } from "@prisma/client";
import { InlineNumberField } from "@/components/studio/InlineNumberField";
import { StockBar } from "@/components/StockBar";

export function StockAdminClient({
  products,
  batchCode,
  onSave,
}: {
  products: Product[];
  batchCode: string;
  onSave: (id: string, stock: number) => Promise<void>;
}) {
  function stockState(p: Product) {
    if (p.stock === 0) return { label: "Sold out", cls: "bg-ink/8 text-ink/50" };
    if (p.stock <= 5) return { label: "Low stock", cls: "bg-gold text-ink" };
    return { label: "In stock", cls: "border border-ink/25 bg-transparent text-ink/60" };
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-11 sm:px-10">
      <div className="text-sm tracking-[0.4em] text-rust uppercase">Stock overview</div>
      <h1 className="mt-3 mb-7.5 text-4xl font-light lg:text-5xl">
        Remaining in {batchCode}
      </h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const state = stockState(p);
          return (
            <div key={p.id} className="border border-ink/14 bg-cream-card p-5.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className={"text-xl " + (p.active ? "" : "opacity-45")}>{p.name}</div>
                <span
                  className={
                    "rounded-full px-3.5 py-1.75 text-[13px] tracking-[0.14em] uppercase " +
                    state.cls
                  }
                >
                  {state.label}
                </span>
              </div>
              <StockBar stock={p.stock} planned={p.planned} />
              <div className="mt-4.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void onSave(p.id, Math.max(0, p.stock - 1))}
                  className="h-8.5 w-8.5 cursor-pointer border border-ink/25 bg-transparent text-base"
                >
                  −
                </button>
                <InlineNumberField id={p.id} value={p.stock} onSave={onSave} />
                <button
                  type="button"
                  onClick={() => void onSave(p.id, p.stock + 1)}
                  className="h-8.5 w-8.5 cursor-pointer border border-ink/25 bg-transparent text-base"
                >
                  +
                </button>
                <span className="ml-auto font-mono text-[13px] text-ink/62">
                  of {p.planned}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
