import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Sparkles, 
  Compass, 
  Star, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  HeartHandshake
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Bentota Smart Journeys",
  description: "Learn about Bentota Smart Journeys, our local heritage, licensed expert drivers, private luxury fleet, and our commitment to unforgettable Sri Lankan travel.",
};

const VALUES = [
  {
    icon: Compass,
    title: "100% Private & Flexible",
    description: "No crowded tour buses or rigid timetables. You travel exclusively with your group, pausing whenever you want for scenic photos or fresh king coconuts.",
  },
  {
    icon: Users,
    title: "Passionate Local Guides",
    description: "Our certified chauffeurs are born-and-raised islanders with deep knowledge of Sri Lanka's hidden temples, folklore, viewpoints, and finest eateries.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Upfront Financial Risk",
    description: "Book your itinerary with complete confidence. No online pre-payments or credit card details required — pay comfortably upon pickup at your hotel.",
  },
  {
    icon: HeartHandshake,
    title: "True Sri Lankan Hospitality",
    description: "From cold mineral water in our air-conditioned vehicles to warm hospitality, we ensure every detail of your journey is effortless and memorable.",
  },
];

const STATS = [
  { value: "12,500+", label: "Happy Travelers", sub: "From 40+ countries" },
  { value: "50+", label: "Curated Stops", sub: "Island-wide heritage & nature" },
  { value: "4.9 / 5", label: "Guest Rating", sub: "Over 1,800+ 5-star reviews" },
  { value: "100%", label: "Private Tours", sub: "Door-to-door comfort" },
];

export default function AboutPage() {
  return (
    <main className="w-full overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO BANNER                                       */}
      {/* ---------------------------------------------------- */}
      <section className="relative isolate w-full bg-[#051726] text-white pt-32 sm:pt-40 lg:pt-44 pb-20 sm:pb-28 px-4 sm:px-12 lg:px-16 xl:px-20 overflow-hidden">
        {/* Background Image with Dark Overlays */}
        <div className="absolute inset-0 -z-30 h-full w-full">
          <Image
            src="/images/bg.webp"
            alt="Bentota beach sunset and coastal lighthouse"
            fill
            priority
            className="object-cover object-center w-full h-full opacity-40"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#051726]/95 via-[#051726]/80 to-[#051726]/60"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#051726] via-transparent to-transparent"
          />
        </div>

        {/* Decorative Cursive Watermark */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute right-12 top-32 font-script text-white/10 text-5xl lg:text-7xl leading-none select-none pointer-events-none -rotate-6"
        >
          Born in Bentota
        </div>

        <div className="mx-auto w-full max-w-[1530px] sm:w-[85%] relative z-10">
          <div className="max-w-3xl">
            {/* Eyebrow Tag */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#f5a623]" />
              <span className="text-[#f5a623] text-xs sm:text-sm font-extrabold tracking-[0.3em] uppercase">
                Our Story &amp; Heritage
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[1.05]">
              Crafting Memories{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] via-[#ffc107] to-[#e0951b]">
                Across Sri Lanka
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed font-normal">
              Born on the golden southwest shores of Bentota, we craft personalized one-day and multi-day private journeys designed around your pace, preferences, and passions.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/packages"
                className="bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-sm sm:text-base px-7 py-3.5 rounded-full inline-flex items-center gap-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>View tour packages</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/#contact"
                className="border border-white/35 hover:border-white/60 bg-white/5 hover:bg-white/15 backdrop-blur-md text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full transition-all"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. THE STORY BEHIND BENTOTA SMART JOURNEYS           */}
      {/* ---------------------------------------------------- */}
      <section className="relative isolate w-full bg-white text-[#061b2e] py-20 sm:py-28 px-4 sm:px-12 lg:px-16 xl:px-20 overflow-hidden">
        <div className="mx-auto w-full max-w-[1530px] sm:w-[85%] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Narrative */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-4 text-[#f5a623]" />
                <span className="text-[#c97710] text-xs font-extrabold tracking-[0.25em] uppercase">
                  Who We Are
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#061b2e] leading-tight">
                More Than A Tour Company —{" "}
                <span className="text-[#f5a623]">Your Local Friends</span>
              </h2>

              <div className="mt-6 space-y-5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                <p>
                  Bentota Smart Journeys was founded with a singular conviction: international travelers deserve to experience Sri Lanka with absolute freedom, genuine comfort, and zero travel stress.
                </p>
                <p>
                  For years, visitors were constrained by rigid tour buses, predetermined schedules, and impersonal large-group excursions that spent more time in transit than enjoying destinations. We set out to change that entirely.
                </p>
                <p>
                  Today, from our home base in Bentota, we collect travelers directly from their beachfront resorts, luxury villas, and boutique hotels in pristine, air-conditioned private vehicles. Whether you want to witness the sunrise atop Sigiriya Rock, ride the iconic blue train through Ella’s misty tea hills, or drift through Bentota’s lush river mangroves, we tailor every single mile to you.
                </p>
              </div>

              {/* Guarantees Badges Row */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-slate-200">
                  <CheckCircle2 className="size-5 text-[#c97710] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-[#061b2e]">Direct Hotel Pickup in Bentota Area</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-slate-200">
                  <CheckCircle2 className="size-5 text-[#c97710] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-[#061b2e]">Fully Licensed &amp; Insured Chauffeurs</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src="/images/dest-ella.webp"
                    alt="Traveler enjoying the hill country in Sri Lanka"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061b2e] via-transparent to-black/20" />
                </div>

                {/* Floating Quote Block at Bottom of Image */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white z-10">
                  <p className="font-script text-2xl sm:text-3xl text-[#f5a623] leading-snug">
                    &ldquo;We don&apos;t just drive you places; we invite you into our island home.&rdquo;
                  </p>
                  <p className="mt-2 text-xs font-bold tracking-wider uppercase text-white/80">
                    — The Bentota Smart Journeys Team
                  </p>
                </div>
              </div>

              {/* Decorative Pill Badge Floating Outside */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 flex items-center gap-3 z-20">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-[#f5a623] shrink-0">
                  <Star className="size-5 fill-current" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#061b2e]">4.9 / 5 Rating</p>
                  <p className="text-[11px] text-slate-500 font-medium">1,800+ Verified Traveler Reviews</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. CORE VALUES & PILLARS (LIGHT THEME)               */}
      {/* ---------------------------------------------------- */}
      <section className="relative isolate w-full bg-[#faf8f5] text-[#061b2e] py-20 sm:py-28 px-4 sm:px-12 lg:px-16 xl:px-20 overflow-hidden border-y border-slate-200/70">
        <div className="mx-auto w-full max-w-[1530px] sm:w-[85%] relative z-10">
          
          <div className="flex flex-col items-center text-center mb-14">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#f5a623]" />
              <span className="text-[#c97710] text-xs sm:text-sm font-extrabold tracking-[0.3em] uppercase">
                Why Travel With Us
              </span>
              <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#f5a623]" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#061b2e]">
              The Smart Journeys <span className="text-[#f5a623]">Difference</span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Every detail of our service is carefully engineered to deliver the safest, smoothest, and most enriching experience in Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-slate-200/90 p-7 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.1)] hover:border-[#f5a623]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex size-13 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[#f5a623] mb-6">
                      <Icon className="size-6 stroke-[2]" />
                    </div>

                    <h3 className="text-lg font-extrabold uppercase tracking-tight text-[#061b2e] leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. STATS STRIP                                       */}
      {/* ---------------------------------------------------- */}
      <section className="w-full bg-[#051726] text-white py-14 sm:py-18 px-4 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-[1530px] sm:w-[85%]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-white/10">
            {STATS.map((s, i) => (
              <div key={i} className={`flex flex-col items-center text-center ${i > 0 ? "lg:pl-8" : ""}`}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#f5a623]">
                    {s.value}
                  </span>
                </div>
                <h4 className="mt-2 text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
                  {s.label}
                </h4>
                <p className="mt-0.5 text-[11px] sm:text-xs text-white/60">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. HOTEL PICKUP REGION MAP CARD                      */}
      {/* ---------------------------------------------------- */}
      <section className="w-full bg-white text-[#061b2e] py-20 sm:py-24 px-4 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-[85%] max-w-[1530px]">
          <div className="rounded-3xl bg-gradient-to-br from-[#061b2e] to-[#0a2c4a] text-white p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Ambient decorative glow */}
            <div
              aria-hidden="true"
              className="absolute -right-20 -bottom-20 size-80 bg-[#f5a623]/15 rounded-full blur-3xl pointer-events-none"
            />

            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#f5a623] uppercase tracking-wider mb-3">
                <MapPin className="size-3.5" /> Doorstep Convenience
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
                Complimentary Hotel Pickup Across The Southwest Coast
              </h3>

              <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed font-normal">
                Staying at Cinnamon Bentota Beach, Taj Bentota Resort, Heritance Ahungalla, or any local guesthouse? We provide prompt, door-to-door morning collection and return transfer for all tours.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                href="/#contact"
                className="bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-base px-8 py-4 rounded-full inline-flex items-center gap-2.5 transition-all shadow-xl hover:scale-105"
              >
                <span>Inquire about your hotel</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Link>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
