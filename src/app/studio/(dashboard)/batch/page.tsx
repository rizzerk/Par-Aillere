import { prisma } from "@/lib/prisma";
import { BatchAdminClient } from "@/components/studio/BatchAdminClient";
import {
  toggleBatchOpen,
  startNextBatch,
  updateBatchFields,
  updateSettings,
} from "@/actions/batch";
import { updateProductStock, toggleProductActive } from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function BatchAdminPage() {
  const [batch, products, settings] = await Promise.all([
    prisma.batch.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!batch) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <p className="text-lg font-light text-ink/70">
          No batch found yet — run <code>npm run db:seed</code> to get started.
        </p>
      </div>
    );
  }

  const resolvedSettings =
    settings ??
    (await prisma.settings.create({
      data: { id: "singleton" },
    }));

  return (
    <BatchAdminClient
      batch={batch}
      products={products}
      settings={resolvedSettings}
      actions={{
        toggleBatchOpen,
        startNextBatch,
        updateBatchFields,
        updateSettings,
        updateProductStock,
        toggleProductActive,
      }}
    />
  );
}
