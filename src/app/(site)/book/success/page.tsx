import type { Metadata } from "next";
import { Check } from "lucide-react";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { getSettings } from "@/lib/server/data";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking request sent", robots: { index: false } };

export default async function BookingSuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const settings = await getSettings();
  const bookingRef = ref && /^BSJ-\d{4}-\d{4,}$/.test(ref) ? ref : null;
  const wa = whatsappLink(
    settings.whatsappNumber,
    bookingRef ? `Hello, I sent booking request ${bookingRef}.` : "Hello, I sent a booking request.",
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 sm:px-6">
      <span className="flex size-14 items-center justify-center rounded-full bg-palm-500 text-white">
        <Check className="size-7" />
      </span>
      <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Booking request sent</h1>
      {bookingRef && (
        <p className="mt-6 text-ocean-950/70">
          Your reference
          <span className="mt-1 block font-display text-3xl font-bold tracking-tight text-ocean-950 tabular-nums">{bookingRef}</span>
        </p>
      )}
      <ol className="mt-10 space-y-5">
        {[
          "Our team reviews your route, stops and date.",
          "We contact you by WhatsApp or phone to confirm the pickup time and final price.",
          "Your trip is confirmed once you agree the details with us.",
        ].map((text, i) => (
          <li key={text} className="grid grid-cols-[2rem_1fr] gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-ocean-900 font-display text-sm font-bold text-white">{i + 1}</span>
            <p className="pt-0.5">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        {wa && (
          <a href={wa} target="_blank" rel="noreferrer" className={buttonClass("primary", "lg")}>
            Message us on WhatsApp
          </a>
        )}
        <LinkButton href="/" variant="outline" size="lg">
          Back to home
        </LinkButton>
      </div>
    </div>
  );
}
