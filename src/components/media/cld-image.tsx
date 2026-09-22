import { ImageOff } from "lucide-react";
import { imageSrcSet, imageUrl, videoPosterUrl, type AspectRatio } from "@/lib/cld-url";
import type { MediaLite } from "@/lib/types";
import { cn } from "@/lib/utils";

const ratioClass: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
  free: "",
};

/**
 * Responsive Cloudinary image with a fixed set of widths.
 * Renders a calm placeholder when no media has been chosen yet.
 */
export function CldImg({
  media,
  ratio = "4:3",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  alt,
  priority = false,
  className,
}: {
  media: MediaLite | null | undefined;
  ratio?: AspectRatio;
  sizes?: string;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!media) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-ocean-100 to-palm-100 text-ocean-600/60",
          ratioClass[ratio],
          className,
        )}
        aria-hidden
      >
        <ImageOff className="size-6" />
      </div>
    );
  }

  const src = media.type === "video" ? videoPosterUrl(media) : imageUrl(media, 960, ratio);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already optimizes and resizes.
    <img
      src={src}
      srcSet={media.type === "image" ? imageSrcSet(media, ratio) : undefined}
      sizes={sizes}
      alt={alt ?? media.altText ?? ""}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("object-cover", ratioClass[ratio], className)}
    />
  );
}
