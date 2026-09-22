import "server-only";
import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryServerConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

let configured = false;

export function cld() {
  if (!isCloudinaryServerConfigured()) {
    throw new Error("Cloudinary is not configured. Add the Cloudinary values to .env.local.");
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/**
 * Parameters the upload widget is NOT allowed to set.
 * The signed upload preset controls folder, naming and processing.
 */
export const BLOCKED_UPLOAD_PARAMS = [
  "folder",
  "asset_folder",
  "public_id",
  "public_id_prefix",
  "overwrite",
  "type",
  "access_mode",
  "notification_url",
  "eager",
  "eager_notification_url",
  "transformation",
  "invalidate",
  "backup",
  "raw_convert",
  "moderation",
];

export interface CloudinaryResourceInfo {
  public_id: string;
  resource_type: "image" | "video";
  version: number;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  duration?: number;
}

export async function fetchResource(publicId: string, resourceType: "image" | "video") {
  return (await cld().api.resource(publicId, { resource_type: resourceType })) as CloudinaryResourceInfo;
}

/** Queues adaptive-streaming (HLS) renditions and asks Cloudinary to call the webhook when ready. */
export async function requestStreamingRenditions(publicId: string): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!siteUrl.startsWith("https://")) return false; // Webhooks cannot reach localhost.
  await cld().uploader.explicit(publicId, {
    type: "upload",
    resource_type: "video",
    eager: [{ streaming_profile: "auto", format: "m3u8" }],
    eager_async: true,
    eager_notification_url: `${siteUrl}/api/cloudinary/webhook`,
  });
  return true;
}

export async function destroyAsset(publicId: string, resourceType: "image" | "video") {
  await cld().uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}
