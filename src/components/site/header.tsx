"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "./logo";

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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
    <header className="absolute top-0 inset-x-0 z-50 bg-gradient-to-b from-black/70 via-black/30 to-transparent border-b border-white/10 text-white">
      <div className="mx-auto flex h-20 max-w-[1530px] items-center justify-between gap-4 px-6 sm:px-12 lg:px-16 xl:px-20">

        <Link href="/" className="flex items-center gap-3 group">
          <LogoMark />
          <span className="font-display text-lg font-bold leading-none tracking-tight text-white group-hover:text-[#f5a623] transition-colors">
            {businessName}
          </span>
        </Link>
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
        <Link
          href="/packages"
          className="bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-sm px-5.5 py-2.5 rounded-full inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-105 shrink-0"
        >
          <span>Book a trip</span>
          <ArrowRight className="size-4 stroke-[2.5]" />
        </Link>
      </div>
      <nav aria-label="Main mobile" className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs text-white hover:bg-white/20"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
