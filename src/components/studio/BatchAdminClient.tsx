"use client";

import { useState } from "react";
import type { Batch, Product, Settings } from "@prisma/client";
import { peso } from "@/lib/format";
import { DarkInput, Input } from "@/components/ui";
import { InlineNumberField } from "@/components/studio/InlineNumberField";
import { SellerImageUpload } from "@/components/studio/SellerImageUpload";
import { SplashSheen } from "@/components/SplashSheen";

type Actions = {
  toggleBatchOpen: () => Promise<void>;
  startNextBatch: () => Promise<void>;
  updateBatchFields: (input: {
    cutoffLabel?: string;
    deliveryLabel?: string;
    minOrder?: number;
  }) => Promise<void>;
  updateSettings: (
    input: Partial<{
      gcashAccountName: string;
      gcashAccountNumber: string;
      gotymeAccountName: string;
      gotymeAccountNumber: string;
      gcashQrUrl: string;
      gotymeQrUrl: string;
      heroImageUrl: string;
      aboutImageUrl: string;
    }>
  ) => Promise<void>;
  updateProductStock: (id: string, stock: number) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
};

export function BatchAdminClient({
  batch,
  products,
  settings,
  actions,
}: {
  batch: Batch;
  products: Product[];
  settings: Settings;
  actions: Actions;
}) {
  const [cutoff, setCutoff] = useState(batch.cutoffLabel);
  const [syncedCutoff, setSyncedCutoff] = useState(batch.cutoffLabel);
  const [delivery, setDelivery] = useState(batch.deliveryLabel);
  const [syncedDelivery, setSyncedDelivery] = useState(batch.deliveryLabel);
  const [minOrder, setMinOrder] = useState(String(batch.minOrder));
  const [syncedMinOrder, setSyncedMinOrder] = useState(batch.minOrder);
  const [starting, setStarting] = useState(false);

  if (batch.cutoffLabel !== syncedCutoff) {
    setSyncedCutoff(batch.cutoffLabel);
    setCutoff(batch.cutoffLabel);
  }
  if (batch.deliveryLabel !== syncedDelivery) {
    setSyncedDelivery(batch.deliveryLabel);
    setDelivery(batch.deliveryLabel);
  }
  if (batch.minOrder !== syncedMinOrder) {
    setSyncedMinOrder(batch.minOrder);
    setMinOrder(String(batch.minOrder));
  }

  const planned = products.reduce((a, p) => a + p.planned, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-11 sm:px-10">
      <div className="text-sm tracking-[0.4em] text-rust uppercase">
        Batch management
      </div>
      <h1 className="mt-3 mb-7.5 text-4xl font-light lg:text-5xl">Cycle &amp; cutoffs</h1>

      <div className="grid grid-cols-1 items-start gap-6.5 lg:grid-cols-[1fr_1.2fr]">
        <div className="relative overflow-hidden bg-maroon p-7.5 text-cream">
          <SplashSheen src="/assets/splash-b.png" />
          <div className="relative text-[13px] tracking-[0.32em] text-gold uppercase">
            Current batch
          </div>
          <div className="relative mt-2.5 font-mono text-3xl tracking-[0.06em]">
            {batch.code}
          </div>
          <div className="relative mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.75">
              <span className="text-[13px] tracking-[0.17em] text-blush/70 uppercase">
                Order cutoff
              </span>
              <DarkInput
                value={cutoff}
                onChange={(e) => setCutoff(e.target.value)}
                onBlur={() => {
                  if (cutoff !== batch.cutoffLabel) void actions.updateBatchFields({ cutoffLabel: cutoff });
                }}
              />
            </label>
            <label className="flex flex-col gap-1.75">
              <span className="text-[13px] tracking-[0.17em] text-blush/70 uppercase">
                Pickup / delivery day
              </span>
              <DarkInput
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                onBlur={() => {
                  if (delivery !== batch.deliveryLabel)
                    void actions.updateBatchFields({ deliveryLabel: delivery });
                }}
              />
            </label>
            <label className="flex flex-col gap-1.75">
              <span className="text-[13px] tracking-[0.17em] text-blush/70 uppercase">
                Minimum order
              </span>
              <DarkInput
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={() => {
                  const n = parseInt(minOrder, 10) || 0;
                  setMinOrder(String(n));
                  if (n !== batch.minOrder) void actions.updateBatchFields({ minOrder: n });
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => void actions.toggleBatchOpen()}
              className="cursor-pointer rounded-sm border-none bg-cream px-5 py-3.25 text-[14px] tracking-[0.16em] text-maroon uppercase"
            >
              {batch.isOpen ? "Close batch" : "Open batch"}
            </button>
            <button
              type="button"
              disabled={starting}
              onClick={async () => {
                if (!confirm(`Start ${nextCode(batch.code)}? This resets every product's stock to its planned amount.`)) return;
                setStarting(true);
                await actions.startNextBatch();
                setStarting(false);
              }}
              className="cursor-pointer rounded-sm border border-blush/40 bg-transparent px-5 py-3.25 text-[14px] tracking-[0.16em] text-blush uppercase"
            >
              {starting ? "Starting…" : "Start next batch"}
            </button>
          </div>
        </div>

        <div className="border border-ink/14 bg-cream-card">
          <div className="flex items-baseline justify-between border-b border-ink/12 px-6 py-4.5">
            <span className="text-[13px] tracking-[0.24em] text-rust uppercase">
              Stock for this batch
            </span>
            <span className="font-mono text-[13px] text-ink/62">
              {planned} cookies planned
            </span>
          </div>
          {products.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1.6fr_auto_auto] items-center gap-4.5 border-b border-ink/8 px-6 py-3.75"
            >
              <div>
                <div className={"text-xl " + (p.active ? "" : "opacity-45")}>{p.name}</div>
                <div className="mt-0.5 font-mono text-[13px] text-ink/62">{peso(p.price)}</div>
              </div>
              <InlineNumberField id={p.id} value={p.stock} onSave={actions.updateProductStock} />
              <button
                type="button"
                onClick={() => void actions.toggleProductActive(p.id)}
                className={
                  "w-fit cursor-pointer rounded-full border px-3.5 py-1.75 text-[13px] tracking-[0.15em] uppercase " +
                  (p.active
                    ? "border-maroon-deep/40 bg-maroon-deep text-cream"
                    : "border-ink/20 bg-transparent text-ink/60")
                }
              >
                {p.active ? "Live" : "Hidden"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-9 border border-ink/14 bg-cream-card p-6.5">
        <div className="text-[13px] tracking-[0.24em] text-rust uppercase">
          Payment settings
        </div>
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <PaymentAccountFields
            title="GCash"
            accountName={settings.gcashAccountName}
            accountNumber={settings.gcashAccountNumber}
            qrUrl={settings.gcashQrUrl}
            onSaveName={(v) => actions.updateSettings({ gcashAccountName: v })}
            onSaveNumber={(v) => actions.updateSettings({ gcashAccountNumber: v })}
            onUploadQr={(url) => actions.updateSettings({ gcashQrUrl: url })}
          />
          <PaymentAccountFields
            title="GoTyme"
            accountName={settings.gotymeAccountName}
            accountNumber={settings.gotymeAccountNumber}
            qrUrl={settings.gotymeQrUrl}
            onSaveName={(v) => actions.updateSettings({ gotymeAccountName: v })}
            onSaveNumber={(v) => actions.updateSettings({ gotymeAccountNumber: v })}
            onUploadQr={(url) => actions.updateSettings({ gotymeQrUrl: url })}
          />
        </div>
      </div>

      <div className="mt-9 border border-ink/14 bg-cream-card p-6.5">
        <div className="text-[13px] tracking-[0.24em] text-rust uppercase">
          Site photos
        </div>
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SitePhotoField
            title="Hero photo"
            hint="Shown on the homepage banner."
            imageUrl={settings.heroImageUrl}
            aspect="aspect-[3/4]"
            onUploaded={(url) => actions.updateSettings({ heroImageUrl: url })}
          />
          <SitePhotoField
            title="About photo"
            hint="Shown in the About section."
            imageUrl={settings.aboutImageUrl}
            aspect="aspect-square"
            onUploaded={(url) => actions.updateSettings({ aboutImageUrl: url })}
          />
        </div>
      </div>
    </div>
  );
}

function SitePhotoField({
  title,
  hint,
  imageUrl,
  aspect,
  onUploaded,
}: {
  title: string;
  hint: string;
  imageUrl: string | null;
  aspect: string;
  onUploaded: (url: string) => Promise<void>;
}) {
  return (
    <div>
      <div className="text-[13px] tracking-[0.2em] text-ink/70 uppercase">{title}</div>
      <p className="mt-1.5 font-mono text-[13px] text-ink/62">{hint}</p>
      <div className="mt-3 flex gap-4">
        <div
          className={
            "w-28 flex-none overflow-hidden border border-ink/16 bg-cream-warm " + aspect
          }
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-1 items-start">
          <SellerImageUpload
            label={imageUrl ? "Replace photo" : "Upload photo"}
            onUploaded={onUploaded}
          />
        </div>
      </div>
    </div>
  );
}

function nextCode(code: string) {
  const n = parseInt(code.replace(/[^0-9]/g, ""), 10) || 0;
  return `BATCH ${n + 1}`;
}

function PaymentAccountFields({
  title,
  accountName,
  accountNumber,
  qrUrl,
  onSaveName,
  onSaveNumber,
  onUploadQr,
}: {
  title: string;
  accountName: string;
  accountNumber: string;
  qrUrl: string | null;
  onSaveName: (v: string) => Promise<void>;
  onSaveNumber: (v: string) => Promise<void>;
  onUploadQr: (url: string) => Promise<void>;
}) {
  const [name, setName] = useState(accountName);
  const [syncedName, setSyncedName] = useState(accountName);
  const [number, setNumber] = useState(accountNumber);
  const [syncedNumber, setSyncedNumber] = useState(accountNumber);

  if (accountName !== syncedName) {
    setSyncedName(accountName);
    setName(accountName);
  }
  if (accountNumber !== syncedNumber) {
    setSyncedNumber(accountNumber);
    setNumber(accountNumber);
  }

  return (
    <div>
      <div className="text-[13px] tracking-[0.2em] text-ink/70 uppercase">{title}</div>
      <div className="mt-3 flex gap-4">
        <div className="h-22 w-22 flex-none overflow-hidden border border-ink/16 bg-cream-warm">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt={`${title} QR`} className="h-full w-full object-contain" />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name !== accountName) void onSaveName(name);
            }}
            placeholder="Account name"
          />
          <Input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onBlur={() => {
              if (number !== accountNumber) void onSaveNumber(number);
            }}
            placeholder="Account number"
          />
          <SellerImageUpload label={qrUrl ? "Replace QR" : "Upload QR"} onUploaded={onUploadQr} />
        </div>
      </div>
    </div>
  );
}
