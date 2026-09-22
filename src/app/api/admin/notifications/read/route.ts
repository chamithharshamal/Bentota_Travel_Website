import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { notificationReadSchema } from "@/lib/validation";
import { BOOKING_ROLES, requireStaff } from "@/lib/server/auth";
import { jsonError, readJson } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    const staff = await requireStaff(req, BOOKING_ROLES);
    const input = await readJson(req, notificationReadSchema);
    const db = adminDb();

    let ids = input.ids ?? [];
    if (input.all) {
      const snap = await db.collection("notifications").orderBy("createdAt", "desc").limit(300).get();
      ids = snap.docs.filter((d) => !((d.get("readBy") as string[]) ?? []).includes(staff.uid)).map((d) => d.id);
    }
    if (!ids.length) return NextResponse.json({ updated: 0 });

    const batch = db.batch();
    for (const id of ids) batch.update(db.collection("notifications").doc(id), { readBy: FieldValue.arrayUnion(staff.uid) });
    await batch.commit();
    return NextResponse.json({ updated: ids.length });
  } catch (error) {
    return jsonError(error);
  }
}
