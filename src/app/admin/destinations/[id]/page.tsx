"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { RequireRole } from "@/components/admin/admin-shell";
import { EditorFooter, Section, toNumber, useDocOnce, useEditorActions } from "@/components/admin/editor";
import { MediaField } from "@/components/admin/media-picker";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Alert, PageHeader, Spinner } from "@/components/ui/misc";
import type { Destination, PublishStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

export default function DestinationEditorPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <Editor />
    </RequireRole>
  );
}

const EMPTY = {
  name: "",
  slug: "",
  region: "",
  shortDescription: "",
  description: "",
  coverMediaId: null as string | null,
  galleryMediaIds: [] as string[],
  videoMediaId: null as string | null,
  status: "draft" as PublishStatus,
  sortOrder: 0,
};

function Editor() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useDocOnce<Destination>("destinations", id);
  const actions = useEditorActions({ endpoint: "/api/admin/destinations", listHref: "/admin/destinations", id, noun: "Destination" });
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!data) return;
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = data;
    setForm({ ...EMPTY, ...rest });
    setSlugTouched(true);
  }, [data]);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) => setForm((f) => ({ ...f, [key]: value }));

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <>
      <Link href="/admin/destinations" className="mb-4 inline-flex items-center gap-1 text-sm text-ocean-800 hover:underline">
        <ArrowLeft className="size-4" /> All destinations
      </Link>
      <PageHeader title={actions.isNew ? "Add destination" : form.name || "Edit destination"} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
                  }}
                />
              </Field>
              <Field label="Web address" htmlFor="slug" hint={`/destinations/${form.slug || "…"}`}>
                <Input id="slug" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
              </Field>
              <Field label="Region" htmlFor="region" hint="Used to group destinations, e.g. South Coast.">
                <Input id="region" value={form.region} onChange={(e) => set("region", e.target.value)} />
              </Field>
              <Field label="Display order" htmlFor="sort" hint="Lower numbers appear first.">
                <Input id="sort" type="number" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", toNumber(e.target.value))} />
              </Field>
            </div>
            <Field label="Short description" htmlFor="short" hint="One or two sentences shown under the title.">
              <Textarea id="short" maxLength={240} className="min-h-16" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
            </Field>
            <Field label="Full description" htmlFor="desc" hint="Leave a blank line between paragraphs.">
              <Textarea id="desc" className="min-h-48" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </Section>

          <Section title="Photos and video" description="Choose from the media library or upload new files.">
            <MediaField label="Cover image" type="image" value={form.coverMediaId ? [form.coverMediaId] : []} onChange={(ids) => set("coverMediaId", ids[0] ?? null)} />
            <MediaField label="Gallery" hint="Shown on the destination page in this order." type="image" multiple value={form.galleryMediaIds} onChange={(ids) => set("galleryMediaIds", ids)} />
            <MediaField label="Video" hint="Optional. Keep it short: under 2 minutes." type="video" value={form.videoMediaId ? [form.videoMediaId] : []} onChange={(ids) => set("videoMediaId", ids[0] ?? null)} />
          </Section>
        </div>

        <div>
          <Section title="Visibility">
            <Field label="Status" htmlFor="status" hint="Draft destinations are hidden from the website and cannot be booked.">
              <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value as PublishStatus)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </Section>
        </div>
      </div>

      <EditorFooter actions={actions} saveLabel={actions.isNew ? "Create destination" : "Save changes"} onSave={() => actions.save(form)} />
    </>
  );
}
