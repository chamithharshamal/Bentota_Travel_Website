import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Minus } from "lucide-react";
import { CldImg } from "@/components/media/cld-image";
import { RouteRow } from "@/components/site/cards";
import { TRIP_TYPE_LABEL } from "@/lib/defaults";
import { getBookableRoutes, getMediaMap, getPackageBySlug, getPublishedDestinations } from "@/lib/server/data";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const pkg = await getPackageBySlug((await params).slug);
  return pkg ? { title: pkg.title, description: pkg.summary } : {};
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const pkg = await getPackageBySlug((await params).slug);
  if (!pkg) notFound();

  const [routes, destinations] = await Promise.all([getBookableRoutes(), getPublishedDestinations()]);
  const names = Object.fromEntries(destinations.map((d) => [d.id, d.name]));
  const pkgRoutes = pkg.routeIds.map((id) => routes.find((r) => r.id === id)).filter((r) => r !== undefined);
  const media = await getMediaMap([pkg.coverMediaId, ...pkg.galleryMediaIds]);
  const gallery = pkg.galleryMediaIds.map((id) => media[id]).filter((m) => m && m.type === "image");

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <div className="overflow-hidden rounded-2xl">
        <CldImg media={pkg.coverMediaId ? media[pkg.coverMediaId] : undefined} ratio="16:9" sizes="(min-width: 1152px) 1152px, 100vw" priority className="max-h-[520px] w-full" />
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="text-sm font-semibold text-sun-600">{TRIP_TYPE_LABEL[pkg.tripType]}</p>
          <h1 className="mt-1 text-4xl font-bold sm:text-5xl">{pkg.title}</h1>
          {pkg.summary && <p className="mt-4 max-w-prose text-lg text-ocean-950/75">{pkg.summary}</p>}
          {pkg.description && (
            <div className="mt-6 max-w-prose space-y-4 leading-relaxed text-ocean-950/80">
              {pkg.description.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </div>
        {pkg.highlights.length > 0 && (
          <aside className="self-start rounded-xl bg-white p-6 ring-1 ring-ocean-900/10">
            <h2 className="text-lg font-semibold">Highlights</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {pkg.highlights.map((h) => (
                <li key={h} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-palm-500" />{h}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Choose a route</h2>
        {pkgRoutes.length === 0 ? (
          <p className="mt-4 text-ocean-950/70">Routes for this package are being updated. Contact us to book.</p>
        ) : (
          <div className="mt-4">
            {pkgRoutes.map((r) => (
              <RouteRow key={r.id} route={r} destinationNames={names} />
            ))}
          </div>
        )}
      </section>

      {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
        <section className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">Included</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {pkg.inclusions.map((i) => (
                <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-palm-500" />{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold">Not included</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {pkg.exclusions.map((i) => (
                <li key={i} className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-ocean-950/40" />{i}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold">Photos</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((m) => (
              <CldImg key={m!.id} media={m} ratio="4:3" sizes="(min-width: 768px) 33vw, 50vw" className="w-full rounded-lg" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
