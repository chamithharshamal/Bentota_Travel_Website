"use client";

import { clientAuth, isFirebaseClientConfigured } from "./firebase/client";
import {
  deleteDemoDoc,
  getDemoCollection,
  getDemoDoc,
  isDemoMode,
  saveDemoDoc,
} from "./demo-store";
import type { Booking, NotificationItem, StaffUser } from "./types";

/** Calls an admin API route with the signed-in user's Firebase ID token or handles via demo store. */
export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body }: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  if (isDemoMode() || !isFirebaseClientConfigured) {
    return handleDemoApi<T>(path, method, body);
  }

  const user = clientAuth().currentUser;
  if (!user) throw new Error("Sign in to continue.");
  const token = await user.getIdToken();
  const res = await fetch(path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (res.status === 401) {
    await clientAuth().signOut().catch(() => undefined);
  }
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}).`);
  return data;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Try again.";
}

async function handleDemoApi<T>(
  path: string,
  method: string,
  body: unknown,
): Promise<T> {
  // Simulate minimal network latency
  await new Promise((resolve) => setTimeout(resolve, 150));

  const cleanPath = path.split("?")[0]!;

  // 1. Staff users: /api/admin/users
  if (cleanPath === "/api/admin/users") {
    if (method === "GET") {
      return { users: getDemoCollection<StaffUser>("users") } as T;
    }
    if (method === "PATCH") {
      const { uid, role, disabled } = (body || {}) as { uid?: string; role?: any; disabled?: boolean };
      if (uid) {
        saveDemoDoc("users", uid, {
          ...(role !== undefined ? { role } : {}),
          ...(disabled !== undefined ? { disabled } : {}),
        });
      }
      return { ok: true } as T;
    }
  }

  // 2. Notifications: /api/admin/notifications/read
  if (cleanPath === "/api/admin/notifications/read") {
    const notifs = getDemoCollection<NotificationItem>("notifications");
    notifs.forEach((n) => {
      if (!n.readBy?.includes("demo-admin")) {
        saveDemoDoc("notifications", n.id, {
          readBy: [...(n.readBy || []), "demo-admin"],
        });
      }
    });
    return { ok: true } as T;
  }

  // 3. Settings: /api/admin/settings
  if (cleanPath === "/api/admin/settings") {
    if (method === "PUT") {
      saveDemoDoc("settings", "site", (body as Record<string, unknown>) || {});
      return { ok: true } as T;
    }
  }

  // 4. Bookings detail: /api/admin/bookings/[id]
  const bookingMatch = cleanPath.match(/^\/api\/admin\/bookings\/([^/]+)$/);
  if (bookingMatch) {
    const id = bookingMatch[1];
    if (method === "PATCH") {
      const b = getDemoDoc<Booking>("bookings", id);
      if (b) {
        const payload = (body || {}) as {
          status?: Booking["status"];
          note?: string;
          markSeen?: boolean;
        };
        const updates: Partial<Booking> = {};
        if (payload.markSeen && !b.seenBy?.includes("demo-admin")) {
          updates.seenBy = [...(b.seenBy || []), "demo-admin"];
          updates.firstSeenAt = b.firstSeenAt ?? Date.now();
        }
        if (payload.status) {
          updates.status = payload.status;
          updates.statusHistory = [
            ...(b.statusHistory || []),
            { status: payload.status, by: "demo-admin", byEmail: "admin@bentotasmartjourneys.com", at: Date.now() },
          ];
        }
        if (payload.note) {
          updates.internalNotes = [
            ...(b.internalNotes || []),
            { text: payload.note, by: "demo-admin", byEmail: "admin@bentotasmartjourneys.com", at: Date.now() },
          ];
        }
        saveDemoDoc("bookings", id, updates);
      }
      return { ok: true } as T;
    }
  }

  // 5. Generic CRUD for destinations, routes, packages, media
  const crudCollections = ["destinations", "routes", "packages", "media"] as const;
  for (const coll of crudCollections) {
    const listPattern = new RegExp(`^/api/admin/${coll}$`);
    const itemPattern = new RegExp(`^/api/admin/${coll}/([^/]+)$`);

    if (listPattern.test(cleanPath)) {
      if (method === "POST") {
        const id = `${coll.slice(0, 4)}-${Date.now()}`;
        saveDemoDoc(coll, id, (body as Record<string, unknown>) || {});
        return { id } as T;
      }
    }

    const itemMatch = cleanPath.match(itemPattern);
    if (itemMatch) {
      const id = itemMatch[1];
      if (method === "PUT" || method === "PATCH") {
        saveDemoDoc(coll, id, (body as Record<string, unknown>) || {});
        return { ok: true } as T;
      }
      if (method === "DELETE") {
        deleteDemoDoc(coll, id);
        return { ok: true } as T;
      }
    }
  }

  return { ok: true } as T;
}
