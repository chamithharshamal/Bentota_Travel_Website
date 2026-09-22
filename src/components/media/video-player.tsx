"use client";

import { useEffect, useRef } from "react";
import { videoHlsUrl, videoMp4Url, videoPosterUrl } from "@/lib/cld-url";
import type { MediaLite } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Plays Cloudinary video. Uses adaptive streaming (HLS) once it is ready,
 * and falls back to an optimized MP4. Nothing downloads until the viewer presses play.
 */
export function VideoPlayer({
  media,
  className,
  title,
}: {
  media: MediaLite;
  className?: string;
  title?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const useHls = media.streaming === "ready";

  useEffect(() => {
    const video = ref.current;
    if (!video || !useHls) return;
    let destroy: (() => void) | undefined;
    const src = videoHlsUrl(media);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    let cancelled = false;
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;
      if (Hls.isSupported()) {
        const hls = new Hls({ capLevelToPlayerSize: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        destroy = () => hls.destroy();
      } else {
        video.src = videoMp4Url(media);
      }
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [media, useHls]);

  return (
    <video
      ref={ref}
      controls
      playsInline
      preload="none"
      poster={videoPosterUrl(media, 1600)}
      className={cn("aspect-video w-full bg-ocean-950 object-cover", className)}
      aria-label={title ?? media.altText ?? "Video"}
    >
      {!useHls && <source src={videoMp4Url(media)} type="video/mp4" />}
    </video>
  );
}
