"use client";

import { useState } from "react";

export function InlineTextField({
  id,
  value,
  onSave,
  listId,
}: {
  id: string;
  value: string;
  onSave: (id: string, value: string) => Promise<void>;
  listId?: string;
}) {
  const [local, setLocal] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setLocal(value);
  }

  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const trimmed = local.trim();
        if (!trimmed) {
          setLocal(value);
          return;
        }
        setLocal(trimmed);
        if (trimmed !== value) void onSave(id, trimmed);
      }}
      list={listId}
      className="w-full rounded-sm border border-ink/20 bg-cream px-3 py-2.75 text-lg font-light text-ink outline-none focus:border-maroon"
    />
  );
}
