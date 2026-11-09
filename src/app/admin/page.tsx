"use client";

import Link from "next/link";
import { useMemo } from "react";
import { canManageBookings, canManageContent, useAuth } from "@/components/admin/auth-provider";
import { useBookings, useDestinations, useMediaLibrary, usePackages, useRoutes } from "@/components/admin/hooks";
import { BookingTable } from "@/components/admin/booking-table";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/misc";
import { addDays, colomboToday, formatTripDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { role } = useAuth();
  return (
    <>
      <PageHeader title="Dashboard" description={`Today is ${formatTripDate(colomboToday())} in Sri Lanka.`} />
      {canManageBookings(role) && <BookingOverview />}
      {canManageContent(role) && <ContentOverview />}
    </>
  );
}

function Stat({ label, value, href, highlight }: { label: string; value: number; href: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl p-5 ring-1 transition-colors",
        highlight ? "alert-pulse bg-sun-500 text-ocean-950 ring-sun-600" : "bg-white ring-ocean-900/10 hover:ring-ocean-900/30",
      )}
    >
      <p className="font-display text-4xl font-bold tabular-nums">{value}</p>
      <p className={cn("mt-1 text-sm", highlight ? "text-ocean-950 font-medium" : "text-ocean-950/65")}>{label}</p>
    </Link>
  );
}

function BookingOverview() {
  const today = colomboToday();
  const newBookings = useBookings({ status: "new" });
  const upcoming = useBookings({ minDate: today, limit: 100 });

  const priority = useMemo(
    () => newBookings.data.filter((b) => b.isForeign).sort((a, b) => b.createdAt - a.createdAt),
    [newBookings.data],
  );
  const active = upcoming.data.filter((b) => b.status !== "cancelled");
  const todays = active.filter((b) => b.date === today);
  const nextWeek = active.filter((b) => b.date > today && b.date <= addDays(today, 7));

  if (newBookings.loading || upcoming.loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Foreign bookings waiting" value={priority.length} href="/admin/bookings?filter=priority" highlight={priority.length > 0} />
        <Stat label="New bookings" value={newBookings.data.length} href="/admin/bookings?filter=new" />
        <Stat label="Trips today" value={todays.length} href="/admin/bookings?filter=today" />
        <Stat label="Trips in the next 7 days" value={nextWeek.length} href="/admin/bookings?filter=upcoming" />
      </div>

      <section>
        <h2 className="text-lg font-semibold">Priority: new foreign traveler bookings</h2>
        <div className="mt-3">
          {priority.length === 0 ? (
            <EmptyState title="No foreign bookings waiting" body="New bookings from foreign travelers appear here the moment they are sent." />
          ) : (
            <BookingTable bookings={priority} showCreated />
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Today and upcoming trips</h2>
        <div className="mt-3">
          {active.length === 0 ? (
            <EmptyState title="No upcoming trips" body="Bookings with a future trip date show here, soonest first." />
          ) : (
            <BookingTable bookings={active.slice(0, 20)} />
          )}
        </div>
      </section>
    </div>
  );
}

function ContentOverview() {
  const routes = useRoutes();
  const destinations = useDestinations();
  const packages = usePackages();
  const media = useMediaLibrary();
  const missingAlt = media.data.filter((m) => m.status === "ready" && m.type === "image" && !m.altText).length;

  const items = [
    { label: "Active routes", value: routes.data.filter((r) => r.status === "active").length, href: "/admin/routes" },
    { label: "Published destinations", value: destinations.data.filter((d) => d.status === "published").length, href: "/admin/destinations" },
    { label: "Published packages", value: packages.data.filter((p) => p.status === "published").length, href: "/admin/packages" },
    { label: "Images missing alt text", value: missingAlt, href: "/admin/media" },
  ];

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Website content</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((i) => (
          <Stat key={i.label} {...i} />
        ))}
      </div>
    </section>
  );
}
