import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageCard, RouteRow } from "@/components/site/cards";
import { getBookableRoutes, getMediaMap, getPublishedDestinations, getPublishedPackages } from "@/lib/server/data";
import { TRIP_TYPES, type TripType } from "@/lib/types";

export const revalidate = 300;
export const dynamicParams = false;

const COPY: Record<TripType, { title: string; intro: string }> = {
  "one-day": {
    title: "Day tours from Bentota",
    intro: "Leave in the morning and be back at your hotel by evening. Every route below includes pickup and a private vehicle.",
  },
  "two-day": {
    title: "Two-day tours from Bentota",
    intro: "Go further with one night at a hotel on the route. Accommodation is on a twin or double sharing basis.",
  },
};

export function generateStaticParams() {
  return TRIP_TYPES.map((tripType) => ({ tripType }));
}

export async function generateMetadata({ params }: { params: Promise<{ tripType: string }> }): Promise<Metadata> {
  const { tripType } = await params;
  const copy = COPY[tripType as TripType];
  return copy ? { title: copy.title, description: copy.intro } : {};
}

export default async function ToursPage({ params }: { params: Promise<{ tripType: string }> }) {
  const { tripType } = await params;
  if (!TRIP_TYPES.includes(tripType as TripType)) notFound();
  const type = tripType as TripType;

  const [routes, destinations, packages] = await Promise.all([
    getBookableRoutes(),
    getPublishedDestinations(),
    getPublishedPackages(),
  ]);
  const typeRoutes = routes.filter((r) => r.tripType === type);
  const typePackages = packages.filter((p) => p.tripType === type);
  const names = Object.fromEntries(destinations.map((d) => [d.id, d.name]));
  const media = await getMediaMap(typePackages.map((p) => p.coverMediaId));
  const routeIds = new Set(typeRoutes.map((r) => r.id));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">{COPY[type].title}</h1>
      <p className="mt-4 max-w-prose text-lg text-ocean-950/70">{COPY[type].intro}</p>

      {typePackages.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold">Packages</h2>
          <div className="mt-6 grid gap-8">
            {typePackages.map((p) => (
              <PackageCard
                key={p.id}
                pkg={p}
                media={p.coverMediaId ? media[p.coverMediaId] : undefined}
                routeCount={p.routeIds.filter((id) => routeIds.has(id)).length}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-2xl font-bold">All routes</h2>
        {typeRoutes.length === 0 ? (
          <p className="mt-4 text-ocean-950/70">No routes are published for this trip length yet.</p>
        ) : (
          <div className="mt-4">
            {typeRoutes.map((r) => (
              <RouteRow key={r.id} route={r} destinationNames={names} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
