import { prisma } from "@/lib/prisma";
import { ProductsAdminClient } from "@/components/studio/ProductsAdminClient";
import {
  addProduct,
  updateProductPrice,
  updateProductStock,
  updateProductType,
  updateProductDetails,
  toggleProductActive,
  deleteProduct,
  updateProductPhoto,
} from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const [products, types] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.productType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <ProductsAdminClient
      products={products}
      productTypes={types.map((t) => t.name)}
      actions={{
        addProduct,
        updateProductPrice,
        updateProductStock,
        updateProductType,
        updateProductDetails,
        toggleProductActive,
        deleteProduct,
        updateProductPhoto,
      }}
    />
  );
}
