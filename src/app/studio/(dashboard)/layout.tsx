import { prisma } from "@/lib/prisma";
import { StudioNav } from "@/components/studio/StudioNav";

export const dynamic = "force-dynamic";

export default async function StudioDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const batch = await prisma.batch.findFirst({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen bg-cream">
      <StudioNav
        batchCode={batch?.code ?? "—"}
        bannerStatus={batch?.isOpen ? "Batch open" : "Batch closed"}
      />
      {children}
    </div>
  );
}
