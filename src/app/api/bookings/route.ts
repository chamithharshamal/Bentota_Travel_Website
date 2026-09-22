import { NextResponse } from "next/server";
import type { Firestore } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { bookingInputSchema } from "@/lib/validation";
import { HttpError, clientIp, jsonError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { getSettings } from "@/lib/server/data";
import { notifyNewBooking } from "@/lib/server/notify";
import { countryName, isCountryCode } from "@/lib/countries";
import { addDays, colomboToday, formatTripDate, isValidYmd } from "@/lib/dates";
import { calculatePrice, tierForNationality, validatePax } from "@/lib/pricing";
import type { Booking, Destination, TourRoute } from "@/lib/types";
import { unique } from "@/lib/utils";

async function nextBookingRef(db: Firestore): Promise<string> {
  const year = Number(colomboToday().slice(0, 4));
  const counterRef = db.collection("counters").doc("bookings");
  const seq = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const data = snap.data() as { year?: number; seq?: number } | undefined;
    const next = data?.year === year ? (data.seq ?? 0) + 1 : 1;
    tx.set(counterRef, { year, seq: next });
    return next;
  });
  return `BSJ-${year}-${String(seq).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(`booking:${ip}`, 5, 10 * 60_000)) {
      throw new HttpError(429, "Too many booking requests from this connection. Wait a few minutes and try again.");
    }

    const input = await readJson(req, bookingInputSchema);
    if (!(await verifyTurnstile(input.turnstileToken, ip))) {
      throw new HttpError(400, "The security check did not pass. Refresh the page and try again.");
    }
    if (!isCountryCode(input.traveler.nationalityCode)) {
      throw new HttpError(400, "Choose your nationality from the list.");
    }

    const db = adminDb();
    const [routeSnap, settings] = await Promise.all([db.collection("routes").doc(input.routeId).get(), getSettings()]);
    if (!routeSnap.exists || routeSnap.get("status") !== "active") {
      throw new HttpError(400, "This route is no longer available. Choose another route.");
    }
    const route = { id: routeSnap.id, ...routeSnap.data() } as TourRoute;
    if (route.tripType !== input.tripType) {
      throw new HttpError(400, "The selected route does not match the trip length. Choose the route again.");
    }

    // Date rules (Asia/Colombo)
    if (!isValidYmd(input.date)) throw new HttpError(400, "Choose a valid trip date.");
    const today = colomboToday();
    const minDate = addDays(today, settings.bookingMinDaysAhead);
    if (input.date < minDate) throw new HttpError(400, `Choose a trip date on or after ${formatTripDate(minDate)}.`);
    if (input.date > addDays(today, 365)) throw new HttpError(400, "Trips can be booked up to one year ahead.");

    // Route → destination rules
    const stopSnaps = await db.getAll(...route.stops.map((s) => db.collection("destinations").doc(s.destinationId)));
    const published = new Map(
      stopSnaps
        .filter((s) => s.exists && s.get("status") === "published")
        .map((s) => [s.id, { id: s.id, ...s.data() } as Destination]),
    );
    const availableStops = route.stops.filter((s) => published.has(s.destinationId));
    const allowedIds = new Set(availableStops.map((s) => s.destinationId));
    const selected = unique(input.destinationIds);

    if (selected.some((id) => !allowedIds.has(id))) {
      throw new HttpError(400, "One or more selected destinations are not part of this route.");
    }
    const missingMandatory = availableStops.filter((s) => s.mandatory && !selected.includes(s.destinationId));
    if (missingMandatory.length) throw new HttpError(400, "Required stops for this route must stay selected.");
    const maxSelectable = Math.min(route.maxSelectable, availableStops.length);
    if (selected.length > maxSelectable) {
      throw new HttpError(400, `This route allows up to ${maxSelectable} destinations.`);
    }

    // Travelers and price (always calculated on the server)
    const pax = { ...input.pax, singleRooms: route.tripType === "two-day" ? input.pax.singleRooms : 0 };
    const paxError = validatePax(pax, route.pricing, route.tripType);
    if (paxError) throw new HttpError(400, paxError);

    const tier = tierForNationality(input.traveler.nationalityCode);
    const price = calculatePrice(route.pricing, tier, pax, route.tripType);

    const refCode = await nextBookingRef(db);
    const now = Date.now();
    const docRef = db.collection("bookings").doc();

    const booking: Booking = {
      id: docRef.id,
      ref: refCode,
      status: "new",
      tripType: route.tripType,
      route: { id: route.id, name: route.name, slug: route.slug },
      destinations: availableStops
        .filter((s) => selected.includes(s.destinationId))
        .map((s) => ({
          id: s.destinationId,
          name: published.get(s.destinationId)!.name,
          day: s.day,
          mandatory: s.mandatory,
        })),
      date: input.date,
      traveler: {
        name: input.traveler.name,
        nationalityCode: input.traveler.nationalityCode,
        nationality: countryName(input.traveler.nationalityCode),
        email: input.traveler.email.toLowerCase(),
        phone: input.traveler.phone,
      },
      pax,
      pickupPoint: input.pickupPoint,
      notes: input.notes,
      isForeign: tier === "foreign",
      price,
      seenBy: [],
      firstSeenAt: null,
      internalNotes: [],
      statusHistory: [{ status: "new", by: "website", byEmail: "", at: now }],
      consentAt: now,
      source: "website",
      createdAt: now,
      updatedAt: now,
    };

    const { id: _id, ...toStore } = booking;
    await docRef.set(toStore);

    try {
      await notifyNewBooking(booking);
    } catch (error) {
      // The booking is saved and visible on the dashboard even if notification logging fails.
      console.error("[bookings] notification failed", error);
    }

    return NextResponse.json({ ref: refCode }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
