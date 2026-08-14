import { PrismaClient } from "@prisma/client";

function isTransientConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      /Can't reach database server|P1001|P1017/.test(error.message))
  );
}

function createClient() {
  const client = new PrismaClient();
  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!isTransientConnectionError(error)) throw error;
          // Neon's compute can cold-start after auto-suspend; one retry after
          // a short delay is usually enough to ride out the wake-up latency.
          await new Promise((resolve) => setTimeout(resolve, 600));
          return await query(args);
        }
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
