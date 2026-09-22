import type { Metadata } from "next";
import { CldImg } from "@/components/media/cld-image";
import { VideoPlayer } from "@/components/media/video-player";
import { getMediaMap, getSettings } from "@/lib/server/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const settings = await getSettings();
  const media = await getMediaMap(settings.galleryMediaIds);
  const items = settings.galleryMediaIds.map((id) => media[id]).filter((m) => m !== undefined);
  const videos = items.filter((m) => m.type === "video");
  const images = items.filter((m) => m.type === "image");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Gallery</h1>
      <p className="mt-4 max-w-prose text-lg text-ocean-950/70">Photos and videos from recent trips.</p>
      {items.length === 0 && <p className="mt-10 text-ocean-950/70">Photos will appear here soon.</p>}

      {videos.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {videos.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl">
              <VideoPlayer media={v} />
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-10 columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {images.map((m) => (
            <figure key={m.id} className="break-inside-avoid overflow-hidden rounded-lg">
              <CldImg media={m} ratio="free" sizes="(min-width: 768px) 33vw, 50vw" className="w-full" />
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
