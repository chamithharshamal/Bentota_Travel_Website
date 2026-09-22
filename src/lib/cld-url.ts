/**
 * Cloudinary delivery URL helpers (safe for client and server).
 *
 * Only a small, fixed set of transformations is ever generated, so the
 * account can run with "Strict transformations" enabled once these are allowed.
 */
import type { MediaLite } from "./types";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const BASE = `https://res.cloudinary.com/${CLOUD}`;

export const IMAGE_WIDTHS = [480, 960, 1600] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

export type AspectRatio = "16:9" | "4:3" | "1:1" | "3:4" | "free";

function heightFor(width: number, ratio: AspectRatio): number | null {
  if (ratio === "free") return null;
  const [w, h] = ratio.split(":").map(Number);
  return Math.round((width * h) / w);
}

function versionSegment(version?: number) {
  return version ? `v${version}/` : "";
}

export function isCloudinaryConfigured(): boolean {
  return CLOUD.length > 0;
}

export function imageUrl(media: Pick<MediaLite, "publicId" | "version">, width: ImageWidth, ratio: AspectRatio = "free") {
  const h = heightFor(width, ratio);
  const t = h ? `c_fill,g_auto,w_${width},h_${h}` : `c_limit,w_${width}`;
  return `${BASE}/image/upload/${t},f_auto,q_auto/${versionSegment(media.version)}${media.publicId}`;
}

export function imageSrcSet(media: Pick<MediaLite, "publicId" | "version">, ratio: AspectRatio = "free") {
  return IMAGE_WIDTHS.map((w) => `${imageUrl(media, w, ratio)} ${w}w`).join(", ");
}

/** Progressive MP4 fallback, capped at 1280px wide. */
export function videoMp4Url(media: Pick<MediaLite, "publicId" | "version">) {
  return `${BASE}/video/upload/c_limit,w_1280,q_auto,vc_auto/${versionSegment(media.version)}${media.publicId}.mp4`;
}

/** Adaptive streaming (HLS). Available once Cloudinary has finished preparing it. */
export function videoHlsUrl(media: Pick<MediaLite, "publicId" | "version">) {
  return `${BASE}/video/upload/sp_auto/${versionSegment(media.version)}${media.publicId}.m3u8`;
}

export function videoPosterUrl(media: Pick<MediaLite, "publicId" | "version">, width: ImageWidth = 960) {
  return `${BASE}/video/upload/so_2,c_fill,w_${width},h_${Math.round((width * 9) / 16)},q_auto/${versionSegment(media.version)}${media.publicId}.jpg`;
}

export function thumbnailUrl(media: Pick<MediaLite, "publicId" | "version" | "type">) {
  return media.type === "video" ? videoPosterUrl(media, 480) : imageUrl(media, 480, "4:3");
}
