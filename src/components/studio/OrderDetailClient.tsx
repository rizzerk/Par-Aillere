"use client";

import Link from "next/link";
import type { Order, OrderItem, OrderStatus } from "@prisma/client";
import { peso } from "@/lib/format";
import { PayPill } from "@/components/ui";
import { OrderStatusSelect } from "@/components/studio/OrderStatusSelect";
import { RejectPaymentForm } from "@/components/studio/RejectPaymentForm";

type OrderWithItems = Order & { items: OrderItem[] };

const FULFIL_LABELS: Record<string, string> = { PICKUP: "Pick up", MAXIM: "Maxim" };
const PAY_LABELS: Record<string, string> = { GCASH: "GCash", GOTYME: "GoTyme", CASH: "Cash" };

export function OrderDetailClient({
  order,
  actions,
}: {
  order: OrderWithItems;
  actions: {
    updateOrderStatus: (ref: string, status: OrderStatus) => Promise<void>;
    verifyPayment: (ref: string) => Promise<void>;
    rejectPayment: (
      ref: string,
      reason: string
    ) => Promise<{ ok: true } | { ok: false; error: string }>;
    reopenPayment: (ref: string) => Promise<void>;
  };
}) {
  const total = order.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const addressNotes = [order.address, order.notes].filter(Boolean).join(" — ") || "—";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      <Link
        href="/studio/orders"
        className="inline-block py-2 text-[14px] tracking-[0.17em] text-rust uppercase"
      >
        ← All orders
      </Link>
      <div className="mt-4.5 flex flex-wrap items-end justify-between gap-6.5">
        <div>
          <div className="text-sm tracking-[0.4em] text-rust uppercase">Order</div>
          <h1 className="mt-3 font-mono text-4xl tracking-[0.06em]">{order.ref}</h1>
          <div className="mt-2 font-mono text-sm text-ink/66">
            {order.createdAt.toLocaleString("en-PH")} · {order.batchCode}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <PayPill status={order.payStatus} />
          <OrderStatusSelect
            orderRef={order.ref}
            status={order.orderStatus}
            onChange={actions.updateOrderStatus}
          />
        </div>
      </div>

      <div className="mt-7.5 grid grid-cols-1 items-start gap-6.5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="flex flex-col gap-6">
          <div className="border border-ink/14 bg-cream-card">
            <div className="border-b border-ink/12 px-6 py-4 text-[13px] tracking-[0.24em] text-rust uppercase">
              Items
            </div>
            {order.items.map((i) => (
              <div
                key={i.id}
                className="flex items-baseline justify-between gap-4 border-b border-ink/8 px-6 py-3.75"
              >
                <span className="text-xl">
                  {i.qty} × {i.productName}
                </span>
                <span className="text-xl text-rust">{peso(i.qty * i.unitPrice)}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between px-6 py-5">
              <span className="text-[13px] tracking-[0.2em] text-ink/66 uppercase">
                Total
              </span>
              <span className="text-3xl font-light">{peso(total)}</span>
            </div>
          </div>

          <div className="border border-ink/14 bg-cream-card p-6.5">
            <div className="text-[13px] tracking-[0.24em] text-rust uppercase">
              Customer
            </div>
            <div className="mt-4.5 grid grid-cols-1 gap-4.5 sm:grid-cols-2">
              <div>
                <div className="text-[13px] tracking-[0.17em] text-ink/62 uppercase">
                  Name
                </div>
                <p className="m-0 mt-1.5 text-xl font-light">{order.customerName}</p>
              </div>
              <div>
                <div className="text-[13px] tracking-[0.17em] text-ink/62 uppercase">
                  Contact number
                </div>
                <p className="m-0 mt-1.5 text-xl font-light">{order.phone}</p>
              </div>
              <div>
                <div className="text-[13px] tracking-[0.17em] text-ink/62 uppercase">
                  IG / FB
                </div>
                <p className="m-0 mt-1.5 text-xl font-light">{order.social}</p>
              </div>
              <div>
                <div className="text-[13px] tracking-[0.17em] text-ink/62 uppercase">
                  Fulfilment
                </div>
                <p className="m-0 mt-1.5 text-xl font-light">
                  {FULFIL_LABELS[order.fulfilMethod]}
                </p>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[13px] tracking-[0.17em] text-ink/62 uppercase">
                  Address / notes
                </div>
                <p className="m-0 mt-1.5 text-lg font-light text-ink/80">{addressNotes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-maroon-deep/30 bg-cream-card p-6.5">
          <div className="text-[13px] tracking-[0.24em] text-rust uppercase">Payment</div>
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <span className="text-xl">{PAY_LABELS[order.payMethod]}</span>
            <PayPill status={order.payStatus} />
          </div>
          <div className="mt-4">
            <div className="text-[13px] tracking-[0.17em] text-ink/62 uppercase">
              Reference number
            </div>
            <p className="m-0 mt-1.5 font-mono text-lg">{order.payRef || "—"}</p>
          </div>
          <div className="mt-4.5">
            <div className="text-[13px] tracking-[0.17em] text-ink/62 uppercase">
              Payment proof
            </div>
            <div className="mt-2.5 aspect-[3/4] overflow-hidden bg-cream-warm">
              {order.proofUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.proofUrl}
                  alt="Payment proof"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-end p-3.5">
                  <span className="font-mono text-[13px] text-ink/70">
                    {order.payMethod === "CASH"
                      ? "[ no proof needed — cash order ]"
                      : "[ no proof uploaded yet ]"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {order.payStatus === "PENDING" && (
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => void actions.verifyPayment(order.ref)}
                className="cursor-pointer rounded-sm border-none bg-maroon px-5 py-3.5 text-[14px] tracking-[0.16em] text-cream uppercase"
              >
                Verify payment
              </button>
              <RejectPaymentForm orderRef={order.ref} onReject={actions.rejectPayment} />
            </div>
          )}

          {order.payStatus === "REJECTED" && (
            <div className="mt-5 bg-maroon-deep/7 p-4">
              <div className="text-[13px] tracking-[0.17em] text-rust uppercase">
                Rejection reason
              </div>
              <p className="m-0 mt-2 text-lg font-light text-ink/80">
                {order.rejectReason}
              </p>
              <button
                type="button"
                onClick={() => void actions.reopenPayment(order.ref)}
                className="mt-3.5 cursor-pointer rounded-sm border border-ink/25 bg-transparent px-4 py-2.75 text-[13px] tracking-[0.15em] text-ink/70 uppercase"
              >
                Reopen for verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
