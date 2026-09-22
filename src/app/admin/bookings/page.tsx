"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { RequireRole } from "@/components/admin/admin-shell";
import { useLiveQuery } from "@/components/admin/hooks";
import { STATUS_LABEL } from "@/components/admin/status";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Select } from "@/components/ui/form";
import { Alert, EmptyState, PageHeader, Spinner } from "@/components/ui/misc";
import { addDays, colomboToday } from "@/lib/dates";
import { clientDb } from "@/lib/firebase/client";
import { BOOKING_STATUSES, type Booking } from "@/lib/types";
import { BookingTable } from "@/components/admin/booking-table";

const PAGE = 300;

export default function BookingsPage() {
  return (
    <RequireRole roles={["admin", "agent"]}>
      <Suspense fallback={<Spinner />}>
        <BookingsList />
      </Suspense>
    </RequireRole>
  );
}

function BookingsList() {
  const params = useSearchParams();
  const preset = params.get("filter");
  const today = colomboToday();
  const [max, setMax] = useState(PAGE);
  const { data, loading, error } = useLiveQuery<Booking>(
    () => query(collection(clientDb(), "bookings"), orderBy("createdAt", "desc"), limit(max)),
    [max],
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(preset === "new" || preset === "priority" ? "new" : "");
  const [tripType, setTripType] = useState("");
  const [routeId, setRouteId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [from, setFrom] = useState(preset === "today" ? today : preset === "upcoming" ? addDays(today, 1) : "");
  const [to, setTo] = useState(preset === "today" ? today : preset === "upcoming" ? addDays(today, 7) : "");
  const [foreignOnly, setForeignOnly] = useState(preset === "priority");

  const routes = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((b) => map.set(b.route.id, b.route.name));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const destinations = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((b) => b.destinations.forEach((d) => map.set(d.id, d.name)));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((b) => {
      if (status && b.status !== status) return false;
      if (tripType && b.tripType !== tripType) return false;
      if (routeId && b.route.id !== routeId) return false;
      if (destinationId && !b.destinations.some((d) => d.id === destinationId)) return false;
      if (from && b.date < from) return false;
      if (to && b.date > to) return false;
      if (foreignOnly && !b.isForeign) return false;
      if (term) {
        const hay = `${b.ref} ${b.traveler.name} ${b.traveler.email} ${b.traveler.phone}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [data, search, status, tripType, routeId, destinationId, from, to, foreignOnly]);

  function clear() {
    setSearch("");
    setStatus("");
    setTripType("");
    setRouteId("");
    setDestinationId("");
    setFrom("");
    setTo("");
    setForeignOnly(false);
  }

  return (
    <>
      <PageHeader title="Bookings" description="All one-day and two-day booking requests. The list updates on its own." />

      <div className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-ocean-900/10 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Search reference, name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search bookings" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </Select>
        <Select value={tripType} onChange={(e) => setTripType(e.target.value)} aria-label="Trip type">
          <option value="">One day and two day</option>
          <option value="one-day">One day</option>
          <option value="two-day">Two day</option>
        </Select>
        <Select value={routeId} onChange={(e) => setRouteId(e.target.value)} aria-label="Route">
          <option value="">All routes</option>
          {routes.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </Select>
        <Select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} aria-label="Destination">
          <option value="">All destinations</option>
          {destinations.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 text-ocean-950/60">From</span>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 text-ocean-950/60">To</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <div className="flex items-center justify-between gap-3">
          <Checkbox label="Foreign travelers only" checked={foreignOnly} onChange={(e) => setForeignOnly(e.target.checked)} />
          <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
        </div>
      </div>

      <div className="mt-6">
        {error && <Alert>{error}</Alert>}
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="No bookings match these filters" body="Clear the filters to see every booking." />
        ) : (
          <>
            <p className="mb-2 text-sm text-ocean-950/60">{filtered.length} booking{filtered.length === 1 ? "" : "s"}</p>
            <BookingTable bookings={filtered} showCreated />
          </>
        )}
        {data.length >= max && (
          <Button variant="outline" className="mt-4" onClick={() => setMax(max + PAGE)}>
            Load older bookings
          </Button>
        )}
      </div>
    </>
  );
}
