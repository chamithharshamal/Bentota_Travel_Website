import type { Metadata } from "next";
import { DestinationCard } from "@/components/site/cards";
import { getMediaMap, getPublishedDestinations } from "@/lib/server/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  const destinations = await getPublishedDestinations();
  const media = await getMediaMap(destinations.map((d) => d.coverMediaId));
  const regions = Array.from(new Set(destinations.map((d) => d.region || "Other places")));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Destinations</h1>
      <p className="mt-4 max-w-prose text-lg text-ocean-950/70">
        Every place you can add to a route. Open a destination to see which tours stop there.
      </p>
      {destinations.length === 0 && <p className="mt-10 text-ocean-950/70">Destinations are being added.</p>}
      {regions.map((region) => (
        <section key={region} className="mt-14">
          <h2 className="border-b-2 border-ocean-900 pb-3 text-xl font-semibold">{region}</h2>
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {destinations
              .filter((d) => (d.region || "Other places") === region)
              .map((d) => (
                <DestinationCard key={d.id} destination={d} media={d.coverMediaId ? media[d.coverMediaId] : undefined} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
