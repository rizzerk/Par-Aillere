"use client";

import { useUploadThing } from "@/lib/uploadthing";

export function SellerImageUpload({
  label,
  className = "",
  onUploaded,
}: {
  label: string;
  className?: string;
  onUploaded: (url: string) => Promise<void>;
}) {
  const { startUpload, isUploading } = useUploadThing("productPhoto", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl;
      if (url) void onUploaded(url);
    },
  });

  return (
    <label
      className={
        "cursor-pointer rounded-sm border border-ink/25 bg-transparent px-4 py-2.75 text-center text-[13px] tracking-[0.14em] text-ink/70 uppercase " +
        className
      }
    >
      {isUploading ? "Uploading…" : label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void startUpload([file]);
        }}
      />
    </label>
  );
}
