"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireRole } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/admin/auth-provider";
import { useNotifications } from "@/components/admin/hooks";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui/misc";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/dates";
import type { NotificationItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  return (
    <RequireRole roles={["admin", "agent"]}>
      <Notifications />
    </RequireRole>
  );
}

function Notifications() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { data, loading } = useNotifications(200);

  const uid = user?.uid ?? "";
  const unread = data.filter((n) => n.channel === "dashboard" && !n.readBy?.includes(uid));

  async function markRead(body: { ids?: string[]; all?: boolean }) {
    try {
      setError(null);
      await apiFetch("/api/admin/notifications/read", { method: "POST", body });
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="A history of booking alerts. SMS entries appear here once SMS alerts are turned on."
        actions={unread.length > 0 ? <Button variant="outline" onClick={() => markRead({ all: true })}>Mark all as read</Button> : undefined}
      />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {loading ? (
        <Spinner />
      ) : data.length === 0 ? (
        <EmptyState title="No notifications yet" body="Each new booking creates a notification here." />
      ) : (
        <Card>
          <ul className="divide-y divide-ocean-900/5">
            {data.map((n) => {
              const isUnread = n.channel === "dashboard" && !n.readBy?.includes(uid);
              return (
                <li key={n.id} className={cn("flex flex-wrap items-start justify-between gap-3 px-5 py-4", isUnread && "bg-sun-100/40")}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isUnread && <span className="size-2 rounded-full bg-sun-500" aria-label="Unread" />}
                      <Link
                        href={`/admin/bookings/${n.bookingId}`}
                        onClick={() => isUnread && markRead({ ids: [n.id] })}
                        className={cn("hover:underline", isUnread ? "font-semibold" : "font-medium")}
                      >
                        {n.title}
                      </Link>
                      <Badge tone={n.channel === "sms" ? "ocean" : "neutral"}>{n.channel === "sms" ? "SMS" : "Dashboard"}</Badge>
                      {n.delivery?.status === "failed" && <Badge tone="danger">Failed</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-ocean-950/70">{n.message}</p>
                    {n.channel === "sms" && <p className="text-xs text-ocean-950/55">{n.delivery?.detail}</p>}
                  </div>
                  <p className="text-xs whitespace-nowrap text-ocean-950/55">{formatDateTime(n.createdAt)}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
