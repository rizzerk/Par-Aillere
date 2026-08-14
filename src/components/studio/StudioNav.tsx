"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ADMIN_NAV } from "@/lib/constants";

export function StudioNav({
  batchCode,
  bannerStatus,
}: {
  batchCode: string;
  bannerStatus: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/14 bg-cream-warm px-6 py-3.5 sm:px-10">
      <div className="flex flex-wrap items-center gap-5">
        <span className="text-[13px] tracking-[0.32em] text-rust uppercase">
          Seller studio
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ADMIN_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                "rounded-sm px-4 py-2.5 text-[13px] tracking-[0.16em] whitespace-nowrap uppercase " +
                (isActive(n.href) ? "bg-maroon text-cream" : "text-ink/70 hover:text-ink")
              }
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="font-mono text-[13px] text-ink/70">
          {batchCode} · {bannerStatus}
        </span>
        <button
          type="button"
          onClick={async () => {
            await signOut({ redirect: false });
            router.push("/");
            router.refresh();
          }}
          className="cursor-pointer rounded-sm border border-ink/25 bg-transparent px-4 py-2.25 text-[13px] tracking-[0.15em] text-ink/70 uppercase"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
