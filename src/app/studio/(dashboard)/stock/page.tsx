import { prisma } from "@/lib/prisma";
import { StockAdminClient } from "@/components/studio/StockAdminClient";
import { updateProductStock } from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function StockAdminPage() {
  const [batch, products] = await Promise.all([
    prisma.batch.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <StockAdminClient
      products={products}
      batchCode={batch?.code ?? "—"}
      onSave={updateProductStock}
    />
  );
}
