"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { NumberStepper } from "@/components/ui/stepper";
import { RouteLine } from "@/components/site/route-line";
import { COUNTRIES } from "@/lib/countries";
import { addDays, colomboToday, formatTripDate } from "@/lib/dates";
import { TRIP_TYPE_LABEL } from "@/lib/defaults";
import { calculatePrice, formatMoney, ratesFor, tierForNationality, validatePax } from "@/lib/pricing";
import type { BookingPax, RoutePricing, SiteSettings, TripType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Turnstile } from "./turnstile";

export interface WizardRoute {
  id: string;
  slug: string;
  name: string;
  tripType: TripType;
  summary: string;
  duration: string;
  maxSelectable: number;
  pickupPoints: string[];
  pricing: RoutePricing;
  stops: { destinationId: string; name: string; day: 1 | 2; mandatory: boolean }[];
}

const STEPS = ["Trip", "Stops", "Travelers", "Review"] as const;
const OTHER_PICKUP = "__other__";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function defaultSelection(route: WizardRoute | undefined): string[] {
  if (!route) return [];
  const mandatory = route.stops.filter((s) => s.mandatory).map((s) => s.destinationId);
  const optional = route.stops.filter((s) => !s.mandatory).map((s) => s.destinationId);
  return [...mandatory, ...optional.slice(0, Math.max(0, route.maxSelectable - mandatory.length))];
}

export function BookingWizard(props: {
  routes: WizardRoute[];
  childPolicy: SiteSettings["childPolicy"];
  minDaysAhead: number;
}) {
  const params = useSearchParams();
  const initialSlug = params.get("route");
  return <Wizard key={initialSlug ?? "none"} {...props} initialSlug={initialSlug} />;
}

function Wizard({
  routes,
  childPolicy,
  minDaysAhead,
  initialSlug,
}: {
  routes: WizardRoute[];
  childPolicy: SiteSettings["childPolicy"];
  minDaysAhead: number;
  initialSlug: string | null;
}) {
  const router = useRouter();
  const initialRoute = routes.find((r) => r.slug === initialSlug);

  const [step, setStep] = useState(0);
  const [tripType, setTripType] = useState<TripType>(initialRoute?.tripType ?? "one-day");
  const [routeId, setRouteId] = useState(initialRoute?.id ?? "");
  const [selected, setSelected] = useState<string[]>(defaultSelection(initialRoute));
  const [date, setDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [traveler, setTraveler] = useState({ name: "", nationalityCode: "", email: "", phone: "" });
  const [pax, setPax] = useState<BookingPax>({ adults: 2, children: 0, infants: 0, singleRooms: 0 });
  const [pickupChoice, setPickupChoice] = useState("");
  const [pickupOther, setPickupOther] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMinDate(addDays(colomboToday(), minDaysAhead));
  }, [minDaysAhead]);

  const route = routes.find((r) => r.id === routeId);
  const typeRoutes = routes.filter((r) => r.tripType === tripType);
  const tier = tierForNationality(traveler.nationalityCode || null);
  const price = route ? calculatePrice(route.pricing, tier, pax, route.tripType) : null;
  const paxError = route ? validatePax(pax, route.pricing, route.tripType) : null;
  const pickupPoint = pickupChoice === OTHER_PICKUP ? pickupOther.trim() : pickupChoice;
  const mandatoryCount = route?.stops.filter((s) => s.mandatory).length ?? 0;
  const selectedStops = useMemo(
    () => (route ? route.stops.filter((s) => selected.includes(s.destinationId)) : []),
    [route, selected],
  );

  function chooseRoute(id: string) {
    const next = routes.find((r) => r.id === id);
    setRouteId(id);
    setSelected(defaultSelection(next));
    setPickupChoice("");
    if (next) setPax((p) => ({ ...p, adults: Math.max(p.adults, 1), singleRooms: next.tripType === "two-day" ? p.singleRooms : 0 }));
  }

  function toggleStop(id: string) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  const stepErrors: Array<string | null> = [
    !route ? "Choose a route." : !date ? "Choose a trip date." : minDate && date < minDate ? `Choose a date on or after ${formatTripDate(minDate)}.` : null,
    !route
      ? "Choose a route first."
      : selected.length < Math.max(1, mandatoryCount)
        ? "Choose at least one stop."
        : selected.length > route.maxSelectable
          ? `Choose up to ${route.maxSelectable} stops.`
          : null,
    !traveler.name.trim()
      ? "Enter the lead traveler's name."
      : !traveler.nationalityCode
        ? "Choose a nationality."
        : !EMAIL_RE.test(traveler.email.trim())
          ? "Enter a valid email address."
          : traveler.phone.replace(/\D/g, "").length < 7
            ? "Enter a phone or WhatsApp number with country code."
            : paxError ?? (!pickupPoint ? "Choose a pickup point." : null),
    !consent ? "Accept the privacy notice to send your request." : null,
  ];

  function next() {
    const problem = stepErrors[step];
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const problem = stepErrors.find(Boolean);
    if (problem) {
      setError(problem);
      return;
    }
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !token) {
      setError("Complete the security check before sending.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripType,
          routeId,
          destinationIds: selected,
          date,
          traveler: { ...traveler, name: traveler.name.trim(), email: traveler.email.trim() },
          pax,
          pickupPoint,
          notes: notes.trim(),
          consent: true,
          turnstileToken: token,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ref?: string; error?: string };
      if (!res.ok || !data.ref) throw new Error(data.error ?? "The booking request could not be sent. Try again.");
      router.push(`/book/success?ref=${encodeURIComponent(data.ref)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The booking request could not be sent. Try again.");
      setSubmitting(false);
    }
  }

  if (routes.length === 0) {
    return (
      <Alert tone="sun">
        Online booking opens once tours are published. Contact us on WhatsApp or phone to plan your trip.
      </Alert>
    );
  }

  const rates = route ? ratesFor(route.pricing, tier) : null;
  const adultAge = `${childPolicy.childMaxAge + 1}+ years`;
  const childAge = `${childPolicy.infantMaxAge + 1}–${childPolicy.childMaxAge} years`;
  const infantAge = `Under ${childPolicy.infantMaxAge + 1}, travel free`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <ol className="flex gap-2" aria-label="Booking steps">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 border-t-4 pt-2 text-left text-sm font-medium",
                  i < step && "border-palm-500 text-palm-700",
                  i === step && "border-sun-500 text-ocean-950",
                  i > step && "border-ocean-900/10 text-ocean-950/40",
                )}
              >
                <span className="font-display font-bold tabular-nums">{i + 1}</span>
                <span className="hidden sm:inline">{label}</span>
                {i < step && <Check className="size-4" aria-label="done" />}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-ocean-900/10 sm:p-8">
          {step === 0 && (
            <div className="space-y-8">
              <fieldset>
                <legend className="font-display text-xl font-semibold">How long is your trip?</legend>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(["one-day", "two-day"] as TripType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTripType(type);
                        if (route?.tripType !== type) chooseRoute("");
                      }}
                      aria-pressed={tripType === type}
                      className={cn(
                        "rounded-xl border-2 p-4 text-left",
                        tripType === type ? "border-ocean-900 bg-ocean-50" : "border-ocean-900/10 hover:border-ocean-900/30",
                      )}
                    >
                      <span className="block font-semibold">{TRIP_TYPE_LABEL[type]}</span>
                      <span className="mt-1 block text-sm text-ocean-950/60">
                        {type === "one-day" ? "Back at your hotel the same evening" : "Includes one night at a hotel"}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-xl font-semibold">Choose a route</legend>
                {typeRoutes.length === 0 ? (
                  <p className="mt-3 text-sm text-ocean-950/60">No routes are available for this trip length yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {typeRoutes.map((r) => (
                      <label
                        key={r.id}
                        className={cn(
                          "block cursor-pointer rounded-xl border-2 p-4",
                          routeId === r.id ? "border-ocean-900 bg-ocean-50" : "border-ocean-900/10 hover:border-ocean-900/30",
                        )}
                      >
                        <input
                          type="radio"
                          name="route"
                          className="sr-only"
                          checked={routeId === r.id}
                          onChange={() => chooseRoute(r.id)}
                        />
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold">{r.name}</span>
                          <span className="font-display font-bold tabular-nums">
                            {formatMoney(r.pricing.foreignAdult, "USD")}
                            <span className="ml-1 font-sans text-xs font-normal text-ocean-950/60">per adult</span>
                          </span>
                        </span>
                        <span className="mt-1 block text-sm text-ocean-950/65">
                          {r.stops.map((s) => s.name).join(" · ")}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <Field label="Trip date" htmlFor="date" hint={minDate ? `Earliest date: ${formatTripDate(minDate)}` : undefined}>
                <Input id="date" type="date" value={date} min={minDate || undefined} max={minDate ? addDays(minDate, 365) : undefined} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
              </Field>
            </div>
          )}

          {step === 1 && route && (
            <div>
              <h2 className="font-display text-xl font-semibold">Choose your stops</h2>
              <p className="mt-1 text-sm text-ocean-950/65">
                Pick up to {route.maxSelectable} of {route.stops.length} stops. Stops are visited in this order.
              </p>
              <ul className="mt-6 space-y-2">
                {route.stops.map((stop, i) => {
                  const checked = selected.includes(stop.destinationId);
                  const atLimit = !checked && selected.length >= route.maxSelectable;
                  const dayStart = route.tripType === "two-day" && (i === 0 || route.stops[i - 1]?.day !== stop.day);
                  return (
                    <li key={stop.destinationId}>
                      {dayStart && <p className="mt-4 mb-2 text-sm font-semibold text-sun-600">Day {stop.day}</p>}
                      <label
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3",
                          checked ? "border-ocean-900 bg-ocean-50" : "border-ocean-900/10",
                          stop.mandatory ? "cursor-default" : atLimit ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-ocean-800"
                          checked={checked}
                          disabled={stop.mandatory || atLimit}
                          onChange={() => toggleStop(stop.destinationId)}
                        />
                        <span className="font-display text-sm font-bold text-ocean-950/40 tabular-nums">{i + 1}</span>
                        <span className="flex-1 font-medium">{stop.name}</span>
                        {stop.mandatory && (
                          <span className="inline-flex items-center gap-1 text-xs text-ocean-950/60">
                            <Lock className="size-3" /> Always included
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
              {selected.length >= route.maxSelectable && (
                <p className="mt-4 text-sm text-ocean-950/65">
                  You have chosen the maximum of {route.maxSelectable} stops. Remove one to add another.
                </p>
              )}
            </div>
          )}

          {step === 2 && route && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-xl font-semibold">Lead traveler</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="name">
                    <Input id="name" autoComplete="name" value={traveler.name} onChange={(e) => setTraveler({ ...traveler, name: e.target.value })} />
                  </Field>
                  <Field label="Nationality" htmlFor="nationality" hint="Sets the price and currency.">
                    <Select id="nationality" value={traveler.nationalityCode} onChange={(e) => setTraveler({ ...traveler, nationalityCode: e.target.value })}>
                      <option value="">Choose a country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Email" htmlFor="email">
                    <Input id="email" type="email" autoComplete="email" value={traveler.email} onChange={(e) => setTraveler({ ...traveler, email: e.target.value })} />
                  </Field>
                  <Field label="Phone or WhatsApp" htmlFor="phone" hint="Include the country code, e.g. +44 7700 900123">
                    <Input id="phone" type="tel" autoComplete="tel" value={traveler.phone} onChange={(e) => setTraveler({ ...traveler, phone: e.target.value })} />
                  </Field>
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold">Travelers</h2>
                <p className="mt-1 text-sm text-ocean-950/65">
                  This route needs at least {route.pricing.minPax} paying travelers and takes up to {route.pricing.maxPax}.
                </p>
                <div className="mt-2 divide-y divide-ocean-900/10">
                  <NumberStepper id="adults" label="Adults" hint={adultAge} value={pax.adults} min={1} max={route.pricing.maxPax} onChange={(v) => setPax({ ...pax, adults: v })} />
                  <NumberStepper id="children" label="Children" hint={childAge} value={pax.children} min={0} max={route.pricing.maxPax} onChange={(v) => setPax({ ...pax, children: v })} />
                  <NumberStepper id="infants" label="Infants" hint={infantAge} value={pax.infants} min={0} max={route.pricing.maxPax} onChange={(v) => setPax({ ...pax, infants: v })} />
                  {route.tripType === "two-day" && (
                    <NumberStepper
                      id="single"
                      label="Single rooms"
                      hint="Rooms are twin or double sharing. Add one for each person who needs their own room."
                      value={pax.singleRooms}
                      min={0}
                      max={pax.adults + pax.children}
                      onChange={(v) => setPax({ ...pax, singleRooms: v })}
                    />
                  )}
                </div>
                {paxError && <p className="mt-2 text-sm text-danger">{paxError}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pickup point" htmlFor="pickup">
                  <Select id="pickup" value={pickupChoice} onChange={(e) => setPickupChoice(e.target.value)}>
                    <option value="">Choose a pickup point</option>
                    {route.pickupPoints.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value={OTHER_PICKUP}>Somewhere else</option>
                  </Select>
                </Field>
                {pickupChoice === OTHER_PICKUP && (
                  <Field label="Hotel name or address" htmlFor="pickup-other">
                    <Input id="pickup-other" value={pickupOther} onChange={(e) => setPickupOther(e.target.value)} />
                  </Field>
                )}
                <Field label="Notes (optional)" htmlFor="notes" hint="Preferred pickup time, dietary needs, child seats, anything else." className="sm:col-span-2">
                  <Textarea id="notes" maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && route && price && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold">Check your request</h2>
              <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                <div><dt className="text-ocean-950/60">Trip</dt><dd className="font-medium">{TRIP_TYPE_LABEL[route.tripType]} · {route.name}</dd></div>
                <div><dt className="text-ocean-950/60">Date</dt><dd className="font-medium">{date && formatTripDate(date)}</dd></div>
                <div><dt className="text-ocean-950/60">Lead traveler</dt><dd className="font-medium">{traveler.name}</dd></div>
                <div><dt className="text-ocean-950/60">Contact</dt><dd className="font-medium break-all">{traveler.email} · {traveler.phone}</dd></div>
                <div><dt className="text-ocean-950/60">Pickup</dt><dd className="font-medium">{pickupPoint}</dd></div>
                <div>
                  <dt className="text-ocean-950/60">Travelers</dt>
                  <dd className="font-medium">
                    {pax.adults} adult{pax.adults === 1 ? "" : "s"}
                    {pax.children > 0 && `, ${pax.children} child${pax.children === 1 ? "" : "ren"}`}
                    {pax.infants > 0 && `, ${pax.infants} infant${pax.infants === 1 ? "" : "s"}`}
                    {pax.singleRooms > 0 && `, ${pax.singleRooms} single room${pax.singleRooms === 1 ? "" : "s"}`}
                  </dd>
                </div>
              </dl>
              {notes && <p className="rounded-lg bg-ocean-50 p-3 text-sm">{notes}</p>}
              <Checkbox
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                label={
                  <>
                    I agree that my details are used to arrange this trip, as described in the{" "}
                    <a href="/privacy" target="_blank" className="font-semibold text-ocean-600 underline">privacy notice</a>.
                  </>
                }
              />
              <Turnstile onToken={setToken} />
              <p className="text-sm text-ocean-950/65">
                Sending a request does not charge you. We contact you to confirm the date, pickup time and final price.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6">
              <Alert>{error}</Alert>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ocean-900/10 pt-5">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => { setError(null); setStep(step - 1); }}>Back</Button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <Button variant="dark" size="lg" onClick={next}>Continue</Button>
            ) : (
              <Button size="lg" onClick={submit} disabled={submitting}>
                {submitting ? "Sending request…" : "Send booking request"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-ocean-950 p-6 text-white">
          <p className="text-sm text-sun-500">{TRIP_TYPE_LABEL[tripType]}</p>
          <p className="mt-1 font-display text-xl font-bold">{route?.name ?? "No route chosen yet"}</p>
          {date && <p className="mt-1 text-sm text-white/70">{formatTripDate(date)}</p>}

          {selectedStops.length > 0 && (
            <div className="mt-6">
              <RouteLine tone="dark" size="sm" orientation="vertical" stops={selectedStops.map((s) => ({ name: s.name, day: s.day, mandatory: s.mandatory }))} />
            </div>
          )}

          {route && price && rates && (
            <div className="mt-6 border-t border-white/10 pt-5 text-sm">
              <div className="space-y-1.5 text-white/80">
                <p className="flex justify-between"><span>{pax.adults} × adult</span><span className="tabular-nums">{formatMoney(pax.adults * rates.adult, price.currency)}</span></p>
                {pax.children > 0 && <p className="flex justify-between"><span>{pax.children} × child</span><span className="tabular-nums">{formatMoney(pax.children * rates.child, price.currency)}</span></p>}
                {pax.infants > 0 && <p className="flex justify-between"><span>{pax.infants} × infant</span><span>Free</span></p>}
                {route.tripType === "two-day" && pax.singleRooms > 0 && (
                  <p className="flex justify-between"><span>{pax.singleRooms} × single room</span><span className="tabular-nums">{formatMoney(pax.singleRooms * rates.single, price.currency)}</span></p>
                )}
              </div>
              <p className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                <span>Estimated total</span>
                <span className="font-display text-2xl font-bold tabular-nums text-sun-500">{formatMoney(price.estimatedTotal, price.currency)}</span>
              </p>
              <p className="mt-2 text-xs text-white/60">
                {traveler.nationalityCode
                  ? tier === "local"
                    ? "Sri Lankan national rate in rupees."
                    : "Foreign national rate in US dollars."
                  : "Shown in US dollars. Sri Lankan nationals see the rupee rate after choosing nationality."}{" "}
                Final price is confirmed by our team.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
