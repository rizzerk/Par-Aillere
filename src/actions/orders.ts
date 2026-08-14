"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { FulfilMethod, PayMethod, PayStatus } from "@prisma/client";

const placeOrderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), qty: z.number().int().positive() }))
    .min(1, "Your box is empty."),
  name: z.string().trim().min(1, "Enter your full name."),
  phone: z.string().trim().min(1, "Enter a contact number."),
  social: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
  method: z.nativeEnum(FulfilMethod),
  address: z.string().trim().optional().default(""),
  pay: z.nativeEnum(PayMethod),
  payRef: z.string().trim().optional().default(""),
  proofUrl: z.string().trim().optional().default(""),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type PlaceOrderResult = { ok: true; ref: string } | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid order." };
  }
  const data = parsed.data;

  if (data.method === "MAXIM" && !data.address.trim()) {
    return { ok: false, error: "Delivery address is required for Maxim delivery." };
  }
  if (data.pay !== "CASH" && !data.proofUrl) {
    return { ok: false, error: "Upload your payment proof to continue." };
  }

  const batch = await prisma.batch.findFirst({ orderBy: { createdAt: "desc" } });
  if (!batch || !batch.isOpen) {
    return { ok: false, error: "This batch is closed for new orders." };
  }

  const totalQty = data.items.reduce((a, i) => a + i.qty, 0);
  if (totalQty < batch.minOrder) {
    return { ok: false, error: `Minimum order is ${batch.minOrder} cookies.` };
  }

  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of data.items) {
    const p = byId.get(item.productId);
    if (!p || !p.active) {
      return { ok: false, error: "One of the items in your box is no longer available." };
    }
    if (item.qty > p.stock) {
      return {
        ok: false,
        error: `Only ${p.stock} of ${p.name} left this batch — please adjust your box.`,
      };
    }
  }

  const ref = await prisma.$transaction(async (tx) => {
    const counter = await tx.counter.update({
      where: { id: "ref" },
      data: { nextRef: { increment: 1 } },
    });
    const ref = "CK-0" + counter.nextRef;

    await tx.order.create({
      data: {
        ref,
        batchCode: batch.code,
        customerName: data.name,
        phone: data.phone,
        social: data.social || data.phone,
        notes: data.notes,
        fulfilMethod: data.method,
        address: data.method === FulfilMethod.MAXIM ? data.address : null,
        payMethod: data.pay,
        payRef: data.payRef || null,
        proofUrl: data.pay === PayMethod.CASH ? null : data.proofUrl || null,
        payStatus: data.pay === PayMethod.CASH ? PayStatus.ON_PICKUP : PayStatus.PENDING,
        items: {
          create: data.items.map((i) => {
            const p = byId.get(i.productId)!;
            return {
              productId: p.id,
              productName: p.name,
              qty: i.qty,
              unitPrice: p.price,
            };
          }),
        },
      },
    });

    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    return ref;
  });

  return { ok: true, ref };
}

export type TrackOrderResult =
  | {
      ok: true;
      order: NonNullable<Awaited<ReturnType<typeof findTrackedOrder>>>;
    }
  | { ok: false };

async function findTrackedOrder(ref: string, phone: string) {
  const order = await prisma.order.findFirst({
    where: { ref: { equals: ref, mode: "insensitive" } },
    include: { items: true },
  });
  if (!order) return null;

  const digits = phone.replace(/\D/g, "");
  if (digits) {
    const orderDigits = order.phone.replace(/\D/g, "");
    if (!orderDigits.includes(digits)) return null;
  }
  return order;
}

export async function trackOrder(ref: string, phone: string): Promise<TrackOrderResult> {
  const cleanRef = ref.trim();
  if (!cleanRef) return { ok: false };
  const order = await findTrackedOrder(cleanRef, phone.trim());
  if (!order) return { ok: false };
  return { ok: true, order };
}
