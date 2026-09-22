"use client";

import Link from "next/link";
import { RequireRole } from "@/components/admin/admin-shell";
import { useDestinations, useMediaLibrary } from "@/components/admin/hooks";
import { LinkButton } from "@/components/ui/button";
import { Alert, Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui/misc";
import { thumbnailUrl } from "@/lib/cld-url";
import { formatDateTime } from "@/lib/dates";

export default function DestinationsAdminPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <List />
    </RequireRole>
  );
}

function List() {
  const { data, loading, error } = useDestinations();
  const media = useMediaLibrary();
  const byId = new Map(media.data.map((m) => [m.id, m]));

  return (
    <>
      <PageHeader
        title="Destinations"
        description="Places that can be added to routes. Draft destinations are hidden from the website and from booking."
        actions={<LinkButton href="/admin/destinations/new" variant="dark">Add destination</LinkButton>}
      />
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <Spinner />
      ) : data.length === 0 ? (
        <EmptyState title="No destinations yet" body="Add the places your tours visit, then build routes from them." action={<LinkButton href="/admin/destinations/new">Add destination</LinkButton>} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ocean-900/10 text-xs text-ocean-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-900/5">
              {data.map((d) => {
                const cover = d.coverMediaId ? byId.get(d.coverMediaId) : undefined;
                return (
                  <tr key={d.id} className="hover:bg-ocean-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/destinations/${d.id}`} className="flex items-center gap-3">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumbnailUrl(cover)} alt="" className="h-10 w-14 rounded object-cover" />
                        ) : (
                          <span className="h-10 w-14 rounded bg-ocean-100" />
                        )}
                        <span className="font-semibold text-ocean-800 hover:underline">{d.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{d.region || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={d.status === "published" ? "palm" : "neutral"}>{d.status === "published" ? "Published" : "Draft"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ocean-950/60">{formatDateTime(d.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
