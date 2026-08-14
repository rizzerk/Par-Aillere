import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { StorefrontClient } from "@/components/storefront/StorefrontClient";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [batch, products, settings] = await Promise.all([
    prisma.batch.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!batch) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-10 text-center">
        <p className="max-w-md text-lg font-light text-ink/70">
          The shop is still being set up — check back soon, or run{" "}
          <code>npm run db:seed</code> to load a starter batch and menu.
        </p>
      </div>
    );
  }

  const resolvedSettings = settings ?? {
    id: "singleton",
    gcashAccountName: "Par A. (Aillere Bakes)",
    gcashAccountNumber: "0917 000 0000",
    gotymeAccountName: "Par A. (Aillere Bakes)",
    gotymeAccountNumber: "0117 4482 0091",
    gcashQrUrl: null,
    gotymeQrUrl: null,
    heroImageUrl: null,
    aboutImageUrl: null,
  };

  return (
    <>
      <Suspense>
        <StorefrontClient products={products} batch={batch} settings={resolvedSettings} />
      </Suspense>
      <Footer minOrder={batch.minOrder} />
    </>
  );
}
