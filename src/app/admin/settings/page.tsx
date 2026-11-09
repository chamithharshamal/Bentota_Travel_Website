"use client";

import { useEffect, useState } from "react";
import { getDoc } from "firebase/firestore";
import { RequireRole } from "@/components/admin/admin-shell";
import { Section, toNumber } from "@/components/admin/editor";
import { docRef } from "@/components/admin/hooks";
import { MediaField } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Alert, PageHeader, Spinner } from "@/components/ui/misc";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { getDemoDoc, isDemoMode } from "@/lib/demo-store";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import type { SiteSettings } from "@/lib/types";
import { linesToList, listToLines } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <RequireRole roles={["admin", "editor"]}>
      <SettingsForm />
    </RequireRole>
  );
}

type Form = Omit<SiteSettings, "updatedAt" | "adminSmsNumbers"> & { adminSmsNumbers: string };

function SettingsForm() {
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode() || !isFirebaseClientConfigured) {
      const s = getDemoDoc<SiteSettings>("settings", "site") ?? (DEFAULT_SETTINGS as SiteSettings);
      const { updatedAt: _u, ...rest } = s;
      setForm({ ...rest, adminSmsNumbers: listToLines(s.adminSmsNumbers || []) });
      return;
    }
    getDoc(docRef("settings", "site"))
      .then((snap) => {
        const s = { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SiteSettings> | undefined) };
        const { updatedAt: _u, ...rest } = s as SiteSettings;
        setForm({ ...rest, adminSmsNumbers: listToLines(s.adminSmsNumbers) });
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (!form) return error ? <Alert>{error}</Alert> : <Spinner />;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  async function save() {
    if (!form) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: { ...form, adminSmsNumbers: linesToList(form.adminSmsNumbers) },
      });
      setNotice("Settings saved. The website updates within a few minutes.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Website settings" description="Business details, booking rules, the home page image, and the gallery." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Business details">
          <Field label="Business name" htmlFor="bn"><Input id="bn" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} /></Field>
          <Field label="Tagline" htmlFor="tag"><Input id="tag" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact email" htmlFor="ce"><Input id="ce" type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
            <Field label="Contact phone" htmlFor="cp"><Input id="cp" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
          </div>
          <Field label="WhatsApp number" htmlFor="wa" hint="With country code, e.g. +94 77 123 4567. Used for the WhatsApp buttons.">
            <Input id="wa" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} />
          </Field>
          <Field label="Address" htmlFor="addr"><Textarea id="addr" className="min-h-16" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        </Section>

        <Section title="Booking rules" description="These apply to every route.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Infants travel free up to age" htmlFor="inf" hint="Default: 4">
              <Input id="inf" type="number" min={0} max={5} value={form.childPolicy.infantMaxAge} onChange={(e) => set("childPolicy", { ...form.childPolicy, infantMaxAge: toNumber(e.target.value) })} />
            </Field>
            <Field label="Child rate applies up to age" htmlFor="child" hint="Default: 11. Older travelers pay the adult rate.">
              <Input id="child" type="number" min={1} max={17} value={form.childPolicy.childMaxAge} onChange={(e) => set("childPolicy", { ...form.childPolicy, childMaxAge: toNumber(e.target.value) })} />
            </Field>
            <Field label="Book at least this many days ahead" htmlFor="days" hint="Default: 1 (Sri Lanka time)">
              <Input id="days" type="number" min={0} max={30} value={form.bookingMinDaysAhead} onChange={(e) => set("bookingMinDaysAhead", toNumber(e.target.value))} />
            </Field>
          </div>
        </Section>

        <Section title="Home page">
          <MediaField label="Hero image" hint="Wide landscape photo, at least 1600 px wide." type="image" value={form.heroMediaId ? [form.heroMediaId] : []} onChange={(ids) => set("heroMediaId", ids[0] ?? null)} />
        </Section>

        <Section title="Gallery page" description="Choose and order what appears on the public gallery.">
          <MediaField label="Gallery images" type="image" multiple value={form.galleryMediaIds.filter(Boolean)} onChange={(ids) => set("galleryMediaIds", ids)} />
        </Section>

        <Section title="SMS alerts (future phase)" description="Numbers that will receive a text when a booking arrives, once SMS alerts are turned on by the developer.">
          <Field label="Admin mobile numbers" htmlFor="sms" hint="One per line, with country code.">
            <Textarea id="sms" value={form.adminSmsNumbers} onChange={(e) => set("adminSmsNumbers", e.target.value)} />
          </Field>
        </Section>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-ocean-900/10 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {(error || notice) && <div className="mb-3">{error ? <Alert>{error}</Alert> : <Alert tone="palm">{notice}</Alert>}</div>}
        <div className="flex justify-end">
          <Button variant="dark" size="lg" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
        </div>
      </div>
    </>
  );
}
