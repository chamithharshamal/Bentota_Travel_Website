import "server-only";
import { cache } from "react";
import { adminDb, isFirebaseAdminConfigured } from "../firebase/admin";
import { DEFAULT_SETTINGS } from "../defaults";
import { DEMO_DESTINATIONS, DEMO_PACKAGES, DEMO_ROUTES, DEMO_SETTINGS } from "../demo-data";
import type { Destination, MediaAsset, MediaLite, SiteSettings, TourPackage, TourRoute } from "../types";
import { unique } from "../utils";

/**
 * Read-only data access for the public website.
 * Every function fails soft (returns demo/sample data) so pages still render
 * before Firebase is configured or while seeding.
 */
async function safely<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  if (!isFirebaseAdminConfigured()) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error(`[data] ${label} failed`, error);
    return fallback;
  }
}

function bySortOrder<T extends { sortOrder: number }>(key: (item: T) => string) {
  return (a: T, b: T) => a.sortOrder - b.sortOrder || key(a).localeCompare(key(b));
}

export const getSettings = cache(async (): Promise<SiteSettings> =>
  safely("getSettings", DEMO_SETTINGS, async () => {
    const snap = await adminDb().collection("settings").doc("site").get();
    return { ...DEFAULT_SETTINGS, updatedAt: 0, ...(snap.data() as Partial<SiteSettings> | undefined) };
  }),
);

export const getPublishedDestinations = cache(async (): Promise<Destination[]> =>
  safely("getPublishedDestinations", DEMO_DESTINATIONS, async () => {
    const snap = await adminDb().collection("destinations").where("status", "==", "published").get();
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Destination)
      .sort(bySortOrder((d) => d.name));
  }),
);

export const getActiveRoutes = cache(async (): Promise<TourRoute[]> =>
  safely("getActiveRoutes", DEMO_ROUTES, async () => {
    const snap = await adminDb().collection("routes").where("status", "==", "active").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TourRoute).sort(bySortOrder((r) => r.name));
  }),
);

export const getPublishedPackages = cache(async (): Promise<TourPackage[]> =>
  safely("getPublishedPackages", DEMO_PACKAGES, async () => {
    const snap = await adminDb().collection("packages").where("status", "==", "published").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TourPackage).sort(bySortOrder((p) => p.title));
  }),
);

export async function getDestinationBySlug(slug: string) {
  return (await getPublishedDestinations()).find((d) => d.slug === slug) ?? null;
}

export async function getPackageBySlug(slug: string) {
  return (await getPublishedPackages()).find((p) => p.slug === slug) ?? null;
}

/**
 * Routes usable on the public site: active, with only published destinations.
 * Routes left with no stops after filtering are hidden.
 */
export const getBookableRoutes = cache(async () => {
  const [routes, destinations] = await Promise.all([getActiveRoutes(), getPublishedDestinations()]);
  const destById = new Map(destinations.map((d) => [d.id, d]));
  return routes
    .map((r) => ({ ...r, stops: r.stops.filter((s) => destById.has(s.destinationId)) }))
    .filter((r) => r.stops.length > 0)
    .map((r) => ({ ...r, maxSelectable: Math.min(r.maxSelectable, r.stops.length) }));
});

export async function getMediaMap(ids: Array<string | null | undefined>): Promise<Record<string, MediaLite>> {
  const list = unique(ids.filter((id): id is string => Boolean(id)));
  if (!list.length) return {};
  return safely("getMediaMap", {}, async () => {
    const db = adminDb();
    const map: Record<string, MediaLite> = {};
    // getAll accepts many refs; chunk to stay well within request limits.
    for (let i = 0; i < list.length; i += 100) {
      const snaps = await db.getAll(...list.slice(i, i + 100).map((id) => db.collection("media").doc(id)));
      for (const s of snaps) {
        if (!s.exists) continue;
        const m = s.data() as Omit<MediaAsset, "id">;
        if (m.status !== "ready") continue;
        map[s.id] = {
          id: s.id,
          type: m.type,
          publicId: m.publicId,
          version: m.version,
          width: m.width,
          height: m.height,
          altText: m.altText,
          streaming: m.streaming,
        };
      }
    }
    return map;
  });
}
