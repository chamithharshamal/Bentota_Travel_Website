import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { bookingUpdateSchema } from "@/lib/validation";
import { BOOKING_ROLES, requireStaff } from "@/lib/server/auth";
import { HttpError, jsonError, readJson } from "@/lib/server/http";
import { writeAudit } from "@/lib/server/audit";
import type { IdContext } from "@/lib/server/crud";

export async function PATCH(req: Request, ctx: IdContext) {
  try {
    const { id } = await ctx.params;
    const staff = await requireStaff(req, BOOKING_ROLES);
    const input = await readJson(req, bookingUpdateSchema);
    const ref = adminDb().collection("bookings").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "This booking no longer exists.");

    const now = Date.now();
    const update: Record<string, unknown> = { updatedAt: now };

    if (input.markSeen) {
      update.seenBy = FieldValue.arrayUnion(staff.uid);
      if (!snap.get("firstSeenAt")) update.firstSeenAt = now;
    }
    if (input.status && input.status !== snap.get("status")) {
      update.status = input.status;
      update.statusHistory = FieldValue.arrayUnion({ status: input.status, by: staff.uid, byEmail: staff.email, at: now });
    }
    if (input.note) {
      update.internalNotes = FieldValue.arrayUnion({ text: input.note, by: staff.uid, byEmail: staff.email, at: now });
    }

    await ref.update(update);

    if (input.status || input.note) {
      const parts = [input.status && `status → ${input.status}`, input.note && "added a note"].filter(Boolean);
      await writeAudit(staff, "update", "bookings", id, `${snap.get("ref")}: ${parts.join(", ")}`);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
