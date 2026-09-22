"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { RequireRole } from "@/components/admin/admin-shell";
import { usePackages, useRoutes } from "@/components/admin/hooks";
import { LinkButton } from "@/components/ui/button";
import { Alert, Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui/misc";

export default function PackagesAdminPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <List />
    </RequireRole>
  );
}

function List() {
  const { data, loading, error } = usePackages();
  const routes = useRoutes();
  const names = new Map(routes.data.map((r) => [r.id, r.name]));

  return (
    <>
      <PageHeader
        title="Packages"
        description="Packages present one or more routes with descriptions, highlights, and what is included."
        actions={<LinkButton href="/admin/packages/new" variant="dark">Add package</LinkButton>}
      />
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <Spinner />
      ) : data.length === 0 ? (
        <EmptyState title="No packages yet" body="Create routes first, then group them into a package." action={<LinkButton href="/admin/packages/new">Add package</LinkButton>} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ocean-900/10 text-xs text-ocean-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Trip</th>
                <th className="px-4 py-3 font-medium">Routes</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-900/5">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/packages/${p.id}`} className="inline-flex items-center gap-1.5 font-semibold text-ocean-800 hover:underline">
                      {p.title}
                      {p.featured && <Star className="size-3.5 fill-sun-500 text-sun-500" aria-label="Featured" />}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.tripType === "one-day" ? "One day" : "Two days"}</td>
                  <td className="px-4 py-3 text-ocean-950/70">{p.routeIds.map((id) => names.get(id) ?? "Deleted route").join(", ")}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "published" ? "palm" : "neutral"}>{p.status === "published" ? "Published" : "Draft"}</Badge>
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
