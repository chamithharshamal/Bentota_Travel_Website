import Link from "next/link";
import { CldImg } from "@/components/media/cld-image";
import { LinkButton } from "@/components/ui/button";
import type { Destination, MediaLite, TourPackage, TourRoute } from "@/lib/types";
import { RouteLine } from "./route-line";
import { RoutePrice } from "./price";

export function DestinationCard({ destination, media }: { destination: Destination; media?: MediaLite }) {
  return (
    <Link href={`/destinations/${destination.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl">
        <CldImg media={media} ratio="4:3" className="w-full transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <h3 className="mt-3 text-lg font-semibold group-hover:text-ocean-600">{destination.name}</h3>
      {destination.region && <p className="text-sm text-ocean-950/60">{destination.region}</p>}
    </Link>
  );
}

export function RouteRow({
  route,
  destinationNames,
}: {
  route: TourRoute;
  destinationNames: Record<string, string>;
}) {
  const stops = route.stops.map((s) => ({ name: destinationNames[s.destinationId] ?? "", day: s.day, mandatory: s.mandatory }));
  return (
    <article className="grid gap-6 border-t border-ocean-900/10 py-8 md:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h3 className="text-xl font-semibold">{route.name}</h3>
          {route.duration && <p className="text-sm text-ocean-950/60">{route.duration}</p>}
        </div>
        {route.summary && <p className="mt-1 max-w-prose text-sm text-ocean-950/70">{route.summary}</p>}
        <RouteLine stops={stops} size="sm" className="mt-5" />
        <p className="mt-4 text-xs text-ocean-950/60">
          Choose up to {route.maxSelectable} of {route.stops.length} stops. Filled stops are always included.
        </p>
      </div>
      <div className="flex items-end justify-between gap-6 md:flex-col md:items-end">
        <RoutePrice pricing={route.pricing} className="md:text-right" />
        <LinkButton href={`/book?route=${route.slug}`} variant="dark">
          Book this route
        </LinkButton>
      </div>
    </article>
  );
}

export function PackageCard({ pkg, media, routeCount }: { pkg: TourPackage; media?: MediaLite; routeCount: number }) {
  return (
    <Link href={`/packages/${pkg.slug}`} className="group grid gap-4 sm:grid-cols-[240px_1fr]">
      <div className="overflow-hidden rounded-xl">
        <CldImg media={media} ratio="4:3" sizes="240px" className="w-full transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="self-center">
        <h3 className="text-xl font-semibold group-hover:text-ocean-600">{pkg.title}</h3>
        {pkg.summary && <p className="mt-1 max-w-prose text-sm text-ocean-950/70">{pkg.summary}</p>}
        <p className="mt-2 text-sm font-medium text-ocean-800">
          {routeCount} {routeCount === 1 ? "route" : "routes"} to choose from
        </p>
      </div>
    </Link>
  );
}
