"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoMark } from "./logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact Us" },
];

export function SiteHeader({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "");
      if (pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${targetId}`);
        }
      }
    }
  };

  return (
    <>
      <header className="absolute top-0 inset-x-0 z-40 bg-gradient-to-b from-black/75 via-black/35 to-transparent border-b border-white/10 text-white">
        <div className="mx-auto flex h-20 max-w-[1530px] items-center justify-between gap-4 px-6 sm:px-12 lg:px-16 xl:px-20">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <LogoMark />
            <span className="font-display text-base sm:text-lg font-bold leading-none tracking-tight text-white group-hover:text-[#f5a623] transition-colors truncate">
              {businessName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA & Mobile Hamburger Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/packages"
              className="hidden md:inline-flex bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-sm px-5.5 py-2.5 rounded-full items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-105 shrink-0"
            >
              <span>Book a trip</span>
              <ArrowRight className="size-4 stroke-[2.5]" />
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623] md:hidden"
            >
              {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-[#051726]/98 backdrop-blur-xl md:hidden animate-in fade-in duration-200"
        >
          {/* Mobile Drawer Header */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-6 sm:px-12">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 min-w-0">
              <LogoMark />
              <span className="font-display text-base sm:text-lg font-bold leading-none tracking-tight text-white truncate">
                {businessName}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623]"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Mobile Drawer Navigation Links */}
          <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-8 sm:px-12">
            <nav aria-label="Mobile" className="flex flex-col space-y-2">
              {nav.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-all",
                      isActive
                        ? "bg-white/10 text-[#f5a623]"
                        : "text-white/90 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-4 opacity-40" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Drawer Action */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <Link
                href="/packages"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f5a623] py-3.5 text-center text-base font-bold text-[#051726] shadow-lg transition-transform active:scale-95 hover:bg-[#e0951b]"
              >
                <span>Book a trip</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
