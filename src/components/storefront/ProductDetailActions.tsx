"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

export function ProductDetailActions({
  productId,
  stock,
  minOrder,
}: {
  productId: string;
  stock: number;
  minOrder: number;
}) {
  const [qty, setQty] = useState(Math.max(1, minOrder));
  const bump = useCartStore((s) => s.bump);
  const router = useRouter();
  const soldOut = stock === 0;

  return (
    <div className="mt-8 flex items-center gap-4">
      <div className="flex items-center gap-1.5 border border-ink/25 p-1.5">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-9.5 w-9.5 cursor-pointer border-none bg-transparent text-lg text-ink"
        >
          −
        </button>
        <span className="min-w-10.5 text-center text-xl">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="h-9.5 w-9.5 cursor-pointer border-none bg-transparent text-lg text-ink"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          if (soldOut) return;
          bump(productId, qty);
          router.push("/#order");
        }}
        className={
          "rounded-sm px-7.5 py-4 text-[14px] tracking-[0.17em] whitespace-nowrap uppercase " +
          (soldOut
            ? "cursor-not-allowed bg-ink/12 text-ink/45"
            : "cursor-pointer bg-maroon text-cream")
        }
      >
        {soldOut ? "Sold out" : `Add ${qty} to box`}
      </button>
    </div>
  );
}
