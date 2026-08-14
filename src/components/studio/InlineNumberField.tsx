"use client";

import { useState } from "react";

export function InlineNumberField({
  id,
  value,
  onSave,
}: {
  id: string;
  value: number;
  onSave: (id: string, value: number) => Promise<void>;
}) {
  const [local, setLocal] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setLocal(String(value));
  }

  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value.replace(/[^0-9]/g, ""))}
      onBlur={() => {
        const n = local === "" ? 0 : parseInt(local, 10);
        setLocal(String(n));
        if (n !== value) void onSave(id, n);
      }}
      className="w-20 rounded-sm border border-ink/20 bg-cream px-3 py-2.75 text-lg font-light text-ink outline-none focus:border-maroon"
    />
  );
}
