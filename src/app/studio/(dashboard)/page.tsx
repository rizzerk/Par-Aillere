import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { peso } from "@/lib/format";
import { toggleBatchOpen } from "@/actions/batch";
import { PayPill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const batch = await prisma.batch.findFirst({ orderBy: { createdAt: "desc" } });
  if (!batch) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <p className="text-lg font-light text-ink/70">
          No batch found yet — run <code>npm run db:seed</code> to get started.
        </p>
      </div>
    );
  }

  const [products, orders] = await Promise.all([
    prisma.product.findMany(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  const live = products.filter((p) => p.active);
  const lowStock = live.filter((p) => p.stock <= 5);
  const batchOrders = orders.filter((o) => o.batchCode === batch.code);
  const pendingCount = orders.filter((o) => o.payStatus === "PENDING").length;
  const toBake = batchOrders
    .filter((o) => o.orderStatus === "TO_BAKE" || o.orderStatus === "BAKING")
    .reduce((a, o) => a + o.items.reduce((b, i) => b + i.qty, 0), 0);
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 py-11 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <div className="text-sm tracking-[0.4em] text-rust uppercase">Dashboard</div>
          <h1 className="mt-3 text-4xl font-light lg:text-5xl">
            {batch.code} at a glance
          </h1>
        </div>
        <form action={toggleBatchOpen}>
          <button
            type="submit"
            className={
              "cursor-pointer rounded-sm border px-6.5 py-3.5 text-[14px] tracking-[0.16em] whitespace-nowrap uppercase " +
              (batch.isOpen
                ? "border-maroon-deep/40 bg-maroon-deep text-cream"
                : "border-ink/25 bg-transparent text-ink")
            }
          >
            {batch.isOpen ? "Close batch" : "Open batch"}
          </button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-ink/14 bg-cream-card p-5.5">
          <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
            Batch status
          </div>
          <div className="mt-2.5 text-3xl font-light">
            {batch.isOpen ? "Batch open" : "Batch closed"}
          </div>
          <div className="mt-1.5 font-mono text-[13px] text-ink/66">
            Cutoff {batch.cutoffLabel}
          </div>
        </div>
        <div className="border border-ink/14 bg-cream-card p-5.5">
          <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
            Orders this batch
          </div>
          <div className="mt-2 text-4xl font-light">{batchOrders.length}</div>
        </div>
        <Link
          href="/studio/orders"
          className="border border-maroon-deep/35 bg-cream-card p-5.5"
        >
          <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
            Pending verifications
          </div>
          <div className="mt-2 text-4xl font-light text-maroon-deep">{pendingCount}</div>
        </Link>
        <div className="border border-ink/14 bg-cream-card p-5.5">
          <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
            Cookies to bake
          </div>
          <div className="mt-2 text-4xl font-light">{toBake}</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="border border-ink/14 bg-cream-card">
          <div className="flex items-baseline justify-between border-b border-ink/12 px-6 py-4.5">
            <span className="text-[13px] tracking-[0.24em] text-rust uppercase">
              Low stock
            </span>
            <span className="font-mono text-[13px] text-ink/62">
              {lowStock.length ? `${lowStock.length} need attention` : "all healthy"}
            </span>
          </div>
          {lowStock.length === 0 && (
            <p className="m-0 px-6 py-5 font-mono text-[13px] text-ink/55">
              Nothing running low.
            </p>
          )}
          {lowStock.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 border-b border-ink/8 px-6 py-4"
            >
              <span className="text-xl">{p.name}</span>
              <span
                className={
                  "rounded-full px-3.5 py-1.75 text-[13px] tracking-[0.14em] uppercase " +
                  (p.stock === 0 ? "bg-ink/8 text-ink/50" : "bg-gold text-ink")
                }
              >
                {p.stock === 0 ? "Sold out" : `${p.stock} left`}
              </span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto border border-ink/14 bg-cream-card">
          <div className="flex min-w-[360px] items-baseline justify-between border-b border-ink/12 px-6 py-4.5">
            <span className="text-[13px] tracking-[0.24em] text-rust uppercase">
              Latest orders
            </span>
            <Link
              href="/studio/orders"
              className="text-[13px] tracking-[0.15em] text-rust uppercase"
            >
              View all
            </Link>
          </div>
          {recentOrders.map((o) => {
            const total = o.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
            return (
              <Link
                key={o.id}
                href={`/studio/orders/${o.ref}`}
                className="grid min-w-[360px] grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-ink/8 px-6 py-4"
              >
                <div>
                  <div className="text-lg text-ink">{o.customerName}</div>
                  <div className="mt-0.5 font-mono text-[13px] text-ink/62">
                    {o.ref} · {o.createdAt.toLocaleDateString("en-PH")}
                  </div>
                </div>
                <span className="text-lg text-ink">{peso(total)}</span>
                <PayPill status={o.payStatus} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
