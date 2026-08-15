"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ProductCategory } from "@prisma/client";

async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "flavour"
  );
}

export async function addProduct(input: {
  name: string;
  type: string;
  price: number;
  stock: number;
  blurb: string;
}) {
  await requireSeller();
  if (!input.name.trim()) return;

  let slug = slugify(input.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const stock = Number.isFinite(input.stock) ? Math.max(0, Math.round(input.stock)) : 12;
  const price = Number.isFinite(input.price) ? Math.max(0, Math.round(input.price)) : 40;
  const blurb = input.blurb.trim() || "Filled, 45g dough";
  const type = input.type.trim() || "Cookies";

  await prisma.productType.upsert({ where: { name: type }, update: {}, create: { name: type } });

  await prisma.product.create({
    data: {
      slug,
      name: input.name.trim(),
      type,
      price,
      stock,
      planned: stock,
      active: true,
      category: ProductCategory.FILLED,
      allergens: ["Gluten", "Dairy", "Egg"],
      blurb,
      longDesc: blurb,
    },
  });

  revalidatePath("/studio/products");
  revalidatePath("/studio/batch");
  revalidatePath("/studio/stock");
  revalidatePath("/");
}

export async function updateProductType(id: string, type: string) {
  await requireSeller();
  const trimmed = type.trim();
  if (!trimmed) return;
  await prisma.productType.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
  await prisma.product.update({ where: { id }, data: { type: trimmed } });
  revalidatePath("/studio/products");
  revalidatePath("/studio/types");
  revalidatePath("/");
}

export async function updateProductPrice(id: string, price: number) {
  await requireSeller();
  await prisma.product.update({
    where: { id },
    data: { price: Math.max(0, Math.round(price)) },
  });
  revalidatePath("/studio/products");
  revalidatePath("/");
}

export async function updateProductStock(id: string, stock: number) {
  await requireSeller();
  await prisma.product.update({
    where: { id },
    data: { stock: Math.max(0, Math.round(stock)) },
  });
  revalidatePath("/studio/products");
  revalidatePath("/studio/batch");
  revalidatePath("/studio/stock");
  revalidatePath("/studio");
  revalidatePath("/");
}

export async function toggleProductActive(id: string) {
  await requireSeller();
  const p = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/studio/products");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await requireSeller();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/studio/products");
  revalidatePath("/studio/batch");
  revalidatePath("/studio/stock");
  revalidatePath("/");
}

export async function updateProductPhoto(id: string, photoUrl: string) {
  await requireSeller();
  await prisma.product.update({ where: { id }, data: { photoUrl } });
  revalidatePath("/studio/products");
  revalidatePath("/studio/stock");
  revalidatePath("/");
}
