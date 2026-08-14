"use client";

import { useState } from "react";
import type { Product } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui";
import { InlineNumberField } from "@/components/studio/InlineNumberField";
import { PhotoUploadButton } from "@/components/studio/PhotoUploadButton";
import Image from "next/image";

type Actions = {
  addProduct: (input: {
    name: string;
    price: number;
    stock: number;
    blurb: string;
  }) => Promise<void>;
  updateProductPrice: (id: string, price: number) => Promise<void>;
  updateProductStock: (id: string, stock: number) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductPhoto: (id: string, url: string) => Promise<void>;
};

export function ProductsAdminClient({
  products,
  actions,
}: {
  products: Product[];
  actions: Actions;
}) {
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ name: "", price: "", stock: "", blurb: "" });
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!draft.name.trim() || adding) return;
    setAdding(true);
    await actions.addProduct({
      name: draft.name,
      price: parseInt(draft.price, 10) || 40,
      stock: parseInt(draft.stock, 10) || 12,
      blurb: draft.blurb,
    });
    setAdding(false);
    setDraft({ name: "", price: "", stock: "", blurb: "" });
    setShowNew(false);
  }

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden px-6 py-11 sm:px-10">
      <Image
        src="/assets/flower-e.png"
        alt=""
        width={63}
        height={140}
        className="pointer-events-none absolute bottom-0 left-6 hidden sm:block"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-8">
        <div>
          <div className="text-sm tracking-[0.4em] text-rust uppercase">Products</div>
          <h1 className="mt-3 text-4xl font-light lg:text-5xl">Cookie catalogue</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowNew((o) => !o)}
          className={
            "cursor-pointer rounded-sm border px-6.5 py-3.5 text-[14px] tracking-[0.16em] whitespace-nowrap uppercase " +
            (showNew ? "border-maroon bg-maroon text-cream" : "border-ink/30 bg-transparent text-ink")
          }
        >
          {showNew ? "Close" : "Add flavour"}
        </button>
      </div>

      {showNew && (
        <div className="relative mt-6.5 border border-maroon-deep/35 bg-cream-card p-6.5">
          <div className="text-[13px] tracking-[0.32em] text-rust uppercase">
            New flavour
          </div>
          <div className="mt-4.5 grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
            <label className="flex flex-col gap-1.75 lg:col-span-2">
              <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
                Name
              </span>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Biscoff"
              />
            </label>
            <label className="flex flex-col gap-1.75">
              <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
                Price
              </span>
              <Input
                value={draft.price}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, price: e.target.value.replace(/[^0-9]/g, "") }))
                }
                placeholder="45"
              />
            </label>
            <label className="flex flex-col gap-1.75">
              <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
                Stock
              </span>
              <Input
                value={draft.stock}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, stock: e.target.value.replace(/[^0-9]/g, "") }))
                }
                placeholder="24"
              />
            </label>
            <label className="flex flex-col gap-1.75 lg:col-span-1">
              <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
                Description
              </span>
              <Input
                value={draft.blurb}
                onChange={(e) => setDraft((d) => ({ ...d, blurb: e.target.value }))}
                placeholder="Filled, 45g dough"
              />
            </label>
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || !draft.name.trim()}
              className="cursor-pointer rounded-sm border-none bg-maroon px-6 py-3.5 text-[14px] tracking-[0.16em] whitespace-nowrap text-cream uppercase"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      )}

      <div className="relative mt-7.5 border border-ink/14 bg-cream-card">
        <div className="grid grid-cols-[2.1fr_0.9fr_0.9fr_1fr_1.3fr] gap-4.5 bg-cream-warm px-6.5 py-4 text-[13px] tracking-[0.2em] text-ink/74 uppercase">
          <div>Flavour</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {products.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[2.1fr_0.9fr_0.9fr_1fr_1.3fr] items-center gap-4.5 border-t border-ink/10 px-6.5 py-4"
          >
            <div className="flex items-center gap-4">
              <div
                className="h-11.5 w-11.5 flex-none overflow-hidden bg-cream-warm"
                style={
                  p.photoUrl
                    ? { backgroundImage: `url(${p.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : {
                        backgroundImage:
                          "repeating-linear-gradient(135deg, rgba(92,16,21,0.16) 0 6px, rgba(92,16,21,0.04) 6px 12px)",
                      }
                }
              />
              <div>
                <div className={"text-xl " + (p.active ? "" : "opacity-45")}>{p.name}</div>
                <div className="mt-0.5 font-mono text-[13px] text-ink/62">
                  {CATEGORY_LABELS[p.category]} · {p.allergens.join(", ")}
                </div>
              </div>
            </div>
            <InlineNumberField id={p.id} value={p.price} onSave={actions.updateProductPrice} />
            <InlineNumberField id={p.id} value={p.stock} onSave={actions.updateProductStock} />
            <button
              type="button"
              onClick={() => void actions.toggleProductActive(p.id)}
              className={
                "w-fit cursor-pointer rounded-full border px-3.5 py-1.75 text-[13px] tracking-[0.15em] uppercase " +
                (p.active
                  ? "border-maroon-deep/40 bg-maroon-deep text-cream"
                  : "border-ink/20 bg-transparent text-ink/60")
              }
            >
              {p.active ? "Live" : "Hidden"}
            </button>
            <div className="flex justify-end gap-2">
              <PhotoUploadButton productId={p.id} onUploaded={actions.updateProductPhoto} />
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${p.name}? This can't be undone.`)) {
                    void actions.deleteProduct(p.id);
                  }
                }}
                className="cursor-pointer rounded-sm border border-ink/25 bg-transparent px-3.5 py-2.25 text-[13px] tracking-[0.14em] whitespace-nowrap text-ink/70 uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
