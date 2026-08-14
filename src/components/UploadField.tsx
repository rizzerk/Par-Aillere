"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export function UploadField({
  endpoint,
  value,
  onChange,
  placeholder = "Tap to upload a photo",
  className = "",
}: {
  endpoint: "productPhoto" | "paymentProof";
  value?: string | null;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl;
      if (url) onChange(url);
    },
  });

  const label = isUploading
    ? "Uploading…"
    : value
      ? `✓ ${fileName ?? "Uploaded"}`
      : placeholder;

  return (
    <label
      className={
        "flex h-24 cursor-pointer items-center justify-center border border-dashed border-maroon-deep/40 bg-maroon-deep/[0.03] px-3 text-center text-base font-light text-maroon-deep " +
        className
      }
    >
      {label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setFileName(file.name);
          void startUpload([file]);
        }}
      />
    </label>
  );
}
