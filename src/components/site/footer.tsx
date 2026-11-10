import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";
import { LogoMark } from "./logo";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const wa = whatsappLink(settings.whatsappNumber);
  return (
    <footer className="bg-ocean-950 text-white border-t border-white/10">
      <div className="mx-auto grid w-full max-w-[1530px] sm:w-[85%] lg:w-[80%] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-white">
            <LogoMark />
            <span className="font-display text-xl font-bold">{settings.businessName}</span>
          </div>
          {settings.tagline && <p className="mt-3 max-w-sm text-base text-white/70">{settings.tagline}</p>}
          {settings.address && <p className="mt-4 text-base text-white/70">{settings.address}</p>}
        </div>
        <div>
          <h2 className="text-base font-semibold text-sun-500">Explore</h2>
          <ul className="mt-3 space-y-2 text-base text-white/80">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/packages" className="hover:text-white transition-colors">Tour packages</Link></li>
            <li><Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
            <li><Link href="/#gallery" className="hover:text-white transition-colors">Traveler gallery</Link></li>
            <li><Link href="/#contact" className="hover:text-white transition-colors">Contact us</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-sun-500">Contact</h2>
          <ul className="mt-3 space-y-2 text-base text-white/80">
            {settings.contactPhone && <li><a href={`tel:${settings.contactPhone}`} className="hover:text-white break-all">{settings.contactPhone}</a></li>}
            {settings.contactEmail && <li><a href={`mailto:${settings.contactEmail}`} className="hover:text-white break-all">{settings.contactEmail}</a></li>}
            {wa && <li><a href={wa} target="_blank" rel="noreferrer" className="hover:text-white">Chat on WhatsApp</a></li>}
            <li><Link href="/privacy" className="hover:text-white">Privacy notice</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-[1530px] sm:w-[85%] lg:w-[80%] px-4 py-5 text-sm text-white/50 sm:px-6">
          © {new Date().getFullYear()} {settings.businessName}
        </p>
      </div>
    </footer>
  );
}
