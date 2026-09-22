"use client";

import Link from "next/link";
import { RequireRole } from "@/components/admin/admin-shell";
import { useDestinations, useRoutes } from "@/components/admin/hooks";
import { LinkButton } from "@/components/ui/button";
import { Alert, Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui/misc";
import { formatMoney } from "@/lib/pricing";

export default function RoutesAdminPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <List />
    </RequireRole>
  );
}

function List() {
  const { data, loading, error } = useRoutes();
  const destinations = useDestinations();
  const names = new Map(destinations.data.map((d) => [d.id, d.name]));

  return (
    <>
      <PageHeader
        title="Routes"
        description="Each route sets the direction of travel, which destinations travelers can choose, and the per-person price."
        actions={<LinkButton href="/admin/routes/new" variant="dark">Add route</LinkButton>}
      />
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <Spinner />
      ) : data.length === 0 ? (
        <EmptyState title="No routes yet" body="Add destinations first, then create a route that strings them together." action={<LinkButton href="/admin/routes/new">Add route</LinkButton>} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ocean-900/10 text-xs text-ocean-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Trip</th>
                <th className="px-4 py-3 font-medium">Stops</th>
                <th className="px-4 py-3 font-medium">Adult price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-900/5">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/routes/${r.id}`} className="font-semibold text-ocean-800 hover:underline">{r.name}</Link>
                  </td>
                  <td className="px-4 py-3">{r.tripType === "one-day" ? "One day" : "Two days"}</td>
                  <td className="max-w-xs px-4 py-3 text-ocean-950/70">
                    <span className="line-clamp-2">{r.stops.map((s) => names.get(s.destinationId) ?? "Deleted destination").join(" → ")}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {formatMoney(r.pricing.foreignAdult, "USD")}
                    <span className="block text-xs text-ocean-950/60">{formatMoney(r.pricing.localAdult, "LKR")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.status === "active" ? "palm" : "neutral"}>{r.status === "active" ? "Active" : "Disabled"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
