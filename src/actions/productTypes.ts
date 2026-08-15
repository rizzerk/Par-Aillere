"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
}

function revalidateTypePages() {
  revalidatePath("/studio/types");
  revalidatePath("/studio/products");
  revalidatePath("/");
}

export async function createProductType(name: string) {
  await requireSeller();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Type name can't be empty." };

  const existing = await prisma.productType.findUnique({ where: { name: trimmed } });
  if (existing) return { ok: false, error: `"${trimmed}" already exists.` };

  await prisma.productType.create({ data: { name: trimmed } });
  revalidateTypePages();
  return { ok: true };
}

export async function renameProductType(id: string, name: string) {
  await requireSeller();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Type name can't be empty." };

  const current = await prisma.productType.findUniqueOrThrow({ where: { id } });
  if (trimmed === current.name) return { ok: true };

  const clash = await prisma.productType.findUnique({ where: { name: trimmed } });
  if (clash) return { ok: false, error: `"${trimmed}" already exists.` };

  await prisma.$transaction([
    prisma.productType.update({ where: { id }, data: { name: trimmed } }),
    prisma.product.updateMany({ where: { type: current.name }, data: { type: trimmed } }),
  ]);

  revalidateTypePages();
  return { ok: true };
}

export async function deleteProductType(id: string) {
  await requireSeller();
  const type = await prisma.productType.findUniqueOrThrow({ where: { id } });
  const inUse = await prisma.product.count({ where: { type: type.name } });
  if (inUse > 0) {
    return {
      ok: false,
      error: `${inUse} product${inUse === 1 ? "" : "s"} still use "${type.name}" — change their type on the Products page first.`,
    };
  }

  await prisma.productType.delete({ where: { id } });
  revalidateTypePages();
  return { ok: true };
}
