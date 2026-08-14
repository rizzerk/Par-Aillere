import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { peso } from "@/lib/format";
import { Footer } from "@/components/Footer";

const FULFIL_LABELS: Record<string, string> = { PICKUP: "Pick up", MAXIM: "Maxim" };
const PAY_LABELS: Record<string, string> = { GCASH: "GCash", GOTYME: "GoTyme", CASH: "Cash" };

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const order = await prisma.order.findFirst({
    where: { ref: { equals: ref, mode: "insensitive" } },
    include: { items: true },
  });

  if (!order) notFound();

  const [batch, currentBatch] = await Promise.all([
    prisma.batch.findFirst({ where: { code: order.batchCode } }),
    prisma.batch.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const total = order.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const firstName = (order.customerName || "friend").split(" ")[0];
  const itemsLabel = order.items.map((i) => `${i.qty} ${i.productName}`).join(", ");

  return (
    <>
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:px-10">
        <div className="border border-ink/16 bg-cream-card p-8 text-center sm:p-11">
          <div className="text-sm tracking-[0.4em] text-rust uppercase">
            Order received
          </div>
          <h1 className="mt-4 text-4xl font-light sm:text-5xl">Thank you, {firstName}.</h1>
          <p className="mt-3.5 text-lg font-light text-ink/72">
            We&apos;ll message you on {order.social || order.phone} to confirm your order
            and payment.
          </p>
          <div className="mx-auto mt-8 max-w-sm bg-maroon p-6 text-cream">
            <div className="text-[13px] tracking-[0.32em] text-gold uppercase">
              Your reference number
            </div>
            <div className="mt-2.5 font-mono text-4xl tracking-[0.08em]">{order.ref}</div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 border-t border-ink/16 pt-6.5 text-left sm:grid-cols-3">
            <div>
              <div className="text-[13px] tracking-[0.2em] text-rust uppercase">Items</div>
              <p className="mt-2 text-base font-light text-ink/78">{itemsLabel}</p>
            </div>
            <div>
              <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                Total &amp; payment
              </div>
              <p className="mt-2 text-base font-light text-ink/78">
                {peso(total)} · {PAY_LABELS[order.payMethod]}
              </p>
            </div>
            <div>
              <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                Fulfilment
              </div>
              <p className="mt-2 text-base font-light text-ink/78">
                {FULFIL_LABELS[order.fulfilMethod]} · {batch?.deliveryLabel ?? "TBA"}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/?trackRef=${encodeURIComponent(order.ref)}#track`}
              className="rounded-sm bg-maroon px-6.5 py-3.5 text-[14px] whitespace-nowrap text-cream uppercase"
            >
              Track this order
            </Link>
            <Link
              href="/#menu"
              className="rounded-sm border border-ink/30 px-6.5 py-3.5 text-[14px] whitespace-nowrap text-ink uppercase"
            >
              Back to menu
            </Link>
          </div>
        </div>
      </div>
      <Footer minOrder={currentBatch?.minOrder ?? 4} />
    </>
  );
}
