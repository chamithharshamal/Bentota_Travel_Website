"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, X } from "lucide-react";
import { RequireRole } from "@/components/admin/admin-shell";
import { EditorFooter, Section, toNumber, useDocOnce, useEditorActions } from "@/components/admin/editor";
import { useDestinations } from "@/components/admin/hooks";
import { MediaField } from "@/components/admin/media-picker";
import { RouteLine } from "@/components/site/route-line";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Alert, Badge, PageHeader, Spinner } from "@/components/ui/misc";
import { DEFAULT_PRICING, SUGGESTED_CHILD_RATE } from "@/lib/defaults";
import type { RoutePricing, RouteStatus, RouteStop, TourRoute, TripType } from "@/lib/types";
import { linesToList, listToLines, slugify } from "@/lib/utils";

export default function RouteEditorPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <Editor />
    </RequireRole>
  );
}

const EMPTY = {
  name: "",
  slug: "",
  tripType: "one-day" as TripType,
  summary: "",
  duration: "",
  stops: [] as RouteStop[],
  maxSelectable: 1,
  pickupPoints: "Hotels in Bentota\nHotels in Aluthgama\nHotels in Induruwa",
  pricing: DEFAULT_PRICING as RoutePricing,
  coverMediaId: null as string | null,
  status: "disabled" as RouteStatus,
  sortOrder: 0,
};

function Editor() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useDocOnce<TourRoute>("routes", id);
  const destinations = useDestinations();
  const actions = useEditorActions({ endpoint: "/api/admin/routes", listHref: "/admin/routes", id, noun: "Route" });
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name,
      slug: data.slug,
      tripType: data.tripType,
      summary: data.summary,
      duration: data.duration,
      stops: data.stops,
      maxSelectable: data.maxSelectable,
      pickupPoints: listToLines(data.pickupPoints),
      pricing: { ...DEFAULT_PRICING, ...data.pricing },
      coverMediaId: data.coverMediaId,
      status: data.status,
      sortOrder: data.sortOrder,
    });
    setSlugTouched(true);
  }, [data]);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setPrice = (key: keyof RoutePricing, value: number) => setForm((f) => ({ ...f, pricing: { ...f.pricing, [key]: value } }));
  const names = new Map(destinations.data.map((d) => [d.id, d]));
  const available = destinations.data.filter((d) => !form.stops.some((s) => s.destinationId === d.id));
  const twoDay = form.tripType === "two-day";
  const mandatory = form.stops.filter((s) => s.mandatory).length;

  function updateStop(index: number, patch: Partial<RouteStop>) {
    setForm((f) => ({ ...f, stops: f.stops.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  }
  function moveStop(index: number, delta: number) {
    setForm((f) => {
      const stops = [...f.stops];
      const [s] = stops.splice(index, 1);
      stops.splice(index + delta, 0, s!);
      return { ...f, stops };
    });
  }
  function addStop(destinationId: string) {
    if (!destinationId) return;
    setForm((f) => {
      const lastDay = f.stops.at(-1)?.day ?? 1;
      const stops = [...f.stops, { destinationId, day: (twoDay ? lastDay : 1) as 1 | 2, mandatory: false }];
      return { ...f, stops, maxSelectable: Math.max(f.maxSelectable, f.stops.length === 0 ? 1 : f.maxSelectable) };
    });
  }

  function submit() {
    const stops = twoDay ? [...form.stops].sort((a, b) => a.day - b.day) : form.stops.map((s) => ({ ...s, day: 1 as const }));
    actions.save({
      ...form,
      stops,
      pickupPoints: linesToList(form.pickupPoints),
      pricing: twoDay ? form.pricing : { ...form.pricing, foreignSingleSupplement: 0, localSingleSupplement: 0 },
    });
  }

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  const money = (key: keyof RoutePricing, label: string, currency: "USD" | "LKR", hint?: string) => (
    <Field label={label} htmlFor={key} hint={hint ?? currency}>
      <Input id={key} type="number" min={0} step={currency === "USD" ? "1" : "100"} value={form.pricing[key]} onChange={(e) => setPrice(key, toNumber(e.target.value))} />
    </Field>
  );

  return (
    <>
      <Link href="/admin/routes" className="mb-4 inline-flex items-center gap-1 text-sm text-ocean-800 hover:underline">
        <ArrowLeft className="size-4" /> All routes
      </Link>
      <PageHeader title={actions.isNew ? "Add route" : form.name || "Edit route"} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Route name" htmlFor="name">
                <Input id="name" value={form.name} onChange={(e) => { const name = e.target.value; setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) })); }} />
              </Field>
              <Field label="Web address" htmlFor="slug" hint={`/book?route=${form.slug || "…"}`}>
                <Input id="slug" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
              </Field>
              <Field label="Trip length" htmlFor="tripType">
                <Select
                  id="tripType"
                  value={form.tripType}
                  onChange={(e) => {
                    const t = e.target.value as TripType;
                    setForm((f) => ({ ...f, tripType: t, stops: t === "one-day" ? f.stops.map((s) => ({ ...s, day: 1 })) : f.stops }));
                  }}
                >
                  <option value="one-day">One day</option>
                  <option value="two-day">Two days</option>
                </Select>
              </Field>
              <Field label="Timing" htmlFor="duration" hint="e.g. 7:00 AM – 6:30 PM">
                <Input id="duration" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
              </Field>
            </div>
            <Field label="Summary" htmlFor="summary" hint="One or two sentences shown with the route.">
              <Textarea id="summary" className="min-h-16" maxLength={400} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
          </Section>

          <Section title="Stops" description="Add destinations in the order they are visited. Travelers can only choose from these stops.">
            {form.stops.length === 0 ? (
              <p className="text-sm text-ocean-950/60">No stops yet.</p>
            ) : (
              <ol className="space-y-2">
                {form.stops.map((stop, i) => {
                  const d = names.get(stop.destinationId);
                  return (
                    <li key={stop.destinationId} className="flex flex-wrap items-center gap-3 rounded-lg border border-ocean-900/10 p-3">
                      <span className="w-6 font-display font-bold text-ocean-950/50 tabular-nums">{i + 1}</span>
                      <span className="min-w-40 flex-1 font-medium">
                        {d?.name ?? "Deleted destination"}
                        {d?.status === "draft" && <Badge className="ml-2">Draft, hidden</Badge>}
                      </span>
                      {twoDay && (
                        <Select aria-label="Day" value={stop.day} onChange={(e) => updateStop(i, { day: Number(e.target.value) as 1 | 2 })} className="h-8 w-24">
                          <option value={1}>Day 1</option>
                          <option value={2}>Day 2</option>
                        </Select>
                      )}
                      <Checkbox label="Always included" checked={stop.mandatory} onChange={(e) => updateStop(i, { mandatory: e.target.checked })} />
                      <span className="flex">
                        <button type="button" disabled={i === 0} onClick={() => moveStop(i, -1)} className="rounded p-1.5 hover:bg-ocean-100 disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
                        <button type="button" disabled={i === form.stops.length - 1} onClick={() => moveStop(i, 1)} className="rounded p-1.5 hover:bg-ocean-100 disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, stops: f.stops.filter((_, x) => x !== i) }))} className="rounded p-1.5 text-danger hover:bg-danger-100" aria-label="Remove stop"><X className="size-4" /></button>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Add a stop" htmlFor="add-stop" hint={destinations.data.length === 0 ? "Create destinations first." : undefined}>
                <Select id="add-stop" value="" onChange={(e) => addStop(e.target.value)}>
                  <option value="">Choose a destination</option>
                  {available.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}{d.status === "draft" ? " (draft)" : ""}</option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Most stops a traveler can choose"
                htmlFor="max"
                hint={`Between ${Math.max(1, mandatory)} and ${Math.max(1, form.stops.length)}. Always-included stops count toward this.`}
              >
                <Input id="max" type="number" min={Math.max(1, mandatory)} max={Math.max(1, form.stops.length)} value={form.maxSelectable} onChange={(e) => set("maxSelectable", toNumber(e.target.value, 1))} />
              </Field>
            </div>
            {twoDay && <p className="text-xs text-ocean-950/60">Day 1 stops are listed before Day 2 stops when you save.</p>}
          </Section>

          <Section
            title="Per-person pricing"
            description="The price is fixed per route and does not change with the number of stops chosen. Children pay the child rate, infants are free."
          >
            <div>
              <p className="text-sm font-semibold">Foreign nationals</p>
              <div className="mt-2 grid gap-4 sm:grid-cols-3">
                {money("foreignAdult", "Adult", "USD")}
                {money("foreignChild", "Child", "USD")}
                {twoDay && money("foreignSingleSupplement", "Single room supplement", "USD", "USD, per person")}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Sri Lankan nationals</p>
              <div className="mt-2 grid gap-4 sm:grid-cols-3">
                {money("localAdult", "Adult", "LKR")}
                {money("localChild", "Child", "LKR")}
                {twoDay && money("localSingleSupplement", "Single room supplement", "LKR", "LKR, per person")}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  pricing: {
                    ...f.pricing,
                    foreignChild: Math.round(f.pricing.foreignAdult * SUGGESTED_CHILD_RATE),
                    localChild: Math.round((f.pricing.localAdult * SUGGESTED_CHILD_RATE) / 100) * 100,
                  },
                }))
              }
            >
              Set child rates to 50% of adult
            </Button>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Minimum paying travelers" htmlFor="minPax" hint="Adults and children">
                <Input id="minPax" type="number" min={1} value={form.pricing.minPax} onChange={(e) => setPrice("minPax", toNumber(e.target.value, 1))} />
              </Field>
              <Field label="Maximum travelers" htmlFor="maxPax" hint="Including infants">
                <Input id="maxPax" type="number" min={1} value={form.pricing.maxPax} onChange={(e) => setPrice("maxPax", toNumber(e.target.value, 1))} />
              </Field>
            </div>
          </Section>

          <Section title="Pickup">
            <Field label="Pickup points" htmlFor="pickup" hint="One per line. Travelers can also enter their own hotel.">
              <Textarea id="pickup" value={form.pickupPoints} onChange={(e) => set("pickupPoints", e.target.value)} />
            </Field>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Visibility">
            <Field label="Status" htmlFor="status" hint="Disabled routes are hidden and cannot be booked.">
              <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value as RouteStatus)}>
                <option value="disabled">Disabled</option>
                <option value="active">Active</option>
              </Select>
            </Field>
            <Field label="Display order" htmlFor="sort" hint="Lower numbers appear first.">
              <Input id="sort" type="number" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", toNumber(e.target.value))} />
            </Field>
            <MediaField label="Cover image" type="image" value={form.coverMediaId ? [form.coverMediaId] : []} onChange={(ids) => set("coverMediaId", ids[0] ?? null)} />
          </Section>
          {form.stops.length > 0 && (
            <Section title="Preview">
              <RouteLine
                size="sm"
                orientation="vertical"
                stops={(twoDay ? [...form.stops].sort((a, b) => a.day - b.day) : form.stops).map((s) => ({
                  name: names.get(s.destinationId)?.name ?? "Deleted destination",
                  day: twoDay ? s.day : undefined,
                  mandatory: s.mandatory,
                }))}
              />
            </Section>
          )}
        </div>
      </div>

      <EditorFooter actions={actions} saveLabel={actions.isNew ? "Create route" : "Save changes"} onSave={submit} />
    </>
  );
}
