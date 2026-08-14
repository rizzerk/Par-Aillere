import { prisma } from "@/lib/prisma";
import { OrdersAdminClient } from "@/components/studio/OrdersAdminClient";
import { updateOrderStatus } from "@/actions/studio-orders";

export const dynamic = "force-dynamic";

export default async function OrdersAdminPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return <OrdersAdminClient orders={orders} onStatusChange={updateOrderStatus} />;
}
