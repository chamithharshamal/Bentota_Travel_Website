"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Leaf, 
  Star, 
  Route 
} from "lucide-react";

interface StatItem {
  id: string;
  icon: typeof Users;
  targetValue: number;
  suffix: string;
  decimals?: number;
  label: string;
  description: string;
}

const STATS: StatItem[] = [
  {
    id: "travelers",
    icon: Users,
    targetValue: 12500,
    suffix: "+",
    label: "HAPPY TRAVELERS",
    description: "Guests from 40+ countries discovering Sri Lanka with us.",
  },
  {
    id: "stops",
    icon: Leaf,
    targetValue: 50,
    suffix: "+",
    label: "CURATED STOPS",
    description: "Beaches, tea plantations & UNESCO heritage sites.",
  },
  {
    id: "rating",
    icon: Star,
    targetValue: 4.9,
    suffix: " / 5",
    decimals: 1,
    label: "GUEST RATING",
    description: "Over 1,800+ 5-star reviews on TripAdvisor & Google.",
  },
  {
    id: "routes",
    icon: Route,
    targetValue: 100,
    suffix: "%",
    label: "TAILORED ROUTES",
    description: "Fully customizable itineraries with private chauffeurs.",
  },
];

function StatItemRow({ 
  stat, 
  isFirst, 
  isLast 
}: { 
  stat: StatItem; 
  isFirst: boolean; 
  isLast: boolean;
}) {
  const [currentValue, setCurrentValue] = useState(0);
  const Icon = stat.icon;

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1400; // ms

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = easeProgress * stat.targetValue;
      setCurrentValue(val);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrentValue(stat.targetValue);
      }
    };

    const frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [stat.targetValue]);

  const formattedNumber = stat.decimals
    ? currentValue.toFixed(stat.decimals)
    : Math.floor(currentValue).toLocaleString();

  return (
    <div className={`flex items-start gap-3.5 sm:gap-4 lg:px-5 xl:px-7 ${isFirst ? 'lg:pl-2' : ''} ${isLast ? 'lg:pr-2' : ''}`}>
      {/* Circular Icon Badge */}
      <div className="flex size-11 sm:size-12 lg:size-12 xl:size-13 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-[#f5a623] shrink-0 shadow-sm mt-0.5">
        <Icon className="size-5 sm:size-5.5 stroke-[1.8]" />
      </div>

      {/* Text Block */}
      <div className="min-w-0 flex-1">
        <div className="text-2xl sm:text-3xl lg:text-[1.85rem] xl:text-3xl font-extrabold text-white tracking-tight leading-none">
          {formattedNumber}
          <span className="text-[#f5a623]">{stat.suffix}</span>
        </div>

        <h3 className="mt-1.5 text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase leading-tight">
          {stat.label}
        </h3>

        <p className="mt-1 text-[11px] sm:text-xs text-white/70 leading-relaxed font-normal">
          {stat.description}
        </p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate w-full min-h-screen overflow-hidden bg-[#051726] text-white flex flex-col justify-between pt-28 lg:pt-36 pb-12 sm:pb-16 lg:pb-20">
      {/* Background Image & Ambient Gradients */}
      <div className="absolute inset-0 -z-30 h-full w-full">
        <Image
          src="/images/bg.webp"
          alt="Galle Fort Lighthouse Sri Lanka sunset"
          fill
          priority
          className="object-cover object-center w-full h-full"
          sizes="100vw"
        />
        {/* Soft dark vignette gradients on left & top for maximum text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#051726]/90 via-[#051726]/60 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#051726]/90 via-transparent to-[#051726]/40"
        />
      </div>

      {/* Decorative Cursive "Sri Lanka" Watermark (Top Right) */}
      <div
        aria-hidden="true"
        className="absolute top-25 right-12 sm:right-28 lg:right-44 z-0 pointer-events-none select-none -rotate-6"
      >
        <span className="font-script text-[0.5rem] sm:text-[2.5rem] lg:text-[4.5rem] text-white/20 leading-none block tracking-wide font-normal">
          Sri Lanka
        </span>
      </div>

      {/* Vertical Text Column (Far Right Edge) */}
      <div
        aria-hidden="true"
        className="hidden md:flex absolute right-6 lg:right-10 top-32 z-10 flex-col gap-1.5 text-right pointer-events-none select-none text-[11px] font-bold tracking-[0.28em] text-white/60 uppercase"
      >
        <span>Beaches</span>
        <span>Culture</span>
        <span>Nature</span>
        <span>People</span>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1530px] px-6 sm:px-12 lg:px-16 xl:px-20 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-end min-h-[540px]">

          {/* Left Column: Title, Subtitle, Text, CTAs & Features */}
          <div className="lg:col-span-7 flex flex-col items-start pt-4 lg:pt-0">
            {/* Top Subtitle */}
            <p className="text-[#f5a623] text-xs sm:text-sm font-bold tracking-[0.3em] uppercase mb-4">
              Sri Lanka, Your Way
            </p>

            {/* Main Headline with Yellow Brush Underline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[1.02] sm:leading-[1.05]">
              Journey To
              <br />
              <span className="relative inline-block text-[#f5a623] mr-3">
                Explore
                {/* Handpainted Gold Brush Accent SVG */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-4 sm:h-5 text-[#f5a623] overflow-visible"
                  viewBox="0 0 240 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 10C50 3, 130 2, 235 7C170 14, 90 16, 5 12Z"
                    fill="currentColor"
                    opacity="0.95"
                  />
                  <path
                    d="M15 13C75 7, 160 8, 225 10C165 14, 85 15, 10 14Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="text-white">Sri Lanka</span>
            </h1>

            {/* Subtext Paragraph */}
            <p className="mt-5 max-w-lg text-base sm:text-lg text-white/85 leading-relaxed font-normal">
              Pick a one-day or two-day route, keep the places you want to see, and we collect you from your hotel in Bentota.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/book"
                className="bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-base px-7 py-3.5 rounded-full inline-flex items-center gap-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Book now</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/tours/one-day"
                className="border border-white/35 hover:border-white/60 bg-black/25 hover:bg-white/10 backdrop-blur-md text-white font-semibold text-base px-8 py-3.5 rounded-full transition-all"
              >
                Learn more
              </Link>
            </div>

            {/* Feature Badges Row */}
            <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md shrink-0">
                  <MapPin className="size-4 text-white stroke-[2]" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-white/90 leading-tight">
                  Handpicked
                  <br />
                  Destinations
                </span>
              </div>

              <div className="hidden sm:block h-8 w-px bg-white/20" />

              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md shrink-0">
                  <Users className="size-4 text-white stroke-[2]" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-white/90 leading-tight">
                  Local
                  <br />
                  Expert Guides
                </span>
              </div>

              <div className="hidden sm:block h-8 w-px bg-white/20" />

              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md shrink-0">
                  <ShieldCheck className="size-4 text-white stroke-[2]" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-white/90 leading-tight">
                  Safe &amp;
                  <br />
                  Comfortable Travel
                </span>
              </div>
            </div>

            {/* Bottom-left Cursive Accent Text */}
            <div className="mt-8 sm:mt-12 font-script text-white/70 text-2xl sm:text-3xl leading-snug tracking-wide">
              <p>More than a trip</p>
              <p className="relative inline-block">
                <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-white/40 rounded-full" />
              </p>
            </div>
          </div>

          {/* Right Column: 3D Overlapping Polaroid Cards (Bottom Right Area) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center lg:justify-end items-end pb-2">
            <div className="relative w-[320px] sm:w-[390px] lg:w-[430px] h-[300px] sm:h-[350px] lg:h-[380px]">

              {/* Polaroid 1 (Left - Nine Arch Bridge Train) */}
              <div className="absolute left-0 bottom-4 sm:bottom-6 z-10 -rotate-12 hover:rotate-0 transition-transform duration-300 origin-bottom-left group">
                <div className="w-[155px] sm:w-[190px] lg:w-[205px] bg-white p-2 sm:p-2.5 pb-6 sm:pb-7 rounded-lg shadow-2xl border border-white/60 ring-1 ring-black/10">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-neutral-100">
                    <Image
                      src="/images/train.webp"
                      alt="Nine Arch Bridge Blue Train"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="205px"
                    />
                  </div>
                </div>
              </div>

              {/* Polaroid 3 (Right - Tropical Beach Swing) */}
              <div className="absolute right-0 bottom-2 sm:bottom-4 z-15 rotate-12 hover:rotate-0 transition-transform duration-300 origin-bottom-right group">
                <div className="w-[155px] sm:w-[190px] lg:w-[205px] bg-white p-2 sm:p-2.5 pb-6 sm:pb-7 rounded-lg shadow-2xl border border-white/60 ring-1 ring-black/10">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-neutral-100">
                    <Image
                      src="/images/beach.webp"
                      alt="Bentota Tropical Beach Swing"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="205px"
                    />
                  </div>
                </div>
              </div>

              {/* Polaroid 2 (Center Front - Wild Elephant in Sri Lanka Nature) */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20 -rotate-3 hover:rotate-0 transition-transform duration-300 group">
                <div className="w-[185px] sm:w-[220px] lg:w-[235px] bg-white p-2.5 sm:p-3 pb-5 sm:pb-6 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-white/90 ring-1 ring-black/10">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-neutral-100">
                    <Image
                      src="/images/elephant.webp"
                      alt="Wild Asian Elephant Sri Lanka"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="235px"
                    />
                  </div>
                  {/* Handwritten Script Caption on Polaroid Frame */}
                  <div className="mt-2.5 text-center font-script text-neutral-800 leading-tight">
                    <p className="text-xl sm:text-2xl font-bold">Different Stories</p>
                    <p className="text-xl sm:text-2xl font-bold relative inline-block">
                      Same Island
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neutral-800/40 rounded-full" />
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Unified Single Glassmorphic Stat Bar Card (Separated into 4) */}
        <div className="mt-12 sm:mt-16 w-full rounded-3xl border border-white/15 bg-[#061e32]/65 backdrop-blur-xl p-6 sm:p-7 lg:p-7 xl:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/15">
            {STATS.map((stat, idx) => (
              <StatItemRow 
                key={stat.id} 
                stat={stat} 
                isFirst={idx === 0} 
                isLast={idx === STATS.length - 1} 
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
