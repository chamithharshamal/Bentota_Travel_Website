import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase/admin";
import { HttpError } from "./http";
import { unique } from "../utils";

/** Throws if any of the given media IDs do not exist or are archived. */
export async function assertMediaUsable(ids: string[]) {
  const list = unique(ids.filter(Boolean));
  if (!list.length) return;
  const db = adminDb();
  const snaps = await db.getAll(...list.map((id) => db.collection("media").doc(id)));
  const missing = snaps.filter((s) => !s.exists || s.get("status") === "archived");
  if (missing.length) {
    throw new HttpError(400, "One or more selected media files no longer exist or are archived. Choose them again.");
  }
}

/**
 * Keeps media.usedBy in sync when a document's media references change.
 * `path` looks like "destinations/abc123".
 */
export async function syncMediaUsage(path: string, before: string[], after: string[]) {
  const db = adminDb();
  const prev = new Set(before.filter(Boolean));
  const next = new Set(after.filter(Boolean));
  const removed = [...prev].filter((id) => !next.has(id));
  const added = [...next].filter((id) => !prev.has(id));
  if (!removed.length && !added.length) return;

  const ids = [...removed, ...added];
  const snaps = await db.getAll(...ids.map((id) => db.collection("media").doc(id)));
  const existing = new Set(snaps.filter((s) => s.exists).map((s) => s.id));

  const batch = db.batch();
  for (const id of removed) {
    if (existing.has(id)) batch.update(db.collection("media").doc(id), { usedBy: FieldValue.arrayRemove(path) });
  }
  for (const id of added) {
    if (existing.has(id)) batch.update(db.collection("media").doc(id), { usedBy: FieldValue.arrayUnion(path) });
  }
  await batch.commit();
}
