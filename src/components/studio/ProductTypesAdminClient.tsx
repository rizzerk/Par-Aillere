"use client";

import { useState } from "react";
import type { ProductType } from "@prisma/client";
import { Input } from "@/components/ui";

type ActionResult = { ok: boolean; error?: string };

type Actions = {
  createProductType: (name: string) => Promise<ActionResult>;
  renameProductType: (id: string, name: string) => Promise<ActionResult>;
  deleteProductType: (id: string) => Promise<ActionResult>;
};

export function ProductTypesAdminClient({
  types,
  counts,
  actions,
}: {
  types: ProductType[];
  counts: Record<string, number>;
  actions: Actions;
}) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!newName.trim() || adding) return;
    setAdding(true);
    setError(null);
    const res = await actions.createProductType(newName);
    setAdding(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't add that type.");
      return;
    }
    setNewName("");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-11 sm:px-10">
      <div className="text-sm tracking-[0.4em] text-rust uppercase">Products</div>
      <h1 className="mt-3 mb-2.5 text-4xl font-light lg:text-5xl">Product types</h1>
      <p className="max-w-xl font-mono text-sm leading-loose text-ink/66">
        The categories customers filter by on the menu — Cookies, Brownies, and anything
        else you add here. Rename one and every product using it updates automatically.
      </p>

      <div className="mt-7.5 flex flex-wrap items-start gap-3.5">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAdd();
          }}
          placeholder="e.g. Cakes"
          className="min-w-64"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="cursor-pointer rounded-sm border-none bg-maroon px-6 py-3.5 text-[14px] tracking-[0.16em] whitespace-nowrap text-cream uppercase disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add type"}
        </button>
      </div>
      {error && (
        <p className="mt-2.5 font-mono text-[13px] text-maroon-deep">{error}</p>
      )}

      <div className="mt-7.5 border border-ink/14 bg-cream-card">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4.5 bg-cream-warm px-6.5 py-4 text-[13px] tracking-[0.2em] text-ink/74 uppercase">
          <div>Name</div>
          <div>Products</div>
          <div className="text-right">Actions</div>
        </div>
        {types.length === 0 && (
          <p className="m-0 px-6.5 py-6 font-mono text-[13px] text-ink/55">
            No types yet — add one above.
          </p>
        )}
        {types.map((t) => (
          <TypeRow
            key={t.id}
            type={t}
            count={counts[t.name] ?? 0}
            onRename={actions.renameProductType}
            onDelete={actions.deleteProductType}
          />
        ))}
      </div>
    </div>
  );
}

function TypeRow({
  type,
  count,
  onRename,
  onDelete,
}: {
  type: ProductType;
  count: number;
  onRename: (id: string, name: string) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  const [name, setName] = useState(type.name);
  const [syncedName, setSyncedName] = useState(type.name);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (type.name !== syncedName) {
    setSyncedName(type.name);
    setName(type.name);
  }

  async function handleBlur() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === type.name) {
      setName(type.name);
      return;
    }
    const res = await onRename(type.id, trimmed);
    if (!res.ok) {
      setError(res.error ?? "Couldn't rename that type.");
      setName(type.name);
    } else {
      setError(null);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${type.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const res = await onDelete(type.id);
    setDeleting(false);
    if (!res.ok) setError(res.error ?? "Couldn't delete that type.");
  }

  return (
    <div className="border-t border-ink/10 px-6.5 py-4">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          className="w-full rounded-sm border border-ink/20 bg-cream px-3 py-2.75 text-lg font-light text-ink outline-none focus:border-maroon"
        />
        <span className="font-mono text-[13px] text-ink/62">
          {count} product{count === 1 ? "" : "s"}
        </span>
        <div className="text-right">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="cursor-pointer rounded-sm border border-ink/25 bg-transparent px-3.5 py-2.25 text-[13px] tracking-[0.14em] whitespace-nowrap text-ink/70 uppercase disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 font-mono text-[13px] text-maroon-deep">{error}</p>}
    </div>
  );
}
