import Link from "next/link";
import { Card } from "@/components/ui/misc";
import { formatTripDate, timeAgo } from "@/lib/dates";
import { formatMoney } from "@/lib/pricing";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BookingStatusBadge, PriorityBadge } from "./status";

export function BookingTable({ bookings, showCreated = false }: { bookings: Booking[]; showCreated?: boolean }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-ocean-900/10 text-xs text-ocean-950/60">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Traveler</th>
            <th className="px-4 py-3 font-medium">Trip</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Travelers</th>
            <th className="px-4 py-3 font-medium">Estimate</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {showCreated && <th className="px-4 py-3 font-medium">Received</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-ocean-900/5">
          {bookings.map((b) => (
            <tr key={b.id} className={cn("hover:bg-ocean-50", b.status === "new" && b.isForeign && "bg-sun-100/50")}>
              <td className="px-4 py-3">
                <Link href={`/admin/bookings/${b.id}`} className="font-semibold text-ocean-800 hover:underline tabular-nums">
                  {b.ref}
                </Link>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{b.traveler.name}</p>
                <p className="text-xs text-ocean-950/60">{b.traveler.nationality}</p>
              </td>
              <td className="px-4 py-3">
                <p>{b.route.name}</p>
                <p className="text-xs text-ocean-950/60">{b.tripType === "one-day" ? "One day" : "Two days"}</p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatTripDate(b.date)}</td>
              <td className="px-4 py-3 tabular-nums">{b.pax.adults + b.pax.children + b.pax.infants}</td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatMoney(b.price.estimatedTotal, b.price.currency)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <BookingStatusBadge status={b.status} />
                  {b.status === "new" && b.isForeign && <PriorityBadge />}
                </div>
              </td>
              {showCreated && <td className="px-4 py-3 whitespace-nowrap text-ocean-950/60">{timeAgo(b.createdAt)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

