"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  X,
  MapPin,
  Plus,
  Lock,
  RotateCcw,
  ArrowRight,
  Plane,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";
import {
  MAP_DESTINATIONS,
  REGION_ORDER,
  type MapDestination,
  insertOptimalRouteStop,
  calculateTotalRouteDistance,
} from "@/lib/sri-lanka-map-data";
import { cn } from "@/lib/utils";

const LeafletRouteMap = dynamic(
  () => import("./leaflet-route-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100/90 text-slate-600 font-semibold text-sm rounded-2xl border border-slate-200">
        Loading Real Map of Sri Lanka...
      </div>
    ),
  }
);

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                            */
/* ────────────────────────────────────────────────────────────────── */

export interface RouteMapPackageData {
  id: string;
  title: string;
  tripType: "one-day" | "two-day";
  price: number;
  /** IDs that match MapDestination.id — these are the default stops */
  defaultDestinations: string[];
  /** IDs for extra stops tourists can optionally add */
  availableDestinations: string[];
  /** IDs that cannot be removed (e.g. pickup point) */
  mandatoryDestinations: string[];
  maxStops: number;
  region: string;
}

interface RouteMapPopupProps {
  open: boolean;
  onClose: () => void;
  packageData: RouteMapPackageData;
}

export function RouteMapPopup({ open, onClose, packageData }: RouteMapPopupProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([...packageData.defaultDestinations]);
  const [animatingPins, setAnimatingPins] = useState<Record<string, "in" | "out">>({});
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  const [pathKey, setPathKey] = useState(0);

  // Reset when package changes or popup opens
  useEffect(() => {
    if (open) {
      setSelectedIds([...packageData.defaultDestinations]);
      setAnimatingPins({});
      setPathKey((k) => k + 1);
    }
  }, [open, packageData]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const isMandatory = useCallback(
    (id: string) => packageData.mandatoryDestinations.includes(id),
    [packageData.mandatoryDestinations],
  );

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const allDestinations = useMemo(() => {
    const allIds = new Set([
      ...packageData.defaultDestinations,
      ...packageData.availableDestinations,
    ]);
    return MAP_DESTINATIONS.filter((d) => allIds.has(d.id));
  }, [packageData]);

  const selectedDestinations = useMemo(
    () =>
      selectedIds
        .map((id) => MAP_DESTINATIONS.find((d) => d.id === id))
        .filter(Boolean) as MapDestination[],
    [selectedIds],
  );

  const totalDistance = useMemo(
    () => calculateTotalRouteDistance(selectedDestinations),
    [selectedDestinations],
  );

  const availableToAdd = useMemo(
    () =>
      allDestinations.filter(
        (d) => !selectedIds.includes(d.id) && packageData.availableDestinations.includes(d.id),
      ),
    [allDestinations, selectedIds, packageData.availableDestinations],
  );

  const atLimit = selectedIds.length >= packageData.maxStops;

  function addDestination(id: string) {
    if (atLimit || isSelected(id)) return;
    setAnimatingPins((p) => ({ ...p, [id]: "in" }));
    // Smart Shortest Path Insertion
    setSelectedIds((cur) => insertOptimalRouteStop(cur, id));
    setPathKey((k) => k + 1);
    setTimeout(() => setAnimatingPins((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    }), 500);
  }

  function removeDestination(id: string) {
    if (isMandatory(id)) return;
    setAnimatingPins((p) => ({ ...p, [id]: "out" }));
    setTimeout(() => {
      setSelectedIds((cur) => cur.filter((x) => x !== id));
      setPathKey((k) => k + 1);
      setAnimatingPins((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    }, 300);
  }

  function resetRoute() {
    setSelectedIds([...packageData.defaultDestinations]);
    setPathKey((k) => k + 1);
    setAnimatingPins({});
  }

  function proceedToBooking() {
    const params = new URLSearchParams();
    params.set("package", packageData.id);
    params.set("stops", selectedIds.join(","));
    router.push(`/book?${params.toString()}`);
  }

  function toggleRegion(region: string) {
    setExpandedRegions((r) => ({ ...r, [region]: !r[region] }));
  }

  // Group available destinations by region
  const groupedAvailable = useMemo(() => {
    const groups: Record<string, MapDestination[]> = {};
    for (const d of availableToAdd) {
      (groups[d.region] ??= []).push(d);
    }
    return REGION_ORDER.filter((r) => groups[r]).map((r) => ({
      region: r,
      destinations: groups[r],
    }));
  }, [availableToAdd]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ocean-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Popup Container */}
      <div className="relative z-10 flex h-[92vh] w-[95vw] max-w-[1400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl slide-up-in">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffce38] to-[#f5a623] shadow-sm">
              <MapPin className="size-5 text-[#061b2e]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#061b2e] sm:text-xl">
                {packageData.title}
              </h2>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c97710]">
                {packageData.tripType === "one-day" ? "One Day" : "Two Days"} Package
                <span className="mx-2 text-slate-300">·</span>
                <span className="text-slate-500 normal-case tracking-normal">
                  {selectedIds.length} of {packageData.maxStops} stops
                  {totalDistance > 0 && ` (${totalDistance} km)`}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Map Panel ────────────────────────────────────────── */}
          <div className="relative flex-1 bg-gradient-to-br from-ocean-50 via-[#f0f5f9] to-[#e8f0f6] p-3 sm:p-5 flex flex-col">
            {/* Header watermark */}
            <div className="z-10 mb-3 flex items-center justify-between shrink-0 select-none">
              <div>
                <p className="font-script text-2xl text-ocean-800/80 sm:text-3xl">Sri Lanka</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ocean-600/70">
                  Interactive GPS Tour Map
                </p>
              </div>
            </div>

            {/* Real Leaflet Map */}
            <div className="relative flex-1 w-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-md">
              <LeafletRouteMap
                allDestinations={allDestinations}
                selectedDestinations={selectedDestinations}
                onSelectDestination={addDestination}
                onRemoveDestination={removeDestination}
                isMandatory={isMandatory}
                atLimit={atLimit}
              />
            </div>
          </div>

          {/* ── Sidebar Panel ────────────────────────────────────── */}
          <div className="flex w-full flex-col border-l border-slate-200 bg-white lg:w-[380px] xl:w-[420px]">
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Current Route Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    Your Route
                  </h3>
                  <div className="flex items-center gap-2">
                    {totalDistance > 0 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                        ~{totalDistance} km
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                        atLimit
                          ? "bg-amber-100 text-amber-700"
                          : "bg-ocean-50 text-ocean-600",
                      )}
                    >
                      {selectedIds.length}/{packageData.maxStops} stops
                    </span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {selectedDestinations.map((dest, i) => {
                    const mandatory = isMandatory(dest.id);
                    return (
                      <li
                        key={dest.id}
                        className={cn(
                          "group/item flex items-center gap-3 rounded-xl border p-3 transition-all",
                          mandatory
                            ? "border-ocean-900/20 bg-ocean-50/50"
                            : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/30",
                        )}
                      >
                        {/* Number badge */}
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            mandatory
                              ? "bg-ocean-900 text-white"
                              : "bg-gradient-to-br from-[#ffce38] to-[#f5a623] text-[#061b2e]",
                          )}
                        >
                          {i + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-semibold text-[#061b2e]">
                              {dest.name}
                            </p>
                            {mandatory && (
                              <Lock className="size-3 shrink-0 text-ocean-600" />
                            )}
                          </div>
                          <p className="truncate text-[11px] text-slate-500">
                            {dest.description}
                          </p>
                        </div>

                        {/* Remove button */}
                        {!mandatory && (
                          <button
                            type="button"
                            onClick={() => removeDestination(dest.id)}
                            className="flex size-7 shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover/item:opacity-100"
                            aria-label={`Remove ${dest.name}`}
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Divider */}
              {availableToAdd.length > 0 && (
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Add Destinations
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
              )}

              {/* Available Destinations by Region */}
              {groupedAvailable.map(({ region, destinations }) => (
                <div key={region} className="mb-3">
                  <button
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block size-2 rounded-full bg-ocean-300" />
                      {region}
                      <span className="font-normal text-slate-400">
                        ({destinations.length})
                      </span>
                    </span>
                    {expandedRegions[region] ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>

                  {expandedRegions[region] && (
                    <ul className="mt-1 space-y-1.5 pl-1">
                      {destinations.map((dest) => (
                        <li key={dest.id}>
                          <button
                            type="button"
                            onClick={() => addDestination(dest.id)}
                            disabled={atLimit}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-all",
                              atLimit
                                ? "cursor-not-allowed border-slate-200 opacity-50"
                                : "border-slate-300 hover:border-amber-400 hover:bg-amber-50/40",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                atLimit
                                  ? "border-slate-300 text-slate-300"
                                  : "border-amber-400 text-amber-500",
                              )}
                            >
                              <Plus className="size-3.5 stroke-[2.5]" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#061b2e]">
                                {dest.name}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {dest.description}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Empty state */}
              {availableToAdd.length === 0 && !atLimit && (
                <p className="mt-2 text-center text-xs text-slate-400">
                  All available destinations are in your route.
                </p>
              )}
              {atLimit && availableToAdd.length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-amber-700">
                    Maximum {packageData.maxStops} stops reached
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-600">
                    Remove a stop above to add a different one
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer ───────────────────────────────────────── */}
            <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6">
              {/* Price */}
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-xs font-medium text-slate-500">From</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#061b2e]">
                    ${packageData.price}
                  </span>
                  <span className="ml-1 text-xs font-medium text-slate-500">
                    / per person
                  </span>
                </div>
              </div>
              <p className="mb-4 text-[10px] text-slate-400 leading-relaxed">
                Changing stops does not change the price. Final price confirmed by our team.
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetRoute}
                  className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-400 hover:bg-slate-50"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={proceedToBooking}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffce38] via-[#ffc107] to-[#f5a623] px-5 py-2.5 text-sm font-extrabold text-[#061b2e] shadow-[0_4px_14px_rgba(245,166,35,0.4)] transition-all hover:shadow-[0_6px_20px_rgba(245,166,35,0.5)] hover:-translate-y-0.5"
                >
                  <Plane className="size-4" />
                  Proceed to Booking
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
