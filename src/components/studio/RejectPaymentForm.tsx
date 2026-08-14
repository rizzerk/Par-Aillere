"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui";

export function RejectPaymentForm({
  orderRef,
  onReject,
}: {
  orderRef: string;
  onReject: (ref: string, reason: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-5 flex flex-col gap-2.5">
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="Reason for rejection (required)"
      />
      {error && <p className="m-0 font-mono text-[13px] text-rust">{error}</p>}
      <button
        type="button"
        disabled={!reason.trim() || pending}
        onClick={async () => {
          setPending(true);
          const res = await onReject(orderRef, reason);
          setPending(false);
          if (!res.ok) setError(res.error);
          else {
            setError(null);
            setReason("");
          }
        }}
        className={
          "rounded-sm border px-5 py-3.25 text-[14px] tracking-[0.16em] uppercase " +
          (reason.trim()
            ? "cursor-pointer border-maroon-deep/45 bg-maroon-deep/10 text-maroon-deep"
            : "cursor-not-allowed border-maroon-deep/45 bg-transparent text-maroon-deep")
        }
      >
        {pending ? "Rejecting…" : "Reject payment"}
      </button>
    </div>
  );
}
