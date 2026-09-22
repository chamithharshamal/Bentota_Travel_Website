import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CldImg } from "@/components/media/cld-image";
import { VideoPlayer } from "@/components/media/video-player";
import { RouteRow } from "@/components/site/cards";
import { getBookableRoutes, getDestinationBySlug, getMediaMap, getPublishedDestinations } from "@/lib/server/data";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = await getDestinationBySlug((await params).slug);
  return d ? { title: d.name, description: d.shortDescription } : {};
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const destination = await getDestinationBySlug((await params).slug);
  if (!destination) notFound();

  const [routes, destinations] = await Promise.all([getBookableRoutes(), getPublishedDestinations()]);
  const names = Object.fromEntries(destinations.map((d) => [d.id, d.name]));
  const stoppingRoutes = routes.filter((r) => r.stops.some((s) => s.destinationId === destination.id));
  const media = await getMediaMap([destination.coverMediaId, destination.videoMediaId, ...destination.galleryMediaIds]);
  const video = destination.videoMediaId ? media[destination.videoMediaId] : undefined;
  const gallery = destination.galleryMediaIds.map((id) => media[id]).filter((m) => m && m.type === "image");

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          {destination.region && <p className="text-sm font-semibold text-sun-600">{destination.region}</p>}
          <h1 className="mt-1 text-4xl font-bold sm:text-6xl">{destination.name}</h1>
          {destination.shortDescription && (
            <p className="mt-4 max-w-prose text-lg text-ocean-950/75">{destination.shortDescription}</p>
          )}
        </div>
        <div className="overflow-hidden rounded-2xl">
          <CldImg media={destination.coverMediaId ? media[destination.coverMediaId] : undefined} ratio="4:3" sizes="(min-width: 1024px) 55vw, 100vw" priority className="w-full" />
        </div>
      </div>

      {destination.description && (
        <div className="mt-12 max-w-prose space-y-4 text-lg leading-relaxed text-ocean-950/80">
          {destination.description.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {video && (
        <section className="mt-12 overflow-hidden rounded-2xl">
          <VideoPlayer media={video} title={`${destination.name} video`} />
        </section>
      )}

      {gallery.length > 0 && (
        <section className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
          {gallery.map((m) => (
            <CldImg key={m!.id} media={m} ratio="4:3" sizes="(min-width: 768px) 33vw, 50vw" className="w-full rounded-lg" />
          ))}
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Tours that stop here</h2>
        {stoppingRoutes.length === 0 ? (
          <p className="mt-4 text-ocean-950/70">No published route includes this destination right now.</p>
        ) : (
          <div className="mt-4">
            {stoppingRoutes.map((r) => (
              <RouteRow key={r.id} route={r} destinationNames={names} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
