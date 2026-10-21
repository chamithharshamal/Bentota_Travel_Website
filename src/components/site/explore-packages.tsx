"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { RouteMapPopup, type RouteMapPackageData } from "./route-map-popup";

// --- Custom Highlight Icons ---

function PalmIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h11z"/>
      <path d="M13 7.14c1.7.46 3 2 3 3.86h5c0-2.76-2.24-5-5-5-.73 0-1.41.16-2 .46z"/>
      <path d="M12 12c.5 1.5.5 4 0 9"/>
      <path d="M12 12c-1.5 2-2 4-2 9"/>
    </svg>
  );
}

function BinocularsIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="15" r="4"/>
      <circle cx="17" cy="15" r="4"/>
      <path d="M9 11l1.5-5h3L15 11"/>
      <path d="M10 15h4"/>
    </svg>
  );
}

function CuisineIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12a3 3 0 1 0-3-3m3 3a3 3 0 1 1 3-3m-3 3v8"/>
      <path d="M6 10a6 6 0 0 0 12 0"/>
    </svg>
  );
}

function CameraIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
}

function LeafIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A9 9 0 0 0 20 11V3h-8a9 9 0 0 0-9 9 9 9 0 0 0 8 8z"/>
      <path d="M11 20v-9"/>
    </svg>
  );
}

function MountainIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
    </svg>
  );
}

function WaterfallIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16M4 20h16M6 4v16M10 4v16M14 4v16M18 4v16"/>
    </svg>
  );
}

function TempleIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v3M4 10a8 8 0 0 1 16 0v10H4V10zM9 20v-4a3 3 0 0 1 6 0v4"/>
    </svg>
  );
}

interface HighlightItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PackageItem {
  id: string;
  badgeLabel: { line1: string; line2: string; line3: string };
  tagline: string;
  title: string;
  description: string;
  duration: string;
  groupSize: string;
  destinations: string;
  region: string;
  price: number;
  image: string;
  href: string;
  highlights: HighlightItem[];
  /** Route map popup data */
  routeMap: RouteMapPackageData;
}

const PACKAGES: PackageItem[] = [
  {
    id: "coastal-escape",
    badgeLabel: { line1: "ONE", line2: "DAY", line3: "PACKAGE" },
    tagline: "SUN, SEA & UNFORGETTABLE MOMENTS",
    title: "The Coastal Escape",
    description: "Golden beaches, turquoise waters and breathtaking sunsets — all in one perfect day.",
    duration: "1 Day",
    groupSize: "2 - 8 Pax",
    destinations: "Galle | Mirissa | Unawatuna",
    region: "South Coast",
    price: 120,
    image: "/images/dest-bentota.webp",
    href: "/book?package=coastal-escape",
    highlights: [
      { label: "Beach Hopping", icon: PalmIcon },
      { label: "Scenic Viewpoints", icon: BinocularsIcon },
      { label: "Local Cuisine", icon: CuisineIcon },
      { label: "Photo Stops", icon: CameraIcon },
    ],
    routeMap: {
      id: "coastal-escape",
      title: "The Coastal Escape",
      tripType: "one-day",
      price: 120,
      defaultDestinations: ["bentota", "hikkaduwa", "galle", "unawatuna", "mirissa"],
      availableDestinations: ["matara", "colombo", "yala", "udawalawe"],
      mandatoryDestinations: ["bentota"],
      maxStops: 6,
      region: "South Coast",
    },
  },
  {
    id: "highland-discovery",
    badgeLabel: { line1: "TWO", line2: "DAYS", line3: "PACKAGE" },
    tagline: "MOUNTAINS, TEA & TIMELESS BEAUTY",
    title: "Highland Discovery",
    description: "Misty mountains, tea plantations, waterfalls and charming towns — a journey that stays with you.",
    duration: "2 Days",
    groupSize: "2 - 8 Pax",
    destinations: "Kandy | Ella | Nuwara Eliya",
    region: "Hill Country",
    price: 240,
    image: "/images/dest-ella.webp",
    href: "/book?package=highland-discovery",
    highlights: [
      { label: "Tea Experiences", icon: LeafIcon },
      { label: "Scenic Train Ride", icon: MountainIcon },
      { label: "Waterfalls & Nature", icon: WaterfallIcon },
      { label: "Cultural Sites", icon: TempleIcon },
    ],
    routeMap: {
      id: "highland-discovery",
      title: "Highland Discovery",
      tripType: "two-day",
      price: 240,
      defaultDestinations: ["kandy", "nuwara-eliya", "ella", "haputale"],
      availableDestinations: ["sigiriya", "dambulla", "colombo", "udawalawe", "yala"],
      mandatoryDestinations: ["kandy"],
      maxStops: 7,
      region: "Hill Country",
    },
  },
];

export function ExplorePackagesSection({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const activePackage = PACKAGES.find((p) => p.id === activePackageId);

  return (
    <section className="relative isolate w-full bg-[#faf8f5] text-[#061b2e] py-20 sm:py-24 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden">
      {/* Decorative Background Contour Lines */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full stroke-amber-500/10 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)] pointer-events-none select-none"
      >
        <defs>
          <pattern id="topo-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#topo-grid)" />
        <path
          d="M -100 100 Q 300 400 1200 -100 M -200 600 Q 500 200 1400 800"
          fill="none"
          stroke="#f5a623"
          strokeWidth="1"
          strokeDasharray="4 8"
          opacity="0.25"
        />
      </svg>

      {/* Outer Watermarks */}
      {/* Top Left Watermark */}
      <div className="hidden lg:block absolute left-8 top-10 pointer-events-none select-none">
        <div className="border-t border-slate-300 pt-1">
          <p className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase">Sri Lanka</p>
          <p className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase">Your Way</p>
        </div>
      </div>

      {/* Top Right Watermark */}
      <div className="hidden lg:block absolute right-10 top-12 font-script text-slate-300 text-3xl xl:text-4xl leading-none rotate-[-4deg] pointer-events-none select-none">
        <p>Small Island</p>
        <p className="ml-4 text-2xl xl:text-3xl">Big Stories</p>
      </div>

      {/* Bottom Left Watermark */}
      <div className="hidden lg:block absolute left-8 bottom-12 font-script text-slate-300 text-3xl xl:text-4xl leading-tight rotate-[-8deg] pointer-events-none select-none">
        <p>Travel More</p>
        <p className="ml-3 text-2xl xl:text-3xl">Live Fuller</p>
      </div>

      {/* Bottom Right Watermark */}
      <div className="hidden lg:block absolute right-8 bottom-12 font-script text-slate-300 text-2xl xl:text-3xl leading-tight rotate-[4deg] pointer-events-none select-none text-right">
        <p>Sri Lanka</p>
        <p className="text-xl xl:text-2xl">Always a Good Idea</p>
      </div>

      <div className="mx-auto w-[80%] relative z-10">
        {/* Section Header */}
        {!hideHeader && (
          <div className="flex flex-col items-center text-center">
            {/* Accent Badge Line */}
            <div className="flex items-center gap-3 mb-2.5">
              <span className="h-px w-10 sm:w-14 bg-gradient-to-r from-transparent to-[#f5a623]" />
              <span className="text-[#c97710] text-xs font-extrabold tracking-[0.25em] uppercase">
                Handpicked Packages
              </span>
              <span className="h-px w-10 sm:w-14 bg-gradient-to-l from-transparent to-[#f5a623]" />
            </div>

            {/* Main Header Title */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#061b2e]">
              <span className="text-[#f5a623]">Explore</span> Our Packages
            </h2>

            {/* Subtitle Description */}
            <p className="mt-3.5 max-w-2xl text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Curated travel experiences across Sri Lanka — beaches, mountains, culture and more.
              <br className="hidden sm:inline" /> Choose your next adventure.
            </p>
          </div>
        )}

        {/* Two Packages Stack */}
        <div className={`${hideHeader ? "mt-4 sm:mt-6" : "mt-12 sm:mt-14"} flex flex-col gap-8 sm:gap-10`}>
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="group relative rounded-3xl bg-white border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.09)] transition-all duration-300 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-visible"
            >
              {/* Image & Yellow Badge Column */}
              <div className="lg:col-span-4 relative w-full h-64 sm:h-72 lg:h-[290px] rounded-2xl overflow-hidden shrink-0">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Left Overlay Button */}
                <div className="absolute bottom-3.5 left-3.5 z-10">
                  <Link
                    href={pkg.href}
                    className="inline-flex items-center gap-2 bg-[#061b2e]/90 hover:bg-[#061b2e] backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-md border border-white/10 transition-all duration-200 group/btn"
                  >
                    <MapPin className="size-3.5 text-[#f5a623]" />
                    <span>{pkg.region}</span>
                    <ArrowRight className="size-3 text-white/70 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Yellow Circle Badge Overlapping Top Right */}
                <div className="absolute top-3 right-3 sm:-top-3 sm:-right-3 z-20 pointer-events-none">
                  <div className="size-20 sm:size-24 rounded-full bg-gradient-to-br from-[#ffce38] via-[#ffc107] to-[#f5a623] text-[#061b2e] flex flex-col items-center justify-center text-center shadow-lg border-2 border-white transform rotate-[-6deg] group-hover:scale-105 transition-transform duration-300">
                    <span className="text-xs sm:text-sm font-black leading-none uppercase tracking-tight">
                      {pkg.badgeLabel.line1}
                    </span>
                    <span className="text-xs sm:text-sm font-black leading-none uppercase tracking-tight mt-0.5">
                      {pkg.badgeLabel.line2}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-[#061b2e]/80 uppercase mt-1">
                      {pkg.badgeLabel.line3}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Package Content */}
              <div className="lg:col-span-5 flex flex-col justify-between py-1 px-1 sm:px-2">
                <div>
                  {/* Category Tagline */}
                  <span className="text-[#c97710] font-extrabold text-[11px] sm:text-xs tracking-widest uppercase">
                    {pkg.tagline}
                  </span>

                  {/* Main Title */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#061b2e] tracking-tight mt-1 group-hover:text-[#c97710] transition-colors">
                    {pkg.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-1.5 font-normal">
                    {pkg.description}
                  </p>

                  {/* Key Info Specs Row */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-700 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-4 text-[#f5a623]" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-4 text-[#f5a623]" />
                      <span>{pkg.groupSize}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-4 text-[#f5a623]" />
                      <span className="truncate max-w-[220px]">{pkg.destinations}</span>
                    </div>
                  </div>
                </div>

                {/* 4 Highlights Icons Grid */}
                <div className="grid grid-cols-4 gap-2 text-center mt-5 pt-4 border-t border-slate-100">
                  {pkg.highlights.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="size-10 sm:size-11 rounded-full bg-[#fffbeb] border border-[#fde68a] flex items-center justify-center text-[#d97706] shadow-xs group-hover:bg-[#fef3c7] transition-colors">
                          <Icon className="size-4 sm:size-5 text-[#d97706]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 leading-tight mt-2 max-w-[70px]">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Pricing & Action Section */}
              <div className="lg:col-span-3 flex flex-col items-center lg:items-start justify-center lg:border-l lg:border-slate-200/80 lg:pl-8 xl:pl-10 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 relative h-full">
                {/* Subtle Leaf Background Watermark */}
                <svg
                  aria-hidden="true"
                  className="absolute right-0 top-0 bottom-0 h-full w-32 text-amber-500/10 pointer-events-none select-none overflow-hidden"
                  viewBox="0 0 120 200"
                  fill="currentColor"
                >
                  <path d="M100 0 C80 30 60 70 30 110 C15 130 0 160 0 200 C35 180 70 150 95 105 C110 75 120 35 120 0 Z" />
                  <path d="M110 20 C90 55 70 90 40 130 C65 120 90 100 110 60 Z" />
                  <path d="M120 50 C95 85 75 120 50 160 C75 150 100 130 120 90 Z" />
                </svg>

                <div className="text-center lg:text-left relative z-10 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-slate-500 block">From</span>
                  <span className="text-4xl sm:text-5xl font-black text-[#061b2e] tracking-tight leading-none block mt-1">
                    ${pkg.price}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500 block mt-1.5 mb-5">
                    / per person
                  </span>

                  <button
                    type="button"
                    onClick={() => setActivePackageId(pkg.id)}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#ffce38] via-[#ffc107] to-[#f5a623] hover:from-[#f5a623] hover:to-[#d97706] text-[#061b2e] font-extrabold text-sm px-6 py-3 rounded-full shadow-[0_4px_14px_rgba(245,166,35,0.4)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.5)] transition-all duration-200 transform hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="size-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Dashed Flight Path Decoration */}
        <div className="relative w-full max-w-3xl mx-auto mt-14 pointer-events-none select-none flex items-center justify-center">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 800 40" fill="none">
            <path
              d="M 50 30 Q 400 0 750 30"
              stroke="#f5a623"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.35"
            />
          </svg>
          <div className="absolute bg-[#ffc107] text-[#061b2e] p-1.5 rounded-full shadow-sm">
            <svg className="size-3.5 rotate-45" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Route Map Popup */}
      {activePackage && (
        <RouteMapPopup
          open={!!activePackageId}
          onClose={() => setActivePackageId(null)}
          packageData={activePackage.routeMap}
        />
      )}
    </section>
  );
}
