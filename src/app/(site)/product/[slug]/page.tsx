import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { peso } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/constants";
import { StockDot } from "@/components/ui";
import { Footer } from "@/components/Footer";
import { ProductDetailActions } from "@/components/storefront/ProductDetailActions";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, batch] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.batch.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!product || !product.active) notFound();

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-24 sm:px-10">
        <Link
          href="/#menu"
          className="inline-block py-2 text-[14px] tracking-[0.17em] text-rust uppercase"
        >
          ← Back to menu
        </Link>
        <div className="mt-5 grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div className="border border-ink/16 p-3.5">
            <div className="relative flex aspect-square items-end overflow-hidden p-5">
              {product.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.photoUrl}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, rgba(92,16,21,0.12) 0 8px, rgba(92,16,21,0.03) 8px 16px)",
                    }}
                  />
                  <span className="relative font-mono text-sm text-ink/66">
                    [ product photo — {product.name.toLowerCase()} ]
                  </span>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm tracking-[0.4em] text-rust uppercase">
              {product.type} &middot; {CATEGORY_LABELS[product.category]}
            </div>
            <h1 className="mt-3.5 text-5xl leading-[1.05] font-light lg:text-6xl">
              {product.name}
            </h1>
            <div className="mt-3.5 flex items-baseline gap-4">
              <span className="text-4xl text-rust">{peso(product.price)}</span>
              <span className="flex items-center gap-2 font-mono text-sm text-ink/70">
                <StockDot stock={product.stock} />
                {product.stock === 0
                  ? "Sold out this batch"
                  : `${product.stock} left this batch`}
              </span>
            </div>
            <p className="mt-5.5 max-w-xl text-xl leading-relaxed font-light text-ink/78">
              {product.longDesc}
            </p>
            <div className="mt-7 border-t border-ink/18 pt-5.5">
              <div className="text-[13px] tracking-[0.2em] text-ink/66 uppercase">
                Contains
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.allergens.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-maroon-deep/30 px-3.5 py-1.75 text-sm tracking-[0.14em] text-maroon-deep uppercase"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <p className="mt-3.5 font-mono text-[13px] leading-loose text-ink/66">
                Baked in a home kitchen that also handles nuts, dairy, egg and wheat.
              </p>
            </div>
            <ProductDetailActions
              productId={product.id}
              stock={product.stock}
              minOrder={batch?.minOrder ?? 1}
            />
          </div>
        </div>
      </div>
      <Footer minOrder={batch?.minOrder ?? 4} />
    </>
  );
}
