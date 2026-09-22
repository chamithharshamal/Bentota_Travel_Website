import "server-only";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { adminDb } from "../firebase/admin";
import { CONTENT_ROLES, requireStaff } from "./auth";
import { HttpError, jsonError, readJson } from "./http";
import { assertMediaUsable, syncMediaUsage } from "./media-usage";
import { writeAudit } from "./audit";

type ContentCollection = "destinations" | "routes" | "packages";

interface CrudConfig<Input extends { slug: string }> {
  collection: ContentCollection;
  schema: ZodType<Input>;
  mediaIds: (data: Input) => Array<string | null>;
  label: (data: Input) => string;
  /** Extra validation and derived fields. Throw HttpError to reject. */
  prepare?: (data: Input) => Promise<Record<string, unknown>>;
  /** Throw HttpError if the document is still referenced elsewhere. */
  beforeDelete?: (id: string) => Promise<void>;
}

export type IdContext = { params: Promise<{ id: string }> };

export function revalidateSite() {
  revalidatePath("/", "layout");
}

async function assertSlugFree(collection: string, slug: string, currentId?: string) {
  const snap = await adminDb().collection(collection).where("slug", "==", slug).limit(2).get();
  if (snap.docs.some((d) => d.id !== currentId)) {
    throw new HttpError(409, `The slug "${slug}" is already used. Choose a different one.`);
  }
}

const clean = (ids: Array<string | null>) => ids.filter((id): id is string => Boolean(id));

export function crudHandlers<Input extends { slug: string }>(config: CrudConfig<Input>) {
  const { collection } = config;

  async function create(req: Request) {
    try {
      const staff = await requireStaff(req, CONTENT_ROLES);
      const data = await readJson(req, config.schema);
      const mediaIds = clean(config.mediaIds(data));
      await Promise.all([assertSlugFree(collection, data.slug), assertMediaUsable(mediaIds)]);
      const extra = (await config.prepare?.(data)) ?? {};

      const now = Date.now();
      const ref = adminDb().collection(collection).doc();
      await ref.set({ ...data, ...extra, createdAt: now, updatedAt: now });
      await syncMediaUsage(`${collection}/${ref.id}`, [], mediaIds);
      await writeAudit(staff, "create", collection, ref.id, `Created "${config.label(data)}"`);
      revalidateSite();
      return NextResponse.json({ id: ref.id }, { status: 201 });
    } catch (error) {
      return jsonError(error);
    }
  }

  async function update(req: Request, ctx: IdContext) {
    try {
      const { id } = await ctx.params;
      const staff = await requireStaff(req, CONTENT_ROLES);
      const data = await readJson(req, config.schema);
      const ref = adminDb().collection(collection).doc(id);
      const existing = await ref.get();
      if (!existing.exists) throw new HttpError(404, "This item no longer exists.");

      const mediaIds = clean(config.mediaIds(data));
      await Promise.all([assertSlugFree(collection, data.slug, id), assertMediaUsable(mediaIds)]);
      const extra = (await config.prepare?.(data)) ?? {};

      const before = clean(config.mediaIds(existing.data() as Input));
      await ref.set({ ...data, ...extra, createdAt: existing.get("createdAt") ?? Date.now(), updatedAt: Date.now() });
      await syncMediaUsage(`${collection}/${id}`, before, mediaIds);
      await writeAudit(staff, "update", collection, id, `Updated "${config.label(data)}"`);
      revalidateSite();
      return NextResponse.json({ id });
    } catch (error) {
      return jsonError(error);
    }
  }

  async function remove(req: Request, ctx: IdContext) {
    try {
      const { id } = await ctx.params;
      const staff = await requireStaff(req, CONTENT_ROLES);
      const ref = adminDb().collection(collection).doc(id);
      const existing = await ref.get();
      if (!existing.exists) throw new HttpError(404, "This item no longer exists.");
      await config.beforeDelete?.(id);

      const data = existing.data() as Input;
      await ref.delete();
      await syncMediaUsage(`${collection}/${id}`, clean(config.mediaIds(data)), []);
      await writeAudit(staff, "delete", collection, id, `Deleted "${config.label(data)}"`);
      revalidateSite();
      return NextResponse.json({ ok: true });
    } catch (error) {
      return jsonError(error);
    }
  }

  return { create, update, remove };
}
