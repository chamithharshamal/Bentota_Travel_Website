import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { settingsSchema } from "@/lib/validation";
import { CONTENT_ROLES, requireStaff } from "@/lib/server/auth";
import { jsonError, readJson } from "@/lib/server/http";
import { assertMediaUsable, syncMediaUsage } from "@/lib/server/media-usage";
import { writeAudit } from "@/lib/server/audit";
import { revalidateSite } from "@/lib/server/crud";

export async function PUT(req: Request) {
  try {
    const staff = await requireStaff(req, CONTENT_ROLES);
    const input = await readJson(req, settingsSchema);
    const ref = adminDb().collection("settings").doc("site");
    const existing = await ref.get();

    const ids = (s: { heroMediaId?: string | null; heroVideoMediaId?: string | null; galleryMediaIds?: string[] }) =>
      [s.heroMediaId, s.heroVideoMediaId, ...(s.galleryMediaIds ?? [])].filter((x): x is string => Boolean(x));

    await assertMediaUsable(ids(input));
    await ref.set({ ...input, updatedAt: Date.now() });
    await syncMediaUsage("settings/site", existing.exists ? ids(existing.data()!) : [], ids(input));
    await writeAudit(staff, "update", "settings", "site", "Updated website settings");
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
