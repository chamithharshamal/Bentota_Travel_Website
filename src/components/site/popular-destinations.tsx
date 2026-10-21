"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";

export interface DestinationItem {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  href: string;
  rating?: number;
}

export const ALL_DESTINATIONS: DestinationItem[] = [
  {
    id: "sigiriya",
    title: "SIGIRIYA ROCK",
    location: "SIGIRIYA",
    description: "Ancient 5th-century rock citadel with royal palace ruins, water gardens, and panoramic 360° jungle views.",
    image: "/images/dest-sigiriya.webp",
    href: "/destinations",
    rating: 5,
  },
  {
    id: "ella",
    title: "NINE ARCH BRIDGE",
    location: "ELLA",
    description: "Iconic colonial railway bridge framed by mist-veiled Ceylon tea plantations and cascading waterfalls.",
    image: "/images/dest-ella.webp",
    href: "/destinations",
    rating: 5,
  },
  {
    id: "bentota",
    title: "BENTOTA BEACH",
    location: "BENTOTA",
    description: "Golden sandy south-coast shores, tranquil lagoon mangrove boat safaris, and marine sea turtle hatcheries.",
    image: "/images/dest-bentota.webp",
    href: "/destinations",
    rating: 5,
  },
  {
    id: "galle",
    title: "GALLE DUTCH FORT",
    location: "GALLE",
    description: "UNESCO World Heritage ocean fortress with 17th-century ramparts, iconic lighthouse, and cobblestone lanes.",
    image: "/images/gal-lighthouse.webp",
    href: "/destinations",
    rating: 5,
  },
  {
    id: "yala",
    title: "YALA SAFARI",
    location: "YALA",
    description: "World-famous national park renowned for wild Asian elephants, leopards, sloth bears, and exotic birds.",
    image: "/images/elephant.webp",
    href: "/destinations",
    rating: 5,
  },
  {
    id: "kandy",
    title: "TEMPLE OF THE TOOTH",
    location: "KANDY",
    description: "Sacred royal palace complex cradling the sacred relic of the tooth of Buddha amidst misty highland hills.",
    image: "/images/gal-mountain.webp",
    href: "/destinations",
    rating: 5,
  },
  {
    id: "mirissa",
    title: "MIRISSA & COCONUT HILL",
    location: "MIRISSA",
    description: "Vibrant tropical bay famous for whale watching cruises, surf breaks, and scenic palm-crowned ocean cliffs.",
    image: "/images/gal-beach.webp",
    href: "/destinations",
    rating: 5,
  },
  {
    id: "nuwara-eliya",
    title: "NUWARA ELIYA & TEA",
    location: "NUWARA ELIYA",
    description: "Cool highland tea capital with lush emerald plantations, Ceylon tea factories, and colonial English heritage.",
    image: "/images/train.webp",
    href: "/destinations",
    rating: 5,
  },
];

interface PopularDestinationsSectionProps {
  hideEyebrow?: boolean;
  hideTitle?: boolean;
  hideDescription?: boolean;
  items?: DestinationItem[];
  title?: string;
  highlightTitle?: string;
  className?: string;
}

export function PopularDestinationsSection({
  hideEyebrow = false,
  hideTitle = false,
  hideDescription = false,
  items,
  title = "Popular",
  highlightTitle = "Destinations",
  className = "",
}: PopularDestinationsSectionProps) {
  const displayItems = items || ALL_DESTINATIONS.slice(0, 3);
  const showHeader = !hideEyebrow || !hideTitle || !hideDescription;

  return (
    <section className={`relative isolate w-full bg-white text-[#061b2e] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 xl:px-20 overflow-hidden ${className}`}>
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.06),transparent_70%)] pointer-events-none"
      />

      {/* Decorative Cursive Watermarks (Left & Right) */}
      <div
        aria-hidden="true"
        className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 font-script text-slate-200/80 text-3xl lg:text-4xl leading-tight select-none pointer-events-none -rotate-12"
      >
        <p>Explore</p>
        <p className="ml-4">Discover</p>
        <p className="ml-8">Belong</p>
      </div>

      <div
        aria-hidden="true"
        className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 font-script text-slate-200/80 text-3xl lg:text-4xl leading-tight select-none pointer-events-none rotate-12 text-right"
      >
        <p>Different Stories</p>
        <p className="mr-4">Same Island</p>
      </div>

      <div className="mx-auto w-[85%] max-w-[1530px] relative z-10">
        {/* Section Header */}
        {showHeader && (
          <div className="flex flex-col items-center text-center">
            {/* Optional Subtitle tag with horizontal accent lines */}
            {!hideEyebrow && (
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#f5a623]" />
                <span className="text-[#c97710] text-xs sm:text-sm font-extrabold tracking-[0.3em] uppercase">
                  Uncover Places
                </span>
                <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#f5a623]" />
              </div>
            )}

            {/* Section Main Title */}
            {!hideTitle && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#061b2e]">
                {title}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] via-[#ffc107] to-[#e0951b]">
                  {highlightTitle}
                </span>
              </h2>
            )}

            {/* Optional Subtitle description */}
            {!hideDescription && (
              <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                From cultural landmarks to hidden gems, explore the most loved places handpicked for your next journey.
              </p>
            )}
          </div>
        )}

        {/* Cards Grid */}
        <div className={`${showHeader ? "mt-12 sm:mt-14" : "mt-0"} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`}>
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl overflow-hidden bg-[#061b2e] border border-slate-200 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.18)] hover:border-[#f5a623]/50 flex flex-col justify-end min-h-[380px] sm:min-h-[410px]"
            >
              {/* Card Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient overlay inside card for readability */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#051726] via-[#051726]/65 to-transparent z-10"
              />

              {/* Card Bottom Content */}
              <div className="relative z-20 p-6 sm:p-7 flex flex-col justify-end">
                {/* Meta Top Line: Location Tag & Stars */}
                <div className="flex items-center justify-between text-xs font-bold tracking-widest text-white/90">
                  <div className="flex items-center gap-1.5 uppercase text-[#f5a623]">
                    <MapPin className="size-3.5" />
                    <span className="text-white/95">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[#f5a623] text-sm">
                    {"★".repeat(item.rating || 5)}
                  </div>
                </div>

                {/* Title, Description & Action Button Row */}
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-extrabold uppercase text-white tracking-tight leading-tight group-hover:text-[#f5a623] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Circular Arrow Button */}
                  <Link
                    href={item.href}
                    aria-label={`Explore ${item.title}`}
                    className="flex size-11 sm:size-12 items-center justify-center rounded-full border border-white/35 bg-black/35 backdrop-blur-md text-white group-hover:bg-[#f5a623] group-hover:border-[#f5a623] group-hover:text-[#051726] transition-all duration-300 shadow-lg shrink-0"
                  >
                    <ArrowRight className="size-5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
