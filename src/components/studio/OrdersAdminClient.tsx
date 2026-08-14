"use client";

import { useState } from "react";
import Link from "next/link";
import type { Order, OrderItem, OrderStatus } from "@prisma/client";
import { peso } from "@/lib/format";
import { ORDER_STATUS_VALUES, ORDER_STATUS_LABELS, PAY_STATUS_LABELS } from "@/lib/constants";
import { Chip, Input, PayPill } from "@/components/ui";
import { OrderStatusSelect } from "@/components/studio/OrderStatusSelect";

type OrderWithItems = Order & { items: OrderItem[] };

const PAY_STATUS_VALUES = ["PENDING", "VERIFIED", "REJECTED"] as const;

export function OrdersAdminClient({
  orders,
  onStatusChange,
}: {
  orders: OrderWithItems[];
  onStatusChange: (ref: string, status: OrderStatus) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [payFilter, setPayFilter] = useState<string>("All");

  const q = search.trim().toLowerCase();
  const filtered = orders.filter(
    (o) =>
      (statusFilter === "All" || o.orderStatus === statusFilter) &&
      (payFilter === "All" || o.payStatus === payFilter) &&
      (q === "" ||
        o.customerName.toLowerCase().includes(q) ||
        o.ref.toLowerCase().includes(q))
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-11 sm:px-10">
      <div className="text-sm tracking-[0.4em] text-rust uppercase">Orders</div>
      <h1 className="mt-3 mb-6.5 text-4xl font-light lg:text-5xl">All orders</h1>

      <div className="flex flex-wrap items-center gap-4.5 border-t border-b border-ink/18 py-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or reference…"
          className="min-w-64"
        />
        <div className="flex flex-wrap gap-2">
          <Chip active={statusFilter === "All"} onClick={() => setStatusFilter("All")}>
            All
          </Chip>
          {ORDER_STATUS_VALUES.filter((s) => s !== "CANCELLED").map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {ORDER_STATUS_LABELS[s]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={payFilter === "All"} onClick={() => setPayFilter("All")}>
            Any payment
          </Chip>
          {PAY_STATUS_VALUES.map((s) => (
            <Chip key={s} active={payFilter === s} onClick={() => setPayFilter(s)}>
              {PAY_STATUS_LABELS[s]}
            </Chip>
          ))}
        </div>
        <span className="ml-auto font-mono text-[13px] text-ink/62">
          {filtered.length} of {orders.length} orders
        </span>
      </div>

      <div className="mt-5.5 border border-ink/14 bg-cream-card">
        <div className="grid grid-cols-[1fr_1.3fr_1fr_0.8fr_1fr_0.7fr] gap-4 bg-cream-warm px-6.5 py-4 text-[13px] tracking-[0.18em] text-ink/74 uppercase">
          <div>Reference</div>
          <div>Customer</div>
          <div>Order status</div>
          <div>Total</div>
          <div>Payment</div>
          <div className="text-right">&nbsp;</div>
        </div>
        {filtered.map((o) => {
          const total = o.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
          return (
            <div
              key={o.id}
              className="grid grid-cols-[1fr_1.3fr_1fr_0.8fr_1fr_0.7fr] items-center gap-4 border-t border-ink/10 px-6.5 py-4"
            >
              <div>
                <div className="font-mono text-base">{o.ref}</div>
                <div className="mt-0.5 font-mono text-[13px] text-ink/62">
                  {o.createdAt.toLocaleDateString("en-PH")}
                </div>
              </div>
              <div>
                <div className="text-xl">{o.customerName}</div>
                <div className="mt-0.5 font-mono text-[13px] text-ink/62">
                  {o.phone} · {o.social}
                </div>
              </div>
              <OrderStatusSelect
                orderRef={o.ref}
                status={o.orderStatus}
                onChange={onStatusChange}
              />
              <div className="text-lg">{peso(total)}</div>
              <div>
                <PayPill status={o.payStatus} />
              </div>
              <div className="text-right">
                <Link
                  href={`/studio/orders/${o.ref}`}
                  className="rounded-sm border border-ink/25 px-3.5 py-2.25 text-[13px] tracking-[0.14em] whitespace-nowrap text-ink/70 uppercase"
                >
                  Open
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
