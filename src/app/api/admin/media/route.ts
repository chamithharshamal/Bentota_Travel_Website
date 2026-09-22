import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { mediaCreateSchema } from "@/lib/validation";
import { CONTENT_ROLES, requireStaff } from "@/lib/server/auth";
import { HttpError, jsonError, readJson } from "@/lib/server/http";
import { fetchResource, requestStreamingRenditions } from "@/lib/server/cloudinary";
import { writeAudit } from "@/lib/server/audit";
import type { MediaAsset } from "@/lib/types";

/** Registers an asset that the admin just uploaded to Cloudinary. */
export async function POST(req: Request) {
  try {
    const staff = await requireStaff(req, CONTENT_ROLES);
    const input = await readJson(req, mediaCreateSchema);
    const db = adminDb();

    const existing = await db.collection("media").where("publicId", "==", input.publicId).limit(1).get();
    if (!existing.empty) {
      const doc = existing.docs[0]!;
      return NextResponse.json({ media: { id: doc.id, ...doc.data() } });
    }

    let info;
    try {
      // Read metadata from Cloudinary instead of trusting the browser.
      info = await fetchResource(input.publicId, input.resourceType);
    } catch {
      throw new HttpError(400, "Cloudinary could not find this upload. Upload the file again.");
    }

    let streaming: MediaAsset["streaming"] = "none";
    if (input.resourceType === "video") {
      try {
        streaming = (await requestStreamingRenditions(info.public_id)) ? "pending" : "none";
      } catch (error) {
        console.error("[media] could not request streaming renditions", error);
      }
    }

    const now = Date.now();
    const media: Omit<MediaAsset, "id"> = {
      type: input.resourceType,
      publicId: info.public_id,
      version: info.version,
      format: info.format,
      width: info.width ?? null,
      height: info.height ?? null,
      bytes: info.bytes,
      duration: info.duration ?? input.duration ?? null,
      originalFilename: input.originalFilename,
      altText: "",
      caption: "",
      tags: [],
      usedBy: [],
      status: "ready",
      streaming,
      uploadedBy: staff.uid,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await db.collection("media").add(media);
    await writeAudit(staff, "create", "media", ref.id, `Uploaded ${input.resourceType} "${input.originalFilename}"`);
    return NextResponse.json({ media: { id: ref.id, ...media } }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
