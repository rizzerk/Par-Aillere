import { prisma } from "@/lib/prisma";
import { ProductsAdminClient } from "@/components/studio/ProductsAdminClient";
import {
  addProduct,
  updateProductPrice,
  updateProductStock,
  updateProductType,
  toggleProductActive,
  deleteProduct,
  updateProductPhoto,
} from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <ProductsAdminClient
      products={products}
      actions={{
        addProduct,
        updateProductPrice,
        updateProductStock,
        updateProductType,
        toggleProductActive,
        deleteProduct,
        updateProductPhoto,
      }}
    />
  );
}
