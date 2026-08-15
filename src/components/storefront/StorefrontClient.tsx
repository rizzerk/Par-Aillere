"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { Batch, Product, Settings } from "@prisma/client";
import { FulfilMethod, PayMethod } from "@prisma/client";
import { peso } from "@/lib/format";
import { CATEGORY_LABELS, ALLERGEN_FREE_OPTIONS, FAQS, CONTACT } from "@/lib/constants";
import { placeOrder, trackOrder, type TrackOrderResult } from "@/actions/orders";
import { useCartStore } from "@/store/cart";
import { scrollToHashLink } from "@/lib/scroll";
import { ProductCard } from "@/components/ProductCard";
import { UploadField } from "@/components/UploadField";
import { SplashSheen } from "@/components/SplashSheen";
import {
  Chip,
  Input,
  Textarea,
  SectionLabel,
  FieldLabel,
  OrderPill,
  PayPill,
} from "@/components/ui";

type TrackedOrder = Extract<TrackOrderResult, { ok: true }>["order"];

function orderTotal(items: { qty: number; unitPrice: number }[]) {
  return items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
}

export function StorefrontClient({
  products,
  batch,
  settings,
}: {
  products: Product[];
  batch: Batch;
  settings: Settings;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cartItems = useCartStore((s) => s.items);
  const bump = useCartStore((s) => s.bump);
  const removeFromCart = useCartStore((s) => s.remove);
  const clearCart = useCartStore((s) => s.clear);

  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState<"All" | "FILLED" | "NO_FILLING">("All");
  const [freeFilter, setFreeFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    social: "",
    notes: "",
    method: FulfilMethod.PICKUP as FulfilMethod,
    address: "",
    pay: PayMethod.GCASH as PayMethod,
    payRef: "",
    proofUrl: "",
  });
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const initialTrackRef = searchParams.get("trackRef") ?? "";
  const [trackForm, setTrackForm] = useState({ ref: initialTrackRef, phone: "" });
  const [trackState, setTrackState] = useState<"idle" | "found" | "missed">("idle");
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [trackPending, setTrackPending] = useState(false);

  useEffect(() => {
    if (!initialTrackRef) return;
    const timer = setTimeout(() => {
      document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = products.filter((p) => p.active);
  const productTypes = [...new Set(live.map((p) => p.type))].sort();
  const filtered = live.filter(
    (p) =>
      (typeFilter === "All" || p.type === typeFilter) &&
      (catFilter === "All" || p.category === catFilter) &&
      (freeFilter === "All" || !p.allergens.includes(freeFilter))
  );

  const byId = new Map(products.map((p) => [p.id, p]));
  const cartLines = Object.entries(cartItems)
    .map(([productId, qty]) => {
      const p = byId.get(productId);
      if (!p) return null;
      return { product: p, qty };
    })
    .filter((x): x is { product: Product; qty: number } => x !== null);

  const inCart = cartLines.reduce((a, l) => a + l.qty, 0);
  const total = cartLines.reduce((a, l) => a + l.qty * l.product.price, 0);
  const minMet = inCart >= batch.minOrder;

  async function handlePlaceOrder() {
    setPlaceError(null);
    if (!minMet || placing) return;
    if (!form.name.trim() || !form.phone.trim()) {
      setPlaceError("Enter your name and contact number.");
      return;
    }
    if (form.method === FulfilMethod.MAXIM && !form.address.trim()) {
      setPlaceError("Delivery address is required for Maxim delivery.");
      return;
    }
    if (form.pay !== PayMethod.CASH && !form.proofUrl) {
      setPlaceError("Upload your payment proof to continue.");
      return;
    }

    setPlacing(true);
    const result = await placeOrder({
      items: cartLines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      name: form.name,
      phone: form.phone,
      social: form.social,
      notes: form.notes,
      method: form.method,
      address: form.address,
      pay: form.pay,
      payRef: form.payRef,
      proofUrl: form.proofUrl,
    });
    setPlacing(false);

    if (!result.ok) {
      setPlaceError(result.error);
      return;
    }
    clearCart();
    router.push(`/order/${result.ref}`);
  }

  async function handleTrack() {
    if (trackPending) return;
    setTrackPending(true);
    const result = await trackOrder(trackForm.ref, trackForm.phone);
    setTrackPending(false);
    if (result.ok) {
      setTrackedOrder(result.order);
      setTrackState("found");
    } else {
      setTrackedOrder(null);
      setTrackState("missed");
    }
  }

  const needsAddress = form.method === FulfilMethod.MAXIM;
  const needsProof = form.pay !== PayMethod.CASH;
  const isCash = form.pay === PayMethod.CASH;
  const isGCash = form.pay === PayMethod.GCASH;
  const qrUrl = isGCash ? settings.gcashQrUrl : settings.gotymeQrUrl;
  const payAccountName = isGCash ? settings.gcashAccountName : settings.gotymeAccountName;
  const payAccountNo = isGCash ? settings.gcashAccountNumber : settings.gotymeAccountNumber;

  return (
    <div>
      <div className="flex items-center justify-center gap-5 bg-cream-warm px-6 py-3.5 text-maroon-deep sm:px-10">
        <span className="text-sm tracking-[0.24em] uppercase">
          {batch.isOpen ? "Batch open" : "Batch closed"}
        </span>
        <span className="font-mono text-sm tracking-[0.06em]">
          {batch.isOpen
            ? `${batch.code} · order by ${batch.cutoffLabel} · baked ${batch.deliveryLabel}`
            : `Next batch opens soon — follow ${CONTACT.instagramHandle} for the drop`}
        </span>
      </div>

      <div
        id="home"
        className="relative grid grid-cols-1 items-center gap-14 overflow-hidden bg-maroon px-6 py-16 text-cream sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-24"
      >
        <div className="relative max-w-xl">
          <div className="text-sm tracking-[0.4em] text-gold uppercase">
            Baked to order · Cebu City
          </div>
          <h1 className="mt-5 font-serif text-5xl leading-[1.02] font-light lg:text-7xl">
            Thick, filled treats
            <br />
            <em className="text-blush not-italic italic">made in small batches.</em>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed font-light text-cream/90">
            Cookies with a molten centre, brownies cut thick and fudgy — folded and baked
            by hand the night before you eat them.
          </p>
          <div className="mt-9 flex items-center gap-3.5">
            <Link
              href="/#menu"
              onClick={(e) => scrollToHashLink(e, "/#menu")}
              className="rounded-sm bg-cream px-7 py-3.5 text-[15px] tracking-[0.17em] text-maroon uppercase"
            >
              Shop the menu
            </Link>
            <Link
              href="/#about"
              onClick={(e) => scrollToHashLink(e, "/#about")}
              className="rounded-sm border border-blush/45 px-6 py-3.5 text-[15px] tracking-[0.17em] text-blush uppercase"
            >
              Our story
            </Link>
          </div>
          <div className="mt-12 flex gap-8 border-t border-blush/20 pt-6">
            <div>
              <div className="text-3xl font-light">{batch.minOrder}</div>
              <div className="mt-1 text-sm tracking-[0.2em] text-gold uppercase">
                Minimum order
              </div>
            </div>
            <div>
              <div className="text-3xl font-light">{live.length}</div>
              <div className="mt-1 text-sm tracking-[0.2em] text-gold uppercase">
                Flavours this batch
              </div>
            </div>
            <div>
              <div className="text-3xl font-light">{batch.code}</div>
              <div className="mt-1 text-sm tracking-[0.2em] text-gold uppercase">
                Current batch
              </div>
            </div>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="aspect-[3/4] w-full max-w-md border border-blush/35 p-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.heroImageUrl || "/assets/hero.jpg"}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div id="menu" className="relative mx-auto max-w-6xl overflow-hidden px-6 pt-16 pb-24 sm:px-10">
        <Image
          src="/assets/flower-d.png"
          alt=""
          width={102}
          height={140}
          className="pointer-events-none absolute right-6 bottom-0 hidden sm:block"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionLabel>The Menu</SectionLabel>
            <h2 className="mt-3 text-4xl font-light lg:text-5xl">
              {batch.code} — this week&apos;s bake
            </h2>
          </div>
          <p className="max-w-md font-mono text-sm leading-loose text-ink/70">
            Orders for {batch.code} close {batch.cutoffLabel}. Baked for{" "}
            {batch.deliveryLabel}. Minimum {batch.minOrder} pieces.
          </p>
        </div>

        <div className="relative mt-7 flex flex-wrap items-center gap-5 border-t border-b border-ink/18 py-4.5">
          {productTypes.length > 1 && (
            <>
              <span className="text-[13px] tracking-[0.2em] text-ink/62 uppercase">
                Product
              </span>
              <div className="flex flex-wrap gap-2">
                <Chip active={typeFilter === "All"} onClick={() => setTypeFilter("All")}>
                  All
                </Chip>
                {productTypes.map((t) => (
                  <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </>
          )}
          <span className="text-[13px] tracking-[0.2em] text-ink/62 uppercase">Style</span>
          <div className="flex flex-wrap gap-2">
            {(["All", "FILLED", "NO_FILLING"] as const).map((c) => (
              <Chip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
                {c === "All" ? "All" : CATEGORY_LABELS[c]}
              </Chip>
            ))}
          </div>
          <span className="ml-3 text-[13px] tracking-[0.2em] text-ink/62 uppercase">
            Free from
          </span>
          <div className="flex flex-wrap gap-2">
            <Chip active={freeFilter === "All"} onClick={() => setFreeFilter("All")}>
              All
            </Chip>
            {ALLERGEN_FREE_OPTIONS.map((a) => (
              <Chip key={a.key} active={freeFilter === a.key} onClick={() => setFreeFilter(a.key)}>
                {a.label}
              </Chip>
            ))}
          </div>
          <span className="ml-auto font-mono text-[13px] text-ink/62">
            {filtered.length} of {live.length} flavours
          </span>
        </div>

        <div className="relative mt-9 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden bg-cream-warm px-6 pt-16 pb-24 sm:px-10">
        <Image
          src="/assets/flower-c.png"
          alt=""
          width={72}
          height={135}
          className="pointer-events-none absolute bottom-0 left-6 hidden sm:block"
        />
        <div id="order" className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <SectionLabel>Your box &amp; checkout</SectionLabel>
              <h2 className="mt-3 text-4xl font-light lg:text-5xl">
                Build it, then tell us where to send it
              </h2>
            </div>
            <p
              className={
                "max-w-sm font-mono text-sm leading-loose " +
                (minMet ? "text-maroon-deep" : "text-ink/60")
              }
            >
              {minMet
                ? `Minimum met — ${inCart} in the box. Pick up or Maxim only.`
                : `Minimum order is ${batch.minOrder} pieces. ${
                    inCart === 0
                      ? "Pick your flavours above."
                      : `Add ${batch.minOrder - inCart} more.`
                  }`}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-start gap-7 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="flex flex-col gap-6">
              <div className="border border-ink/14 bg-cream-card">
                <div className="border-b border-ink/12 px-6 py-4 text-[13px] tracking-[0.24em] text-rust uppercase">
                  1 — Your box
                </div>
                {cartLines.length === 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-6">
                    <p className="m-0 text-lg font-light text-ink/70">
                      Nothing in the box yet — minimum order is {batch.minOrder} pieces,
                      mix any flavours you like.
                    </p>
                    <Link
                      href="/#menu"
                      onClick={(e) => scrollToHashLink(e, "/#menu")}
                      className="rounded-sm bg-maroon px-5 py-3 text-[14px] whitespace-nowrap text-cream uppercase"
                    >
                      Pick flavours
                    </Link>
                  </div>
                ) : (
                  cartLines.map((l) => (
                    <div
                      key={l.product.id}
                      className="grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-3 border-b border-ink/8 px-4 py-4 sm:grid-cols-[56px_1fr_auto_auto_auto] sm:gap-4 sm:px-6"
                    >
                      <div
                        className="h-14 w-14 flex-none overflow-hidden"
                        style={
                          l.product.photoUrl
                            ? {
                                backgroundImage: `url(${l.product.photoUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : {
                                backgroundImage:
                                  "repeating-linear-gradient(135deg, rgba(92,16,21,0.14) 0 6px, rgba(92,16,21,0.04) 6px 12px)",
                              }
                        }
                      />
                      <div>
                        <div className="text-xl">{l.product.name}</div>
                        <div className="mt-1 font-mono text-[13px] text-ink/66">
                          {peso(l.product.price)} each · {CATEGORY_LABELS[l.product.category].toLowerCase()}
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-between gap-3 sm:contents">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => bump(l.product.id, -1)}
                            className="h-8 w-8 cursor-pointer border border-ink/25 bg-transparent text-base"
                          >
                            −
                          </button>
                          <span className="min-w-9 text-center text-lg">{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => bump(l.product.id, 1)}
                            className="h-8 w-8 cursor-pointer border border-ink/25 bg-transparent text-base"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-lg text-rust sm:min-w-20 sm:text-right">
                          {peso(l.product.price * l.qty)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(l.product.id)}
                          className="cursor-pointer bg-transparent px-2 py-2 text-[13px] tracking-[0.15em] text-ink/66 uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border border-ink/14 bg-cream-card p-6">
                <div className="text-[13px] tracking-[0.24em] text-rust uppercase">
                  2 — Contact
                </div>
                <div className="mt-4.5 grid grid-cols-1 gap-4.5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <FieldLabel>Full name</FieldLabel>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Juana Dela Cruz"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <FieldLabel>Contact number</FieldLabel>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="0917 000 0000"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <FieldLabel>IG or FB handle</FieldLabel>
                    <Input
                      value={form.social}
                      onChange={(e) => setForm((f) => ({ ...f, social: e.target.value }))}
                      placeholder="@juana"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <FieldLabel>Notes</FieldLabel>
                    <Input
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Pickup time, allergies…"
                    />
                  </label>
                </div>
              </div>

              <div className="border border-ink/14 bg-cream-card p-6">
                <div className="text-[13px] tracking-[0.24em] text-rust uppercase">
                  3 — Delivery
                </div>
                <div className="mt-4.5 flex flex-wrap gap-2.5">
                  <Chip
                    active={form.method === FulfilMethod.PICKUP}
                    onClick={() => setForm((f) => ({ ...f, method: FulfilMethod.PICKUP }))}
                  >
                    Pick up (Cainta)
                  </Chip>
                  <Chip
                    active={form.method === FulfilMethod.MAXIM}
                    onClick={() => setForm((f) => ({ ...f, method: FulfilMethod.MAXIM }))}
                  >
                    Maxim delivery
                  </Chip>
                </div>
                {needsAddress && (
                  <label className="mt-4.5 flex flex-col gap-2">
                    <FieldLabel>Delivery address</FieldLabel>
                    <Textarea
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      rows={2}
                      placeholder="Unit, street, barangay, city — Maxim fare paid on arrival"
                    />
                  </label>
                )}
                {!needsAddress && (
                  <p className="mt-4 font-mono text-[13px] leading-loose text-ink/66">
                    Pickup in Cainta, 2–7pm on {batch.deliveryLabel}. Exact address sent
                    when we confirm.
                  </p>
                )}
              </div>

              <div className="border border-ink/14 bg-cream-card p-6">
                <div className="text-[13px] tracking-[0.24em] text-rust uppercase">
                  4 — Payment
                </div>
                <div className="mt-4.5 flex flex-wrap gap-2.5">
                  {(
                    [
                      [PayMethod.GCASH, "GCash"],
                      [PayMethod.GOTYME, "GoTyme"],
                      [PayMethod.CASH, "Cash on pickup"],
                    ] as const
                  ).map(([val, label]) => (
                    <Chip
                      key={val}
                      active={form.pay === val}
                      onClick={() => setForm((f) => ({ ...f, pay: val }))}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>

                {needsProof && (
                  <>
                    <div className="mt-5 flex flex-col gap-6 border border-gold/55 bg-gold/8 p-5.5 sm:flex-row">
                      <div className="flex-none">
                        <div className="h-44 w-44 border border-ink/16 bg-cream-card p-2.5">
                          {qrUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={qrUrl}
                              alt="Payment QR"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-center font-mono text-xs text-ink/50">
                              QR not yet uploaded
                            </div>
                          )}
                        </div>
                        <div className="mt-2.5 text-center font-mono text-[13px] text-ink/62">
                          {isGCash ? "GCash QR" : "GoTyme QR"}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] tracking-[0.18em] text-rust uppercase">
                          Scan to pay · {isGCash ? "GCash" : "GoTyme"}
                        </div>
                        <div className="mt-2 text-3xl leading-none font-light">
                          {peso(total)}
                        </div>
                        <div className="mt-4.5 flex flex-col gap-3 border-t border-ink/14 pt-4">
                          <div className="flex items-baseline gap-3.5">
                            <span className="w-18 flex-none text-[13px] tracking-[0.15em] text-ink/62 uppercase">
                              Name
                            </span>
                            <span className="text-lg font-light">{payAccountName}</span>
                          </div>
                          <div className="flex items-baseline gap-3.5">
                            <span className="w-18 flex-none text-[13px] tracking-[0.15em] text-ink/62 uppercase">
                              Number
                            </span>
                            <span className="font-mono text-lg tracking-[0.04em]">
                              {payAccountNo}
                            </span>
                          </div>
                        </div>
                        <p className="mt-4 font-mono text-[13px] leading-loose text-ink/66">
                          Screenshot the receipt after paying — upload it below so we can
                          reserve your box.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-5 border-t border-ink/14 pt-5 sm:grid-cols-2">
                      <div>
                        <div className="text-[13px] tracking-[0.18em] text-ink/70 uppercase">
                          Payment proof
                        </div>
                        <p className="mt-2 mb-2.5 font-mono text-[13px] leading-loose text-ink/66">
                          Send to {isGCash ? "GCash" : "GoTyme"} {payAccountNo} (
                          {payAccountName})
                        </p>
                        <UploadField
                          endpoint="paymentProof"
                          value={form.proofUrl}
                          placeholder="Tap to upload your payment screenshot"
                          onChange={(url) => setForm((f) => ({ ...f, proofUrl: url }))}
                        />
                      </div>
                      <label className="flex flex-col gap-2">
                        <FieldLabel>Reference number</FieldLabel>
                        <Input
                          value={form.payRef}
                          onChange={(e) => setForm((f) => ({ ...f, payRef: e.target.value }))}
                          placeholder="e.g. 0092 8471 2233"
                        />
                        <span className="font-mono text-[13px] leading-loose text-ink/66">
                          We verify manually — your box is reserved once the proof
                          checks out.
                        </span>
                      </label>
                    </div>
                  </>
                )}
                {isCash && (
                  <p className="mt-4 font-mono text-[13px] leading-loose text-ink/66">
                    Cash on pickup. Please bring exact change if you can.
                  </p>
                )}
              </div>
            </div>

            <div className="relative order-first overflow-hidden bg-maroon p-7 text-cream lg:sticky lg:top-24 lg:order-none">
              <SplashSheen src="/assets/splash-b.png" />
              <div className="relative">
                <div className="text-[13px] tracking-[0.32em] text-gold uppercase">
                  Order summary
                </div>
                <div className="mt-4.5">
                  {cartLines.map((l) => (
                    <div
                      key={l.product.id}
                      className="flex items-baseline justify-between gap-3.5 border-b border-blush/18 py-2.75"
                    >
                      <span className="text-lg">
                        {l.qty} × {l.product.name}
                      </span>
                      <span className="text-lg text-blush">
                        {peso(l.product.price * l.qty)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <span className="text-[13px] tracking-[0.24em] text-gold uppercase">
                    Total
                  </span>
                  <span className="text-3xl font-light">{peso(total)}</span>
                </div>
                {placeError && (
                  <p className="mt-3 font-mono text-[13px] leading-loose text-gold">
                    {placeError}
                  </p>
                )}
                <button
                  type="button"
                  disabled={!minMet || placing}
                  onClick={handlePlaceOrder}
                  className={
                    "mt-5 w-full rounded-sm border-none px-5 py-4 text-[14px] tracking-[0.17em] uppercase " +
                    (minMet && !placing
                      ? "cursor-pointer bg-cream text-maroon"
                      : "cursor-not-allowed bg-cream/18 text-cream/50")
                  }
                >
                  {placing
                    ? "Placing order…"
                    : minMet
                      ? "Place order"
                      : `Minimum ${batch.minOrder} pieces`}
                </button>
                <p className="mt-3.5 font-mono text-[13px] leading-loose text-blush/65">
                  {isCash
                    ? "We'll message you to confirm your pickup slot."
                    : "We verify your payment proof manually, then message you to confirm."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="track" className="mx-auto max-w-6xl px-6 pt-16 pb-16 sm:px-10">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionLabel>Track order</SectionLabel>
            <h2 className="mt-3 mb-2.5 text-4xl leading-tight font-light">
              Where&apos;s my box?
            </h2>
            <p className="m-0 text-lg font-light text-ink/70">
              No account needed — your reference number and the mobile you ordered with
              is enough.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 items-end gap-4 border border-ink/16 bg-cream-card p-6 sm:grid-cols-[1fr_1fr_auto]">
              <label className="flex flex-col gap-2">
                <FieldLabel>Reference number</FieldLabel>
                <Input
                  value={trackForm.ref}
                  onChange={(e) => setTrackForm((f) => ({ ...f, ref: e.target.value }))}
                  placeholder="CK-0842"
                />
              </label>
              <label className="flex flex-col gap-2">
                <FieldLabel>Mobile number</FieldLabel>
                <Input
                  value={trackForm.phone}
                  onChange={(e) => setTrackForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0917 000 0000"
                />
              </label>
              <button
                type="button"
                onClick={handleTrack}
                disabled={trackPending}
                className="cursor-pointer rounded-sm border-none bg-maroon px-6.5 py-3.5 text-[14px] whitespace-nowrap text-cream uppercase"
              >
                {trackPending ? "Looking up…" : "Look up"}
              </button>
            </div>

            {trackState === "missed" && (
              <p className="mt-4 font-mono text-sm leading-loose text-rust">
                No order matches that reference and number. Check your confirmation
                message, or send us a DM.
              </p>
            )}

            {trackState === "found" && trackedOrder && (
              <div className="mt-5 border border-ink/16 bg-cream-card">
                <div className="flex flex-wrap items-center justify-between gap-5 bg-cream-warm px-6 py-5">
                  <div>
                    <div className="font-mono text-xl tracking-[0.06em]">
                      {trackedOrder.ref}
                    </div>
                    <div className="mt-1 font-mono text-[13px] text-ink/66">
                      {trackedOrder.createdAt.toLocaleString("en-PH")} ·{" "}
                      {trackedOrder.batchCode}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <OrderPill status={trackedOrder.orderStatus} />
                    <PayPill status={trackedOrder.payStatus} />
                  </div>
                </div>
                {trackedOrder.payStatus === "REJECTED" && (
                  <div className="border-b border-ink/10 bg-maroon-deep/7 px-6 py-4.5">
                    <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                      Payment rejected
                    </div>
                    <p className="mt-2 text-lg font-light text-ink/80">
                      {trackedOrder.rejectReason}
                    </p>
                  </div>
                )}
                <div className="px-6 py-5">
                  {trackedOrder.items.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5"
                    >
                      <span className="text-lg">
                        {i.qty} × {i.productName}
                      </span>
                      <span className="text-lg text-rust">{peso(i.qty * i.unitPrice)}</span>
                    </div>
                  ))}
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-[13px] tracking-[0.2em] text-ink/66 uppercase">
                      {trackedOrder.fulfilMethod === "PICKUP" ? "Pick up" : "Maxim"} ·{" "}
                      {trackedOrder.payMethod}
                    </span>
                    <span className="text-2xl font-light">
                      {peso(orderTotal(trackedOrder.items))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="about" className="relative overflow-hidden bg-cream-warm px-6 py-20 sm:px-10">
        <Image
          src="/assets/flower-a.svg"
          alt=""
          width={130}
          height={124}
          className="pointer-events-none absolute bottom-1.5 left-6 hidden sm:block"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-ink/20 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.aboutImageUrl || "/assets/about.jpg"}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </div>
          <div>
            <SectionLabel>About</SectionLabel>
            <h2 className="mt-4 text-4xl leading-tight font-light lg:text-5xl">
              A small kitchen, {live.length} recipes, no shortcuts.
            </h2>
            <p className="mt-5 max-w-xl text-xl leading-relaxed font-light text-ink/75">
              Par Aillere started as a Sunday habit — one tray, too much dough,
              neighbours who kept asking. Every batch is still scooped by hand, chilled
              overnight and baked the morning it&apos;s collected.
            </p>
            <p className="mt-4 max-w-xl text-xl leading-relaxed font-light text-ink/75">
              We keep the menu short so nothing sits in a display case. What you order
              is what comes out of the oven that day, and when a batch closes it&apos;s
              because the kitchen is full.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-ink/18 pt-6">
              <div>
                <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                  Baking days
                </div>
                <p className="mt-2 text-base font-light text-ink/75">Thursday to Sunday</p>
              </div>
              <div>
                <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                  Pickup
                </div>
                <p className="mt-2 text-base font-light text-ink/75">Cainta, 2–7pm</p>
              </div>
              <div>
                <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                  Reach us
                </div>
                <p className="mt-2 text-base font-light text-ink/75">
                  {CONTACT.instagramHandle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="faq" className="relative mx-auto max-w-6xl overflow-hidden px-6 pt-16 pb-24 sm:px-10">
        <Image
          src="/assets/flower-f.png"
          alt=""
          width={74}
          height={138}
          className="pointer-events-none absolute right-6 bottom-0 hidden sm:block"
        />
        <div className="relative grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 text-4xl leading-tight font-light">Before you order</h2>
          </div>
          <div>
            {FAQS.map((f) => (
              <div key={f.q} className="border-t border-ink/18 py-5.5">
                <h3 className="m-0 text-2xl font-normal">{f.q}</h3>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed font-light text-ink/75">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="contact" className="bg-cream-warm px-6 py-19 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <SectionLabel>Contact</SectionLabel>
              <h2 className="mt-3 text-4xl font-light">Say hello</h2>
            </div>
            <Link
              href="/#menu"
              onClick={(e) => scrollToHashLink(e, "/#menu")}
              className="rounded-sm bg-maroon px-6.5 py-3.5 text-[14px] whitespace-nowrap text-cream uppercase"
            >
              Start an order
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-ink/14 bg-cream-card p-6.5">
              <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                Instagram
              </div>
              <p className="mt-3 text-2xl font-light">
                <Link href={CONTACT.instagramUrl}>{CONTACT.instagramHandle}</Link>
              </p>
              <p className="mt-2.5 font-mono text-[13px] leading-loose text-ink/66">
                Fastest for orders and batch updates.
              </p>
            </div>
            <div className="border border-ink/14 bg-cream-card p-6.5">
              <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                Facebook
              </div>
              <p className="mt-3 text-2xl font-light">
                <Link href={CONTACT.facebookUrl}>{CONTACT.facebookLabel}</Link>
              </p>
              <p className="mt-2.5 font-mono text-[13px] leading-loose text-ink/66">
                Messenger replies within the day.
              </p>
            </div>
            <div className="border border-ink/14 bg-cream-card p-6.5">
              <div className="text-[13px] tracking-[0.2em] text-rust uppercase">
                Phone &amp; email
              </div>
              <p className="mt-3 text-xl font-light">{CONTACT.phone}</p>
              <p className="mt-1 text-lg font-light">{CONTACT.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
