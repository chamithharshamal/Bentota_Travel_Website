import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { mediaUpdateSchema } from "@/lib/validation";
import { ADMIN_ONLY, CONTENT_ROLES, requireStaff } from "@/lib/server/auth";
import { HttpError, jsonError, readJson } from "@/lib/server/http";
import { destroyAsset, fetchResource, requestStreamingRenditions } from "@/lib/server/cloudinary";
import { writeAudit } from "@/lib/server/audit";
import { revalidateSite, type IdContext } from "@/lib/server/crud";
import type { MediaAsset } from "@/lib/types";

export async function PATCH(req: Request, ctx: IdContext) {
  try {
    const { id } = await ctx.params;
    const staff = await requireStaff(req, CONTENT_ROLES);
    const input = await readJson(req, mediaUpdateSchema);
    const ref = adminDb().collection("media").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "This media file no longer exists.");
    const current = snap.data() as Omit<MediaAsset, "id">;

    const update: Partial<MediaAsset> = { updatedAt: Date.now() };
    if (input.altText !== undefined) update.altText = input.altText;
    if (input.caption !== undefined) update.caption = input.caption;
    if (input.tags !== undefined) update.tags = input.tags.map((t) => t.toLowerCase()).filter(Boolean);

    if (input.status && input.status !== current.status) {
      if (input.status === "archived" && current.usedBy.length) {
        throw new HttpError(
          409,
          `This file is used in ${current.usedBy.length} place(s). Remove it from those pages before archiving.`,
        );
      }
      update.status = input.status;
    }

    let oldAsset: { publicId: string; type: MediaAsset["type"] } | null = null;
    if (input.replaceWith) {
      if (input.replaceWith.resourceType !== current.type) {
        throw new HttpError(400, `Replace a ${current.type} with another ${current.type}.`);
      }
      let info;
      try {
        info = await fetchResource(input.replaceWith.publicId, input.replaceWith.resourceType);
      } catch {
        throw new HttpError(400, "Cloudinary could not find the new upload. Upload the file again.");
      }
      Object.assign(update, {
        publicId: info.public_id,
        version: info.version,
        format: info.format,
        width: info.width ?? null,
        height: info.height ?? null,
        bytes: info.bytes,
        duration: info.duration ?? input.replaceWith.duration ?? null,
        originalFilename: input.replaceWith.originalFilename,
        streaming: "none",
      } satisfies Partial<MediaAsset>);
      if (current.type === "video") {
        try {
          update.streaming = (await requestStreamingRenditions(info.public_id)) ? "pending" : "none";
        } catch (error) {
          console.error("[media] could not request streaming renditions", error);
        }
      }
      if (info.public_id !== current.publicId) oldAsset = { publicId: current.publicId, type: current.type };
    }

    await ref.update(update);

    if (oldAsset) {
      try {
        await destroyAsset(oldAsset.publicId, oldAsset.type);
      } catch (error) {
        console.error("[media] old asset could not be removed from Cloudinary", error);
      }
    }

    const action = input.replaceWith ? "Replaced file" : input.status ? `Set status ${input.status}` : "Updated details";
    await writeAudit(staff, "update", "media", id, `${action} for "${current.originalFilename}"`);
    if (current.usedBy.length || input.replaceWith) revalidateSite();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

/** Permanently deletes an archived, unused asset from Cloudinary and Firestore. */
export async function DELETE(req: Request, ctx: IdContext) {
  try {
    const { id } = await ctx.params;
    const staff = await requireStaff(req, ADMIN_ONLY);
    const ref = adminDb().collection("media").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "This media file no longer exists.");
    const media = snap.data() as Omit<MediaAsset, "id">;

    if (media.status !== "archived") throw new HttpError(409, "Archive the file before deleting it permanently.");
    if (media.usedBy.length) throw new HttpError(409, "This file is still in use and cannot be deleted.");

    await destroyAsset(media.publicId, media.type);
    await ref.delete();
    await writeAudit(staff, "delete", "media", id, `Permanently deleted "${media.originalFilename}"`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
