import type { Metadata } from "next";
import Image from "next/image";
import { DestinationCard } from "@/components/site/cards";
import { PopularDestinationsSection, ALL_DESTINATIONS } from "@/components/site/popular-destinations";
import { getMediaMap, getPublishedDestinations } from "@/lib/server/data";

export const revalidate = 300;
export const metadata: Metadata = { 
  title: "Destinations | Bentota Smart Journeys",
  description: "Explore the most loved destinations and stopovers across Sri Lanka. Add your favorite places to custom private tours from Bentota.",
};

export default async function DestinationsPage() {
  const destinations = await getPublishedDestinations();
  const media = await getMediaMap(destinations.map((d) => d.coverMediaId));
  const regions = Array.from(new Set(destinations.map((d) => d.region || "Other places")));

  return (
    <main className="w-full overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO BANNER                                       */}
      {/* ---------------------------------------------------- */}
      <section className="relative isolate w-full bg-[#051726] text-white pt-32 sm:pt-40 lg:pt-44 pb-16 sm:pb-20 px-6 sm:px-12 lg:px-16 xl:px-20 overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 -z-30 h-full w-full">
          <Image
            src="/images/bg.webp"
            alt="Scenic coastline of Sri Lanka"
            fill
            priority
            className="object-cover object-center w-full h-full opacity-35"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#051726]/95 via-[#051726]/85 to-[#051726]/60"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#051726] via-transparent to-transparent"
          />
        </div>

        <div className="mx-auto w-[85%] max-w-[1530px] relative z-10 text-center flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#f5a623]" />
            <span className="text-[#f5a623] text-xs sm:text-sm font-extrabold tracking-[0.3em] uppercase">
              Explore The Island
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#f5a623]" />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-tight">
            Destinations &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] via-[#ffc107] to-[#e0951b]">
              Stopovers
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed font-normal">
            From iconic ancient fortresses and mist-shrouded tea hills to pristine coastal beaches, select the places you want to see on your private tour.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. POPULAR DESTINATIONS CARDS SECTION                */}
      {/* ---------------------------------------------------- */}
      <PopularDestinationsSection 
        hideEyebrow
        hideTitle
        hideDescription
        items={ALL_DESTINATIONS}
      />

      {/* ---------------------------------------------------- */}
      {/* 3. ALL DESTINATIONS DIRECTORY (BY REGION)            */}
      {/* ---------------------------------------------------- */}
      {destinations.length > 0 && (
        <section className="w-full bg-[#faf8f5] text-[#061b2e] py-20 sm:py-28 px-6 sm:px-12 lg:px-16 xl:px-20 border-t border-slate-200">
          <div className="mx-auto w-[85%] max-w-[1530px]">
            <div className="flex flex-col items-start mb-12">
              <span className="text-[#c97710] text-xs font-extrabold tracking-[0.25em] uppercase mb-2">
                All Available Stops
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-[#061b2e]">
                Places on Our Routes By Region
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Click any destination to see available tours and itinerary highlights.
              </p>
            </div>

            {regions.map((region) => (
              <div key={region} className="mt-12 first:mt-0">
                <div className="border-b-2 border-slate-300 pb-3 flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#061b2e]">
                    {region}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {destinations.filter((d) => (d.region || "Other places") === region).length} Places
                  </span>
                </div>
                <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {destinations
                    .filter((d) => (d.region || "Other places") === region)
                    .map((d) => (
                      <DestinationCard key={d.id} destination={d} media={d.coverMediaId ? media[d.coverMediaId] : undefined} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
