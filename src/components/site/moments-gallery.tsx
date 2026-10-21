"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";

interface GallerySlide {
  id: string;
  image: string;
  alt: string;
  scriptText?: string;
  scriptPosition?: "top-left" | "top-right";
}

const GALLERY_SLIDES: GallerySlide[] = [
  {
    id: "sigiriya",
    image: "/images/gal-sigiriya.webp",
    alt: "Pidurangala view of Sigiriya Fortress at sunrise",
    scriptText: "Collect Moments Not Things",
    scriptPosition: "top-left",
  },
  {
    id: "mountain",
    image: "/images/gal-mountain.webp",
    alt: "Traveler on Adam's Peak mountain sunrise",
  },
  {
    id: "train",
    image: "/images/gal-train.webp",
    alt: "Nine Arch Bridge Blue Train traveler",
  },
  {
    id: "friends",
    image: "/images/gal-friends.webp",
    alt: "Travelers with map exploring Galle Fort Sri Lanka",
  },
  {
    id: "beach",
    image: "/images/gal-beach.webp",
    alt: "Tropical beach swing in Bentota Sri Lanka",
  },
  {
    id: "lighthouse",
    image: "/images/gal-lighthouse.webp",
    alt: "Galle Fort Lighthouse coastal sunset",
    scriptText: "Same Island Different Stories",
    scriptPosition: "top-right",
  },
];

export function MomentsFromTravellersSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : GALLERY_SLIDES.length - 1;
    scrollToSlide(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = activeIndex < GALLERY_SLIDES.length - 1 ? activeIndex + 1 : 0;
    scrollToSlide(nextIndex);
  };

  return (
    <section className="relative isolate w-full bg-white text-[#061b2e] py-20 sm:py-28 px-4 sm:px-12 lg:px-16 xl:px-20 overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.06),transparent_70%)] pointer-events-none"
      />

      {/* Top-Left Circular Travel Stamp Graphic */}
      <div
        aria-hidden="true"
        className="hidden xl:flex absolute left-8 top-12 items-center justify-center size-28 rounded-full border border-slate-300 text-slate-500 select-none pointer-events-none -rotate-12 p-3 text-center"
      >
        <div className="flex flex-col items-center">
          <Camera className="size-5 mb-1 text-[#f5a623]" />
          <span className="text-[9px] font-bold tracking-widest uppercase leading-tight">
            Travel
            <br />
            Capture
            <br />
            Repeat
          </span>
        </div>
      </div>

      {/* Top-Right Decorative Cursive Watermark */}
      <div
        aria-hidden="true"
        className="hidden xl:block absolute right-8 top-12 font-script text-slate-300/80 text-3xl lg:text-4xl leading-tight select-none pointer-events-none rotate-6 text-right"
      >
        <p>Good Places</p>
        <p className="mr-3">Good People</p>
        <p className="mr-6 relative inline-block">
          Brighter Stories
          <span className="absolute -bottom-1 right-0 w-12 h-0.5 bg-slate-300 rounded-full" />
        </p>
      </div>

      <div className="mx-auto w-[80%] relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          {/* Subtitle tag with horizontal accent lines */}
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#f5a623]" />
            <span className="text-[#c97710] text-xs sm:text-sm font-extrabold tracking-[0.3em] uppercase">
              Travel Gallery
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#f5a623]" />
          </div>

          {/* Main Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-[#061b2e]">
            Moments From{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] via-[#ffc107] to-[#e0951b]">
              Travellers
            </span>
          </h2>

          {/* Subtitle description */}
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Real places. Real people. Real stories. Explore the world through the eyes of our travellers.
          </p>
        </div>

        {/* ---------------------------------------------------- */}
        {/* MOBILE VIEW: Interactive Touch Image Slider (md:hidden) */}
        {/* ---------------------------------------------------- */}
        <div className="block md:hidden mt-10 relative">
          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none py-2 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {GALLERY_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="snap-center shrink-0 w-[88vw] sm:w-[360px] h-[400px] relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900"
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="88vw"
                  className="object-cover object-center"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
                
                {/* Optional Script Overlay */}
                {slide.scriptText && slide.scriptPosition === "top-left" && (
                  <div className="absolute top-6 left-6 z-20 font-script text-white/95 text-2xl leading-snug drop-shadow-md -rotate-3">
                    <p>Collect</p>
                    <p className="ml-2">Moments</p>
                    <p className="ml-4 text-[#f5a623]">Not Things</p>
                  </div>
                )}

                {slide.scriptText && slide.scriptPosition === "top-right" && (
                  <div className="absolute top-6 right-6 z-20 font-script text-white/95 text-2xl leading-snug drop-shadow-md rotate-3 text-right">
                    <p>Same Island</p>
                    <p className="text-[#f5a623]">Different Stories</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Slider Controls: Arrows & Dot Indicators */}
          <div className="mt-6 flex items-center justify-between px-4">
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="flex size-11 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 shadow-md hover:bg-[#f5a623] hover:text-[#051726] transition-colors"
            >
              <ChevronLeft className="size-6 stroke-[2.5]" />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {GALLERY_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-8 bg-[#f5a623]"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="flex size-11 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 shadow-md hover:bg-[#f5a623] hover:text-[#051726] transition-colors"
            >
              <ChevronRight className="size-6 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* DESKTOP VIEW: Bento Gallery Grid (hidden md:grid)   */}
        {/* ---------------------------------------------------- */}
        <div className="hidden md:grid mt-14 grid-cols-12 gap-5 lg:gap-6 items-stretch">
          
          {/* Left Column (2 Stacked Rectangular Cards) */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-5 lg:gap-6">
            {/* Card 1: Mountain Summit Sunrise */}
            <div className="relative h-60 sm:h-64 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 group bg-slate-900">
              <Image
                src="/images/gal-mountain.webp"
                alt="Traveler on Adam's Peak mountain sunrise"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Card 2: Galle Fort Friends with Map */}
            <div className="relative h-60 sm:h-64 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 group bg-slate-900">
              <Image
                src="/images/gal-friends.webp"
                alt="Travelers with map exploring Galle Fort Sri Lanka"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>

          {/* Center Column (1 TALL Vertical Card) */}
          <div className="md:col-span-4 lg:col-span-5 relative min-h-[480px] sm:min-h-[530px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg hover:shadow-2xl transition-all duration-300 group bg-slate-900">
            <Image
              src="/images/gal-sigiriya.webp"
              alt="Pidurangala view of Sigiriya Fortress at sunrise"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
            
            {/* Cursive Overlay Script on Center Card */}
            <div className="absolute top-6 left-6 z-20 font-script text-white/95 text-2xl sm:text-3xl leading-snug drop-shadow-lg -rotate-3">
              <p>Collect</p>
              <p className="ml-3">Moments</p>
              <p className="ml-6 relative inline-block">
                Not Things
                <span className="absolute -bottom-1 left-0 w-10 h-0.5 bg-white/50 rounded-full" />
              </p>
            </div>
          </div>

          {/* Right Column (Top 2 Small Cards + Bottom Wide Card) */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-5 lg:gap-6 justify-between">
            {/* Top Row Split (Beach Swing & Nine Arch Train) */}
            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              {/* Card A: Beach Swing */}
              <div className="relative h-56 sm:h-60 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 group bg-slate-900">
                <Image
                  src="/images/gal-beach.webp"
                  alt="Tropical beach swing in Bentota Sri Lanka"
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Card B: Nine Arch Train Traveler */}
              <div className="relative h-56 sm:h-60 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 group bg-slate-900">
                <Image
                  src="/images/gal-train.webp"
                  alt="Nine Arch Bridge Blue Train traveler"
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Bottom Row Wide Card (Galle Fort Lighthouse Sunset) */}
            <div className="relative h-60 sm:h-64 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 group bg-slate-900">
              <Image
                src="/images/gal-lighthouse.webp"
                alt="Galle Fort Lighthouse coastal sunset"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
              
              {/* Cursive Overlay Script on Bottom Right Card */}
              <div className="absolute top-5 right-6 z-20 font-script text-white/95 text-xl sm:text-2xl leading-snug drop-shadow-lg text-right rotate-2">
                <p>Same Island</p>
                <p className="relative inline-block">
                  Different Stories
                  <span className="absolute -bottom-1 right-0 w-10 h-0.5 bg-white/50 rounded-full" />
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
