"use client";

import { useState, useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_VALUES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { Select } from "@/components/ui";

export function OrderStatusSelect({
  orderRef,
  status,
  onChange,
}: {
  orderRef: string;
  status: OrderStatus;
  onChange: (ref: string, status: OrderStatus) => Promise<void>;
}) {
  const [value, setValue] = useState(status);
  const [syncedStatus, setSyncedStatus] = useState(status);
  const [, startTransition] = useTransition();

  if (status !== syncedStatus) {
    setSyncedStatus(status);
    setValue(status);
  }

  return (
    <Select
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        setValue(next);
        startTransition(() => {
          void onChange(orderRef, next);
        });
      }}
    >
      {ORDER_STATUS_VALUES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
