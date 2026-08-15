import { prisma } from "@/lib/prisma";
import { ProductTypesAdminClient } from "@/components/studio/ProductTypesAdminClient";
import { createProductType, renameProductType, deleteProductType } from "@/actions/productTypes";

export const dynamic = "force-dynamic";

export default async function ProductTypesPage() {
  const [types, products] = await Promise.all([
    prisma.productType.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ select: { type: true } }),
  ]);

  const counts: Record<string, number> = {};
  for (const p of products) counts[p.type] = (counts[p.type] ?? 0) + 1;

  return (
    <ProductTypesAdminClient
      types={types}
      counts={counts}
      actions={{ createProductType, renameProductType, deleteProductType }}
    />
  );
}
