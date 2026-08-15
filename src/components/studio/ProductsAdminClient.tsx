"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { ProductCategory } from "@prisma/client";
import { CATEGORY_LABELS, ALLERGEN_OPTIONS } from "@/lib/constants";
import { Input, Textarea, Chip } from "@/components/ui";
import { InlineNumberField } from "@/components/studio/InlineNumberField";
import { InlineTextField } from "@/components/studio/InlineTextField";
import { PhotoUploadButton } from "@/components/studio/PhotoUploadButton";
import Image from "next/image";

type Actions = {
  addProduct: (input: {
    name: string;
    type: string;
    price: number;
    stock: number;
    blurb: string;
    category: ProductCategory;
    allergens: string[];
  }) => Promise<void>;
  updateProductPrice: (id: string, price: number) => Promise<void>;
  updateProductStock: (id: string, stock: number) => Promise<void>;
  updateProductType: (id: string, type: string) => Promise<void>;
  updateProductDetails: (
    id: string,
    input: {
      blurb: string;
      longDesc: string;
      category: ProductCategory;
      allergens: string[];
    }
  ) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductPhoto: (id: string, url: string) => Promise<void>;
};

export function ProductsAdminClient({
  products,
  productTypes,
  actions,
}: {
  products: Product[];
  productTypes: string[];
  actions: Actions;
}) {
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    type: "",
    price: "",
    stock: "",
    blurb: "",
    category: ProductCategory.FILLED as ProductCategory,
    allergens: ["Gluten", "Dairy", "Egg"] as string[],
  });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function toggleDraftAllergen(a: string) {
    setDraft((d) => ({
      ...d,
      allergens: d.allergens.includes(a)
        ? d.allergens.filter((x) => x !== a)
        : [...d.allergens, a],
    }));
  }

  async function handleAdd() {
    if (!draft.name.trim() || adding) return;
    setAdding(true);
    await actions.addProduct({
      name: draft.name,
      type: draft.type,
      price: parseInt(draft.price, 10) || 40,
      stock: parseInt(draft.stock, 10) || 12,
      blurb: draft.blurb,
      category: draft.category,
      allergens: draft.allergens,
    });
    setAdding(false);
    setDraft({
      name: "",
      type: "",
      price: "",
      stock: "",
      blurb: "",
      category: ProductCategory.FILLED,
      allergens: ["Gluten", "Dairy", "Egg"],
    });
    setShowNew(false);
  }

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden px-6 py-11 sm:px-10">
      <datalist id="product-type-suggestions">
        {productTypes.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
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
          <h1 className="mt-3 text-4xl font-light lg:text-5xl">Product catalogue</h1>
          <Link
            href="/studio/types"
            className="mt-2 inline-block text-[13px] tracking-[0.15em] text-rust uppercase"
          >
            Manage types →
          </Link>
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
                Type
              </span>
              <Input
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                placeholder="Cookies"
                list="product-type-suggestions"
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
          </div>

          <div className="mt-4.5 flex flex-wrap items-center gap-3.5">
            <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
              Filling
            </span>
            <div className="flex flex-wrap gap-2">
              {(Object.values(ProductCategory) as ProductCategory[]).map((c) => (
                <Chip
                  key={c}
                  active={draft.category === c}
                  onClick={() => setDraft((d) => ({ ...d, category: c }))}
                >
                  {CATEGORY_LABELS[c]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-3.5">
            <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
              Contains
            </span>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((a) => (
                <Chip
                  key={a}
                  active={draft.allergens.includes(a)}
                  onClick={() => toggleDraftAllergen(a)}
                >
                  {a}
                </Chip>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !draft.name.trim()}
            className="mt-4.5 cursor-pointer rounded-sm border-none bg-maroon px-6 py-3.5 text-[14px] tracking-[0.16em] whitespace-nowrap text-cream uppercase disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      )}

      <div className="relative mt-7.5 overflow-x-auto border border-ink/14 bg-cream-card">
        <div className="grid min-w-[840px] grid-cols-[1.8fr_1fr_0.8fr_0.8fr_1fr_1.3fr] gap-4.5 bg-cream-warm px-6.5 py-4 text-[13px] tracking-[0.2em] text-ink/74 uppercase">
          <div>Flavour</div>
          <div>Type</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {products.map((p) => (
          <div key={p.id} className="border-t border-ink/10">
            <div className="grid min-w-[840px] grid-cols-[1.8fr_1fr_0.8fr_0.8fr_1fr_1.3fr] items-center gap-4.5 px-6.5 py-4">
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
              <InlineTextField
                id={p.id}
                value={p.type}
                onSave={actions.updateProductType}
                listId="product-type-suggestions"
              />
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
                <button
                  type="button"
                  onClick={() => setEditingId((cur) => (cur === p.id ? null : p.id))}
                  className={
                    "cursor-pointer rounded-sm border px-3.5 py-2.25 text-[13px] tracking-[0.14em] whitespace-nowrap uppercase " +
                    (editingId === p.id
                      ? "border-maroon bg-maroon text-cream"
                      : "border-ink/25 bg-transparent text-ink/70")
                  }
                >
                  {editingId === p.id ? "Close" : "Details"}
                </button>
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
            {editingId === p.id && (
              <DetailsEditor
                product={p}
                onSave={actions.updateProductDetails}
                onDone={() => setEditingId(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailsEditor({
  product,
  onSave,
  onDone,
}: {
  product: Product;
  onSave: (
    id: string,
    input: {
      blurb: string;
      longDesc: string;
      category: ProductCategory;
      allergens: string[];
    }
  ) => Promise<void>;
  onDone: () => void;
}) {
  const [blurb, setBlurb] = useState(product.blurb);
  const [longDesc, setLongDesc] = useState(product.longDesc);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [allergens, setAllergens] = useState<string[]>(product.allergens);
  const [saving, setSaving] = useState(false);

  function toggleAllergen(a: string) {
    setAllergens((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }

  async function handleSave() {
    if (!blurb.trim() || !longDesc.trim() || saving) return;
    setSaving(true);
    await onSave(product.id, { blurb, longDesc, category, allergens });
    setSaving(false);
    onDone();
  }

  return (
    <div className="min-w-[840px] border-t border-ink/10 bg-cream-warm px-6.5 py-5">
      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2">
        <label className="flex flex-col gap-1.75">
          <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
            Short description
          </span>
          <span className="font-mono text-[12px] text-ink/55">
            Shown on the menu card and product page eyebrow.
          </span>
          <Textarea
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            rows={3}
          />
        </label>
        <label className="flex flex-col gap-1.75">
          <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
            Full description
          </span>
          <span className="font-mono text-[12px] text-ink/55">
            Shown on the product detail page.
          </span>
          <Textarea
            value={longDesc}
            onChange={(e) => setLongDesc(e.target.value)}
            rows={3}
          />
        </label>
      </div>

      <div className="mt-4.5 flex flex-wrap items-center gap-3.5">
        <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
          Filling
        </span>
        <span className="font-mono text-[12px] text-ink/55">
          Drives the Style filter on the storefront menu.
        </span>
        <div className="flex flex-wrap gap-2">
          {(Object.values(ProductCategory) as ProductCategory[]).map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3.5">
        <span className="text-[13px] tracking-[0.17em] text-ink/70 uppercase">
          Contains
        </span>
        <span className="font-mono text-[12px] text-ink/55">
          Drives the Free-from filter — leave unchecked for what it doesn&apos;t contain.
        </span>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((a) => (
            <Chip key={a} active={allergens.includes(a)} onClick={() => toggleAllergen(a)}>
              {a}
            </Chip>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !blurb.trim() || !longDesc.trim()}
        className="mt-4.5 cursor-pointer rounded-sm border-none bg-maroon px-6 py-3.5 text-[14px] tracking-[0.16em] whitespace-nowrap text-cream uppercase disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save details"}
      </button>
    </div>
  );
}
