import { SplashSheen } from "@/components/SplashSheen";

export function Footer({ minOrder }: { minOrder: number }) {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden bg-ink px-6 py-9 text-cream/82 sm:px-10">
      <SplashSheen src="/assets/splash-a.png" />
      <span className="relative font-script text-2xl text-cream">Par Aillere</span>
      <span className="relative font-mono text-[13px] tracking-[0.1em]">
        Homemade artisan cookies &middot; Minimum order of {minOrder} &middot; Pick up or
        Maxim only
      </span>
    </div>
  );
}
