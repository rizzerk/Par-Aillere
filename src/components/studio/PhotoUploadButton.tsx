"use client";

import { useUploadThing } from "@/lib/uploadthing";

export function PhotoUploadButton({
  productId,
  onUploaded,
}: {
  productId: string;
  onUploaded: (id: string, url: string) => Promise<void>;
}) {
  const { startUpload, isUploading } = useUploadThing("productPhoto", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl;
      if (url) void onUploaded(productId, url);
    },
  });

  return (
    <label className="cursor-pointer rounded-sm border border-ink/25 bg-transparent px-3.5 py-2.25 text-[13px] tracking-[0.14em] whitespace-nowrap text-ink/70 uppercase">
      {isUploading ? "Uploading…" : "Photo"}
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
