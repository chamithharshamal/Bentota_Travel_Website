"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { RequireRole } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/admin/auth-provider";
import { docRef, useLiveDoc } from "@/components/admin/hooks";
import { BookingStatusBadge, PriorityBadge, STATUS_LABEL } from "@/components/admin/status";
import { RouteLine } from "@/components/site/route-line";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { Alert, Card, PageHeader, Spinner } from "@/components/ui/misc";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { formatDateTime, formatTripDate } from "@/lib/dates";
import { formatMoney } from "@/lib/pricing";
import { BOOKING_STATUSES, type Booking, type BookingStatus } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";

export default function BookingDetailPage() {
  return (
    <RequireRole roles={["admin", "agent"]}>
      <BookingDetail />
    </RequireRole>
  );
}

function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: booking, loading, error } = useLiveDoc<Booking>(
    () => docRef("bookings", id),
    [id],
    { collection: "bookings", id },
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const markedSeen = useRef(false);

  useEffect(() => {
    if (!booking || !user || markedSeen.current || booking.seenBy?.includes(user.uid)) return;
    markedSeen.current = true;
    apiFetch(`/api/admin/bookings/${booking.id}`, { method: "PATCH", body: { markSeen: true } }).catch(() => undefined);
  }, [booking, user]);

  async function update(body: { status?: BookingStatus; note?: string }) {
    setBusy(true);
    setActionError(null);
    try {
      await apiFetch(`/api/admin/bookings/${id}`, { method: "PATCH", body });
      if (body.note) setNote("");
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  if (!booking) return <Alert>This booking does not exist.</Alert>;

  const b = booking;
  const wa = whatsappLink(b.traveler.phone, `Hello ${b.traveler.name}, this is Bentota Smart Journeys about your booking ${b.ref}.`);
  const paxLines = [
    `${b.pax.adults} adult${b.pax.adults === 1 ? "" : "s"} × ${formatMoney(b.price.adultRate, b.price.currency)}`,
    b.pax.children > 0 && `${b.pax.children} child${b.pax.children === 1 ? "" : "ren"} × ${formatMoney(b.price.childRate, b.price.currency)}`,
    b.pax.infants > 0 && `${b.pax.infants} infant${b.pax.infants === 1 ? "" : "s"} (free)`,
    b.pax.singleRooms > 0 && `${b.pax.singleRooms} single room${b.pax.singleRooms === 1 ? "" : "s"} × ${formatMoney(b.price.singleSupplementRate, b.price.currency)}`,
  ].filter(Boolean) as string[];

  return (
    <>
      <Link href="/admin/bookings" className="mb-4 inline-flex items-center gap-1 text-sm text-ocean-800 hover:underline">
        <ArrowLeft className="size-4" /> All bookings
      </Link>
      <PageHeader
        title={b.ref}
        description={`Received ${formatDateTime(b.createdAt)}${b.firstSeenAt ? ` · first opened ${formatDateTime(b.firstSeenAt)}` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={b.status} />
            {b.isForeign && <PriorityBadge />}
          </div>
        }
      />

      {actionError && <div className="mb-4"><Alert>{actionError}</Alert></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold">Trip</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
              <div><dt className="text-ocean-950/60">Trip type</dt><dd className="font-medium">{b.tripType === "one-day" ? "One day" : "Two days"}</dd></div>
              <div><dt className="text-ocean-950/60">Route</dt><dd className="font-medium">{b.route.name}</dd></div>
              <div><dt className="text-ocean-950/60">Date</dt><dd className="font-medium">{formatTripDate(b.date)}</dd></div>
              <div className="sm:col-span-3"><dt className="text-ocean-950/60">Pickup</dt><dd className="font-medium">{b.pickupPoint}</dd></div>
            </dl>
            <h3 className="mt-6 text-sm text-ocean-950/60">Selected stops, in route order</h3>
            <RouteLine className="mt-3" size="sm" stops={b.destinations.map((d) => ({ name: d.name, day: d.day, mandatory: d.mandatory }))} />
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Lead traveler</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-ocean-950/60">Name</dt><dd className="font-medium">{b.traveler.name}</dd></div>
              <div><dt className="text-ocean-950/60">Nationality</dt><dd className="font-medium">{b.traveler.nationality}</dd></div>
              <div><dt className="text-ocean-950/60">Email</dt><dd className="font-medium break-all">{b.traveler.email}</dd></div>
              <div><dt className="text-ocean-950/60">Phone / WhatsApp</dt><dd className="font-medium">{b.traveler.phone}</dd></div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {wa && (
                <a href={wa} target="_blank" rel="noreferrer" className={buttonClass("primary", "sm")}>
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              )}
              <a href={`tel:${b.traveler.phone.replace(/[^\d+]/g, "")}`} className={buttonClass("outline", "sm")}>
                <Phone className="size-4" /> Call
              </a>
              <a href={`mailto:${b.traveler.email}?subject=${encodeURIComponent(`Your booking ${b.ref}`)}`} className={buttonClass("outline", "sm")}>
                <Mail className="size-4" /> Email
              </a>
            </div>
            {b.notes && (
              <div className="mt-5">
                <p className="text-sm text-ocean-950/60">Traveler notes</p>
                <p className="mt-1 rounded-lg bg-ocean-50 p-3 text-sm whitespace-pre-wrap">{b.notes}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Internal notes</h2>
            <p className="text-xs text-ocean-950/60">Only staff can see these.</p>
            <ul className="mt-4 space-y-3">
              {(b.internalNotes ?? []).length === 0 && <li className="text-sm text-ocean-950/60">No notes yet.</li>}
              {[...(b.internalNotes ?? [])].sort((x, y) => y.at - x.at).map((n) => (
                <li key={`${n.at}-${n.by}`} className="rounded-lg bg-ocean-50 p-3 text-sm">
                  <p className="whitespace-pre-wrap">{n.text}</p>
                  <p className="mt-1 text-xs text-ocean-950/55">{n.byEmail} · {formatDateTime(n.at)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <Textarea placeholder="Add a note, e.g. called traveler, confirmed pickup at 7:30 AM" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
              <Button variant="dark" size="sm" disabled={busy || !note.trim()} onClick={() => update({ note: note.trim() })}>
                Add note
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <Field label="Booking status" htmlFor="status">
              <Select id="status" value={b.status} disabled={busy} onChange={(e) => update({ status: e.target.value as BookingStatus })}>
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </Select>
            </Field>
            <h3 className="mt-6 text-sm text-ocean-950/60">History</h3>
            <ol className="mt-2 space-y-2 text-sm">
              {[...(b.statusHistory ?? [])].sort((x, y) => y.at - x.at).map((h) => (
                <li key={`${h.at}-${h.status}`}>
                  <span className="font-medium">{STATUS_LABEL[h.status]}</span>
                  <span className="block text-xs text-ocean-950/55">{h.byEmail || "Website"} · {formatDateTime(h.at)}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Price estimate</h2>
            <p className="text-xs text-ocean-950/60">
              {b.price.tier === "foreign" ? "Foreign national rate (USD)" : "Sri Lankan national rate (LKR)"} · calculated by the server
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              {paxLines.map((l) => <li key={l}>{l}</li>)}
            </ul>
            <p className="mt-4 flex items-baseline justify-between border-t border-ocean-900/10 pt-3">
              <span className="text-sm">Estimated total</span>
              <span className="font-display text-2xl font-bold tabular-nums">{formatMoney(b.price.estimatedTotal, b.price.currency)}</span>
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
