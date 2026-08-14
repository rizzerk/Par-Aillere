"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus, PayStatus } from "@prisma/client";

async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
}

function revalidateOrder(ref: string) {
  revalidatePath("/studio/orders");
  revalidatePath(`/studio/orders/${ref}`);
  revalidatePath("/studio");
}

export async function updateOrderStatus(ref: string, status: OrderStatus) {
  await requireSeller();
  await prisma.order.update({ where: { ref }, data: { orderStatus: status } });
  revalidateOrder(ref);
}

export async function verifyPayment(ref: string) {
  await requireSeller();
  await prisma.order.update({
    where: { ref },
    data: { payStatus: PayStatus.VERIFIED, rejectReason: "" },
  });
  revalidateOrder(ref);
}

export async function rejectPayment(
  ref: string,
  reason: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireSeller();
  if (!reason.trim()) return { ok: false, error: "Reason is required." };
  await prisma.order.update({
    where: { ref },
    data: { payStatus: PayStatus.REJECTED, rejectReason: reason.trim() },
  });
  revalidateOrder(ref);
  return { ok: true };
}

export async function reopenPayment(ref: string) {
  await requireSeller();
  await prisma.order.update({
    where: { ref },
    data: { payStatus: PayStatus.PENDING, rejectReason: "" },
  });
  revalidateOrder(ref);
}
