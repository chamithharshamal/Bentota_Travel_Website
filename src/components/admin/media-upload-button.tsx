"use client";

import { useCallback, useState } from "react";
import { CldUploadWidget, type CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { isCloudinaryConfigured } from "@/lib/cld-url";
import type { MediaAsset } from "@/lib/types";

export type UploadAccept = "image" | "video" | "all";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif", "heic"];
const VIDEO_FORMATS = ["mp4", "mov", "webm"];

export interface UploadedInfo {
  publicId: string;
  resourceType: "image" | "video";
  originalFilename: string;
  duration: number | null;
}

/**
 * Opens the Cloudinary upload widget. Files go straight from the browser to
 * Cloudinary; our server only signs the request and then records the asset.
 */
export function MediaUploadButton({
  accept = "all",
  multiple = true,
  label = "Upload files",
  onCreated,
  onUploadedRaw,
  variant = "primary",
}: {
  accept?: UploadAccept;
  multiple?: boolean;
  label?: string;
  /** Called after the asset is saved to the media library. */
  onCreated?: (media: MediaAsset) => void;
  /** Called with the raw upload instead of creating a library item (used for "Replace file"). */
  onUploadedRaw?: (info: UploadedInfo) => void;
  variant?: "primary" | "outline" | "dark";
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(0);

  const uploadSignature = useCallback(
    (callback: (signature: string | null, error?: unknown) => void, paramsToSign: Record<string, unknown>) => {
      apiFetch<{ signature: string }>("/api/cloudinary/sign", { method: "POST", body: { paramsToSign } })
        .then((res) => callback(res.signature))
        .catch((e) => {
          setError(errorMessage(e));
          callback(null, e);
        });
    },
    [],
  );

  if (!isCloudinaryConfigured() || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
    return (
      <p className="text-sm text-danger">
        Uploads are off. Add the Cloudinary values to .env.local and restart the server.
      </p>
    );
  }

  const formats = accept === "image" ? IMAGE_FORMATS : accept === "video" ? VIDEO_FORMATS : [...IMAGE_FORMATS, ...VIDEO_FORMATS];

  return (
    <div className="flex flex-col items-start gap-1">
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          uploadSignature,
          multiple,
          maxFiles: multiple ? 20 : 1,
          sources: ["local", "url", "camera"],
          resourceType: accept === "all" ? "auto" : accept,
          clientAllowedFormats: formats,
          maxImageFileSize: 10_000_000,
          maxVideoFileSize: 100_000_000,
          showAdvancedOptions: false,
          singleUploadAutoClose: true,
        }}
        onSuccess={async (result) => {
          const info = result.info as CloudinaryUploadWidgetInfo | undefined;
          if (!info || typeof info === "string") return;
          const resourceType = info.resource_type === "video" ? "video" : "image";
          const uploaded: UploadedInfo = {
            publicId: info.public_id,
            resourceType,
            originalFilename: `${info.original_filename ?? "file"}.${info.format ?? ""}`.replace(/\.$/, ""),
            duration: typeof (info as { duration?: number }).duration === "number" ? (info as { duration?: number }).duration! : null,
          };
          setError(null);
          if (onUploadedRaw) {
            onUploadedRaw(uploaded);
            return;
          }
          setSaving((n) => n + 1);
          try {
            const res = await apiFetch<{ media: MediaAsset }>("/api/admin/media", { method: "POST", body: uploaded });
            onCreated?.(res.media);
          } catch (e) {
            setError(errorMessage(e));
          } finally {
            setSaving((n) => n - 1);
          }
        }}
        onError={(err) => setError(typeof err === "string" ? err : (err as { statusText?: string })?.statusText ?? "Upload failed.")}
      >
        {({ open, isLoading }) => (
          <Button variant={variant} onClick={() => open()} disabled={isLoading}>
            <Upload className="size-4" />
            {saving > 0 ? "Saving to library…" : label}
          </Button>
        )}
      </CldUploadWidget>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
