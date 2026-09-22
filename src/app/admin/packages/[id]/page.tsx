"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { RequireRole } from "@/components/admin/admin-shell";
import { EditorFooter, Section, toNumber, useDocOnce, useEditorActions } from "@/components/admin/editor";
import { useRoutes } from "@/components/admin/hooks";
import { MediaField } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea, Toggle } from "@/components/ui/form";
import { Alert, Badge, PageHeader, Spinner } from "@/components/ui/misc";
import { DEFAULT_EXCLUSIONS, DEFAULT_INCLUSIONS } from "@/lib/defaults";
import type { PublishStatus, TourPackage, TripType } from "@/lib/types";
import { linesToList, listToLines, slugify } from "@/lib/utils";

export default function PackageEditorPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <Editor />
    </RequireRole>
  );
}

const EMPTY = {
  title: "",
  slug: "",
  tripType: "one-day" as TripType,
  summary: "",
  description: "",
  highlights: "",
  inclusions: listToLines(DEFAULT_INCLUSIONS["one-day"]),
  exclusions: listToLines(DEFAULT_EXCLUSIONS["one-day"]),
  routeIds: [] as string[],
  coverMediaId: null as string | null,
  galleryMediaIds: [] as string[],
  featured: false,
  status: "draft" as PublishStatus,
  sortOrder: 0,
};

function Editor() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useDocOnce<TourPackage>("packages", id);
  const routes = useRoutes();
  const actions = useEditorActions({ endpoint: "/api/admin/packages", listHref: "/admin/packages", id, noun: "Package" });
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title,
      slug: data.slug,
      tripType: data.tripType,
      summary: data.summary,
      description: data.description,
      highlights: listToLines(data.highlights),
      inclusions: listToLines(data.inclusions),
      exclusions: listToLines(data.exclusions),
      routeIds: data.routeIds,
      coverMediaId: data.coverMediaId,
      galleryMediaIds: data.galleryMediaIds,
      featured: data.featured,
      status: data.status,
      sortOrder: data.sortOrder,
    });
    setSlugTouched(true);
  }, [data]);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const typeRoutes = routes.data.filter((r) => r.tripType === form.tripType);

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <>
      <Link href="/admin/packages" className="mb-4 inline-flex items-center gap-1 text-sm text-ocean-800 hover:underline">
        <ArrowLeft className="size-4" /> All packages
      </Link>
      <PageHeader title={actions.isNew ? "Add package" : form.title || "Edit package"} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="title">
                <Input id="title" value={form.title} onChange={(e) => { const title = e.target.value; setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) })); }} />
              </Field>
              <Field label="Web address" htmlFor="slug" hint={`/packages/${form.slug || "…"}`}>
                <Input id="slug" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
              </Field>
              <Field label="Trip length" htmlFor="tripType" hint="Changing this clears the linked routes.">
                <Select id="tripType" value={form.tripType} onChange={(e) => setForm((f) => ({ ...f, tripType: e.target.value as TripType, routeIds: [] }))}>
                  <option value="one-day">One day</option>
                  <option value="two-day">Two days</option>
                </Select>
              </Field>
            </div>
            <Field label="Summary" htmlFor="summary">
              <Textarea id="summary" className="min-h-16" maxLength={400} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="Description" htmlFor="description" hint="Leave a blank line between paragraphs.">
              <Textarea id="description" className="min-h-40" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Highlights" htmlFor="highlights" hint="One per line.">
              <Textarea id="highlights" value={form.highlights} onChange={(e) => set("highlights", e.target.value)} />
            </Field>
          </Section>

          <Section title="Routes" description="Travelers choose one of these routes when they book this package.">
            {typeRoutes.length === 0 ? (
              <p className="text-sm text-ocean-950/60">No {form.tripType === "one-day" ? "one-day" : "two-day"} routes exist yet.</p>
            ) : (
              <ul className="space-y-2">
                {typeRoutes.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-ocean-900/10 p-3">
                    <Checkbox
                      label={r.name}
                      checked={form.routeIds.includes(r.id)}
                      onChange={(e) =>
                        set("routeIds", e.target.checked ? [...form.routeIds, r.id] : form.routeIds.filter((x) => x !== r.id))
                      }
                    />
                    {r.status !== "active" && <Badge>Disabled, hidden</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Included and not included">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  inclusions: listToLines(DEFAULT_INCLUSIONS[f.tripType]),
                  exclusions: listToLines(DEFAULT_EXCLUSIONS[f.tripType]),
                }))
              }
            >
              Use standard {form.tripType === "one-day" ? "one-day" : "two-day"} lists
            </Button>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Included" htmlFor="inc" hint="One per line.">
                <Textarea id="inc" className="min-h-40" value={form.inclusions} onChange={(e) => set("inclusions", e.target.value)} />
              </Field>
              <Field label="Not included" htmlFor="exc" hint="One per line.">
                <Textarea id="exc" className="min-h-40" value={form.exclusions} onChange={(e) => set("exclusions", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Photos">
            <MediaField label="Cover image" type="image" value={form.coverMediaId ? [form.coverMediaId] : []} onChange={(ids) => set("coverMediaId", ids[0] ?? null)} />
            <MediaField label="Gallery" type="image" multiple value={form.galleryMediaIds} onChange={(ids) => set("galleryMediaIds", ids)} />
          </Section>
        </div>

        <div>
          <Section title="Visibility">
            <Field label="Status" htmlFor="status">
              <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value as PublishStatus)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
            <Toggle label="Feature on the home page" checked={form.featured} onChange={(v) => set("featured", v)} />
            <Field label="Display order" htmlFor="sort" hint="Lower numbers appear first.">
              <Input id="sort" type="number" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", toNumber(e.target.value))} />
            </Field>
          </Section>
        </div>
      </div>

      <EditorFooter
        actions={actions}
        saveLabel={actions.isNew ? "Create package" : "Save changes"}
        onSave={() =>
          actions.save({
            ...form,
            highlights: linesToList(form.highlights),
            inclusions: linesToList(form.inclusions),
            exclusions: linesToList(form.exclusions),
          })
        }
      />
    </>
  );
}
