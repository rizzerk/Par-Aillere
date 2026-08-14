"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, cartCount } from "@/store/cart";
import { CUSTOMER_NAV } from "@/lib/constants";
import { SplashSheen } from "@/components/SplashSheen";

export function Header() {
  const items = useCartStore((s) => s.items);
  const count = cartCount(items);

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-6 overflow-hidden border-b border-blush/25 bg-maroon px-6 py-3 sm:px-10">
      <SplashSheen src="/assets/splash-a.png" />
      <Link href="/" className="relative flex items-center gap-3.5">
        <Image
          src="/assets/logo.jpg"
          alt="Par Aillere"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <span className="flex flex-col leading-none">
          <span className="font-script text-[25px] text-cream">Par Aillere</span>
          <span className="mt-1 text-xs tracking-[0.32em] text-gold uppercase">
            Homemade Artisan
          </span>
        </span>
      </Link>
      <div className="relative flex items-center gap-5">
        <nav className="hidden items-center gap-5 md:flex">
          {CUSTOMER_NAV.map((n) => (
            <Link
              key={n.href}
              href={`/${n.href}`}
              className="py-2.5 text-sm whitespace-nowrap tracking-[0.16em] text-cream/80 uppercase hover:text-cream"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#order"
          className={
            "rounded-full px-4 py-2 text-[13px] tracking-[0.16em] whitespace-nowrap uppercase " +
            (count > 0 ? "bg-cream text-maroon" : "bg-cream/15 text-cream")
          }
        >
          {count > 0 ? `Cart · ${count}` : "Cart"}
        </Link>
      </div>
    </div>
  );
}
