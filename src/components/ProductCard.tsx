"use client";

import Link from "next/link";
import type { Product } from "@prisma/client";
import { peso } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { StockDot } from "@/components/ui";

export function ProductCard({ product }: { product: Product }) {
  const qty = useCartStore((s) => s.items[product.id] ?? 0);
  const bump = useCartStore((s) => s.bump);
  const soldOut = product.stock === 0;

  return (
    <div className="flex flex-col border border-ink/12 bg-cream-card">
      <Link
        href={`/product/${product.slug}`}
        className="relative flex aspect-[4/3] items-end overflow-hidden p-4"
      >
        {product.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.photoUrl}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(92,16,21,0.10) 0 8px, rgba(92,16,21,0.03) 8px 16px)",
            }}
          />
        )}
        <span className="absolute top-3.5 right-3.5 bg-maroon px-3 py-1 text-[13px] tracking-[0.16em] text-cream uppercase">
          {CATEGORY_LABELS[product.category]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-5 pb-6">
        <span className="font-mono text-[12px] tracking-[0.16em] text-ink/50 uppercase">
          {product.type}
        </span>
        <div className="flex items-baseline justify-between gap-3">
          <Link href={`/product/${product.slug}`}>
            <h3 className="m-0 text-2xl font-normal">{product.name}</h3>
          </Link>
          <span className="text-xl text-rust">{peso(product.price)}</span>
        </div>
        <p className="m-0 flex-1 text-base font-light text-ink/72">{product.blurb}</p>
        <div className="flex items-center gap-2">
          <StockDot stock={product.stock} />
          <span className="font-mono text-[13px] text-ink/70">
            {soldOut ? "Sold out this batch" : `${product.stock} left this batch`}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="py-2.5 text-[14px] tracking-[0.15em] text-rust uppercase"
          >
            Details
          </Link>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => bump(product.id, 1)}
            className={
              "rounded-sm border px-5 py-2.5 text-[14px] tracking-[0.16em] whitespace-nowrap uppercase " +
              (soldOut
                ? "cursor-not-allowed border-transparent bg-ink/8 text-ink/45"
                : qty > 0
                  ? "cursor-pointer border-maroon bg-maroon text-cream"
                  : "cursor-pointer border-ink/30 bg-transparent text-ink")
            }
          >
            {soldOut ? "Sold out" : qty > 0 ? `In box · ${qty}` : "Add to box"}
          </button>
        </div>
      </div>
    </div>
  );
}
