import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExplorePackagesSection } from "@/components/site/explore-packages";
import {
  ShieldCheck,
  Car,
  MapPin,
  Clock,
  CheckCircle2,
  MessageCircle,
  HelpCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tour Packages | Bentota Smart Journeys",
  description: "Explore our signature one-day Coastal Escape and two-day Highland Discovery private tour packages with private chauffeurs and hotel pickup from Bentota.",
};

const INCLUDED = [
  {
    icon: Car,
    title: "Private A/C Vehicle & Fuel",
    desc: "Modern, comfortable air-conditioned car, SUV or passenger van dedicated exclusively to your group.",
  },
  {
    icon: MapPin,
    title: "Doorstep Hotel Pickup & Drop-Off",
    desc: "Direct morning collection and evening return from your hotel or resort in Bentota, Beruwala, and Induruwa.",
  },
  {
    icon: ShieldCheck,
    title: "Licensed English Chauffeur Guide",
    desc: "Experienced, courteous local driver who handles all navigation, parking, and island recommendations.",
  },
  {
    icon: Clock,
    title: "Flexible Pacing & Photo Pauses",
    desc: "Zero rushed schedules. Stop whenever you wish for tropical fruits, viewpoints, tea tastings, and photography.",
  },
];

const FAQS = [
  {
    q: "Can I customize the stops in these packages?",
    a: "Absolutely! Every route is fully customizable. You can keep the must-see highlights and choose your preferred stops or add special activities such as river safaris or whale watching.",
  },
  {
    q: "How does payment work?",
    a: "No online pre-payment or credit card is required when booking. We confirm all details via WhatsApp or email, and payment is made comfortably in cash (USD or LKR) upon pickup at your hotel.",
  },
  {
    q: "What is included in the two-day package?",
    a: "The two-day package includes private transportation for both days, fuel, highway tolls, and driver accommodation. Overnight hotel stay can be arranged by us or booked independently by you.",
  },
  {
    q: "What time does hotel pickup usually happen?",
    a: "Most one-day tours depart between 6:30 AM and 8:00 AM depending on your chosen route. We adjust the pickup timing to suit your preference and avoid rush-hour traffic.",
  },
];

export default function PackagesPage() {
  return (
    <main className="w-full overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO HEADER                                       */}
      {/* ---------------------------------------------------- */}
      <section className="relative isolate w-full bg-[#051726] text-white pt-32 sm:pt-40 lg:pt-44 pb-16 sm:pb-20 px-6 sm:px-12 lg:px-16 xl:px-20 overflow-hidden">
        {/* Ambient background and image */}
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
              Curated Island Journeys
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#f5a623]" />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-tight">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] via-[#ffc107] to-[#e0951b]">
              Tour Packages
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed font-normal">
            Choose between our high-demand one-day coastal escape or comprehensive two-day highland discovery. All packages feature door-to-door hotel collection in Bentota.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. THE TWO PACKAGES (EXPLORE PACKAGES SECTION)       */}
      {/* ---------------------------------------------------- */}
      <div className="-mt-6 sm:-mt-10 relative z-20">
        <ExplorePackagesSection hideHeader />
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. WHAT'S INCLUDED IN EVERY PACKAGE                   */}
      {/* ---------------------------------------------------- */}
      <section className="w-full bg-white text-[#061b2e] py-20 sm:py-28 px-6 sm:px-12 lg:px-16 xl:px-20 border-t border-slate-200">
        <div className="mx-auto w-[85%] max-w-[1530px]">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#061b2e]">
              Standard In <span className="text-[#f5a623]">Every Package</span>
            </h2>
            <p className="mt-3.5 max-w-2xl mx-auto text-sm sm:text-base text-slate-600">
              When you book a private tour with Bentota Smart Journeys, you travel with transparent, all-inclusive transport and peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INCLUDED.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#faf8f5] border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-[#f5a623] mb-5">
                    <Icon className="size-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#061b2e] uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. FREQUENTLY ASKED QUESTIONS                        */}
      {/* ---------------------------------------------------- */}
      <section className="w-full bg-[#faf8f5] text-[#061b2e] py-20 sm:py-24 px-6 sm:px-12 lg:px-16 xl:px-20 border-t border-slate-200">
        <div className="mx-auto w-[85%] max-w-[1100px]">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#c97710] uppercase tracking-wider mb-3">
              <HelpCircle className="size-3.5" /> Common Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-[#061b2e]">
              Package FAQs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl bg-white p-6 sm:p-7 border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-[#061b2e] flex items-start gap-2.5">
                  <CheckCircle2 className="size-5 text-[#f5a623] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-7.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-600 mb-4">
              Need a custom multi-day itinerary or special route request?
            </p>
            <Link
              href="/#contact"
              className="bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-sm px-7 py-3.5 rounded-full inline-flex items-center gap-2 transition-all shadow-md hover:scale-105"
            >
              <MessageCircle className="size-4" />
              <span>Contact Us For A Custom Quote</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
