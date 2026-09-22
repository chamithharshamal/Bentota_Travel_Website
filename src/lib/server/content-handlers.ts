import "server-only";
import type { z } from "zod";
import { adminDb } from "../firebase/admin";
import { destinationSchema, packageSchema, routeSchema } from "../validation";
import { crudHandlers } from "./crud";
import { HttpError } from "./http";

type DestinationInput = z.infer<typeof destinationSchema>;
type RouteInput = z.infer<typeof routeSchema>;
type PackageInput = z.infer<typeof packageSchema>;

export const destinationHandlers = crudHandlers<DestinationInput>({
  collection: "destinations",
  schema: destinationSchema,
  label: (d) => d.name,
  mediaIds: (d) => [d.coverMediaId, d.videoMediaId, ...(d.galleryMediaIds ?? [])],
  beforeDelete: async (id) => {
    const routes = await adminDb().collection("routes").where("destinationIds", "array-contains", id).get();
    if (!routes.empty) {
      const names = routes.docs.map((r) => r.get("name")).join(", ");
      throw new HttpError(409, `Remove this destination from these routes first: ${names}.`);
    }
  },
});

export const routeHandlers = crudHandlers<RouteInput>({
  collection: "routes",
  schema: routeSchema,
  label: (r) => r.name,
  mediaIds: (r) => [r.coverMediaId],
  prepare: async (r) => {
    const db = adminDb();
    const ids = r.stops.map((s) => s.destinationId);
    const snaps = await db.getAll(...ids.map((id) => db.collection("destinations").doc(id)));
    if (snaps.some((s) => !s.exists)) {
      throw new HttpError(400, "One or more destinations on this route no longer exist. Remove them and save again.");
    }
    return { destinationIds: ids };
  },
  beforeDelete: async (id) => {
    const packages = await adminDb().collection("packages").where("routeIds", "array-contains", id).get();
    if (!packages.empty) {
      const names = packages.docs.map((p) => p.get("title")).join(", ");
      throw new HttpError(409, `Remove this route from these packages first: ${names}.`);
    }
  },
});

export const packageHandlers = crudHandlers<PackageInput>({
  collection: "packages",
  schema: packageSchema,
  label: (p) => p.title,
  mediaIds: (p) => [p.coverMediaId, ...(p.galleryMediaIds ?? [])],
  prepare: async (p) => {
    const db = adminDb();
    const snaps = await db.getAll(...p.routeIds.map((id) => db.collection("routes").doc(id)));
    if (snaps.some((s) => !s.exists)) {
      throw new HttpError(400, "One or more linked routes no longer exist. Update the route selection.");
    }
    if (snaps.some((s) => s.get("tripType") !== p.tripType)) {
      throw new HttpError(400, "All linked routes must match the package trip type.");
    }
    return {};
  },
});
