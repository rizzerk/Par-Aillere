import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderDetailClient } from "@/components/studio/OrderDetailClient";
import {
  updateOrderStatus,
  verifyPayment,
  rejectPayment,
  reopenPayment,
} from "@/actions/studio-orders";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const order = await prisma.order.findUnique({
    where: { ref },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <OrderDetailClient
      order={order}
      actions={{ updateOrderStatus, verifyPayment, rejectPayment, reopenPayment }}
    />
  );
}
