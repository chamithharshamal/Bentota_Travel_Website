import Link from "next/link";
import { DestinationCard } from "@/components/site/cards";
import { RoutePrice } from "@/components/site/price";
import { RouteLine } from "@/components/site/route-line";
import { HeroSection } from "@/components/site/hero";
import { PopularDestinationsSection } from "@/components/site/popular-destinations";
import { ExplorePackagesSection } from "@/components/site/explore-packages";
import { MomentsFromTravellersSection } from "@/components/site/moments-gallery";
import { ContactUsSection } from "@/components/site/contact-section";
import { LinkButton } from "@/components/ui/button";
import { TRIP_TYPE_LABEL } from "@/lib/defaults";
import { formatMoney } from "@/lib/pricing";
import { getBookableRoutes, getMediaMap, getPublishedDestinations, getPublishedPackages, getSettings } from "@/lib/server/data";
import type { TripType } from "@/lib/types";

export const revalidate = 300;

const STEPS = [
  { title: "Choose the trip length", body: "A full day out, or two days with a night at a hotel on the way." },
  { title: "Pick a route", body: "Each route follows one direction, so no time is lost doubling back." },
  { title: "Keep the stops you want", body: "Some stops are always included. Choose the rest within the route's limit." },
  { title: "Send your request", body: "We confirm the date and final price by WhatsApp or phone. Nothing is paid online." },
];

export default async function HomePage() {
  const [settings, routes, destinations, packages] = await Promise.all([
    getSettings(),
    getBookableRoutes(),
    getPublishedDestinations(),
    getPublishedPackages(),
  ]);

  const names = Object.fromEntries(destinations.map((d) => [d.id, d.name]));
  const featuredPackage = packages.find((p) => p.featured);
  const featured =
    (featuredPackage && routes.find((r) => featuredPackage.routeIds.includes(r.id))) ??
    routes.find((r) => r.tripType === "one-day") ??
    routes[0];
  const shownDestinations = destinations.slice(0, 6);
  const media = await getMediaMap([settings.heroMediaId, ...shownDestinations.map((d) => d.coverMediaId)]);
  const { infantMaxAge, childMaxAge } = settings.childPolicy;

  const byType = (type: TripType) => routes.filter((r) => r.tripType === type).slice(0, 3);

  return (
    <>
      <HeroSection />
      <PopularDestinationsSection />
      <ExplorePackagesSection />
      <MomentsFromTravellersSection />
      <ContactUsSection />






      {featured && (
        <section className="mx-auto w-[80%] px-4 pt-10 sm:px-6">
            <div className="rounded-2xl border border-white/10 bg-ocean-950/75 p-6 backdrop-blur sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-sun-500">{TRIP_TYPE_LABEL[featured.tripType]}</p>
                  <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{featured.name}</h2>
                  {featured.duration && <p className="mt-1 text-sm text-white/70">{featured.duration}</p>}
                </div>
                <RoutePrice pricing={featured.pricing} tone="dark" className="sm:text-right" />
              </div>
              <RouteLine
                className="mt-8"
                tone="dark"
                animate
                stops={featured.stops.map((s) => ({ name: names[s.destinationId] ?? "", day: s.day, mandatory: s.mandatory }))}
              />
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <p className="text-sm text-white/70">
                  Choose up to {featured.maxSelectable} of these {featured.stops.length} stops.
                </p>
                <LinkButton href={`/book?route=${featured.slug}`}>Book this route</LinkButton>
              </div>
            </div>
        </section>
      )}

      <section className="mx-auto w-[80%] px-4 pt-20 sm:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl">Routes to choose from</h2>
        {routes.length === 0 ? (
          <p className="mt-4 max-w-prose text-ocean-950/70">
            Tours are being added. Contact us on WhatsApp to plan a trip in the meantime.
          </p>
        ) : (
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            {(["one-day", "two-day"] as TripType[]).map((type) => (
              <div key={type}>
                <div className="flex items-baseline justify-between border-b-2 border-ocean-900 pb-3">
                  <h3 className="text-xl font-semibold">{type === "one-day" ? "One day" : "Two days"}</h3>
                  <Link href={`/tours/${type}`} className="text-sm font-semibold text-ocean-600 hover:underline">
                    All {type === "one-day" ? "day" : "two-day"} tours
                  </Link>
                </div>
                <ul>
                  {byType(type).map((route) => (
                    <li key={route.id} className="border-b border-ocean-900/10 py-5">
                      <Link href={`/book?route=${route.slug}`} className="group flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold group-hover:text-ocean-600">{route.name}</p>
                          <p className="mt-1 truncate text-sm text-ocean-950/60">
                            {route.stops.map((s) => names[s.destinationId]).join(", ")}
                          </p>
                        </div>
                        <p className="shrink-0 font-display font-bold tabular-nums">
                          {formatMoney(route.pricing.foreignAdult, "USD")}
                        </p>
                      </Link>
                    </li>
                  ))}
                  {byType(type).length === 0 && <li className="py-5 text-sm text-ocean-950/60">No routes published yet.</li>}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {shownDestinations.length > 0 && (
        <section className="mx-auto w-[80%] px-4 pt-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold sm:text-4xl">Places on our routes</h2>
            <Link href="/destinations" className="text-sm font-semibold text-ocean-600 hover:underline">
              All destinations
            </Link>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {shownDestinations.map((d) => (
              <DestinationCard key={d.id} destination={d} media={d.coverMediaId ? media[d.coverMediaId] : undefined} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-[80%] px-4 pt-24 sm:px-6">
        <div className="grid gap-12 rounded-2xl bg-white p-8 ring-1 ring-ocean-900/10 sm:p-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold">How booking works</h2>
            <ol className="mt-8 space-y-6">
              {STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-sun-500 font-display font-bold text-ocean-950">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ocean-950/70">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl bg-ocean-50 p-6">
            <h3 className="text-lg font-semibold">How prices work</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ocean-950/80">
              <li>Prices are per person and fixed for each route. Changing your stops does not change the price.</li>
              <li>Foreign nationals pay in US dollars. Sri Lankan nationals pay the local rate in rupees.</li>
              <li>
                Children aged {infantMaxAge + 1} to {childMaxAge} pay the child rate. Children under {infantMaxAge + 1} travel free.
              </li>
              <li>Two-day tours include one night on a twin or double sharing basis. A single room costs extra per person.</li>
              <li>Entrance fees to sites and parks are paid separately unless the tour says otherwise.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
