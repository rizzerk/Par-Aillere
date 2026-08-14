"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
}

export async function toggleBatchOpen() {
  await requireSeller();
  const batch = await prisma.batch.findFirst({ orderBy: { createdAt: "desc" } });
  if (!batch) return;
  await prisma.batch.update({ where: { id: batch.id }, data: { isOpen: !batch.isOpen } });
  revalidatePath("/studio");
  revalidatePath("/studio/batch");
  revalidatePath("/");
}

export async function startNextBatch() {
  await requireSeller();
  const batch = await prisma.batch.findFirst({ orderBy: { createdAt: "desc" } });
  if (!batch) return;
  const num = parseInt(batch.code.replace(/[^0-9]/g, ""), 10) || 0;
  const products = await prisma.product.findMany();

  await prisma.$transaction([
    prisma.batch.create({
      data: {
        code: `BATCH ${num + 1}`,
        isOpen: true,
        cutoffLabel: batch.cutoffLabel,
        deliveryLabel: batch.deliveryLabel,
        minOrder: batch.minOrder,
      },
    }),
    ...products.map((p) =>
      prisma.product.update({ where: { id: p.id }, data: { stock: p.planned } })
    ),
  ]);

  revalidatePath("/studio");
  revalidatePath("/studio/batch");
  revalidatePath("/studio/stock");
  revalidatePath("/studio/products");
  revalidatePath("/");
}

export async function updateBatchFields(input: {
  cutoffLabel?: string;
  deliveryLabel?: string;
  minOrder?: number;
}) {
  await requireSeller();
  const batch = await prisma.batch.findFirst({ orderBy: { createdAt: "desc" } });
  if (!batch) return;
  await prisma.batch.update({
    where: { id: batch.id },
    data: {
      ...(input.cutoffLabel !== undefined ? { cutoffLabel: input.cutoffLabel } : {}),
      ...(input.deliveryLabel !== undefined ? { deliveryLabel: input.deliveryLabel } : {}),
      ...(input.minOrder !== undefined
        ? { minOrder: Math.max(0, Math.round(input.minOrder)) }
        : {}),
    },
  });
  revalidatePath("/studio");
  revalidatePath("/studio/batch");
  revalidatePath("/");
}

export async function updateSettings(
  input: Partial<{
    gcashAccountName: string;
    gcashAccountNumber: string;
    gotymeAccountName: string;
    gotymeAccountNumber: string;
    gcashQrUrl: string;
    gotymeQrUrl: string;
    heroImageUrl: string;
    aboutImageUrl: string;
  }>
) {
  await requireSeller();
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: input,
    create: { id: "singleton", ...input },
  });
  revalidatePath("/studio/batch");
  revalidatePath("/");
}
