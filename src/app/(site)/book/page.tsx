import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard, type WizardRoute } from "@/components/booking/booking-wizard";
import { Spinner } from "@/components/ui/misc";
import { getBookableRoutes, getPublishedDestinations, getSettings } from "@/lib/server/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Book a trip" };

export default async function BookPage() {
  const [routes, destinations, settings] = await Promise.all([getBookableRoutes(), getPublishedDestinations(), getSettings()]);
  const names = Object.fromEntries(destinations.map((d) => [d.id, d.name]));

  const wizardRoutes: WizardRoute[] = routes.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    tripType: r.tripType,
    summary: r.summary,
    duration: r.duration,
    maxSelectable: r.maxSelectable,
    pickupPoints: r.pickupPoints,
    pricing: r.pricing,
    stops: r.stops.map((s) => ({ ...s, name: names[s.destinationId] ?? "" })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Book a trip</h1>
      <p className="mt-3 max-w-prose text-ocean-950/70">
        Send a booking request in four steps. No payment is taken online.
      </p>
      <div className="mt-10">
        <Suspense fallback={<Spinner />}>
          <BookingWizard routes={wizardRoutes} childPolicy={settings.childPolicy} minDaysAhead={settings.bookingMinDaysAhead} />
        </Suspense>
      </div>
    </div>
  );
}
