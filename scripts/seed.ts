/**
 * Adds sample destinations, routes and packages so the site has content to show.
 *
 *   npm run seed
 *
 * Sample documents use fixed IDs (sample-*), so running the script again
 * overwrites only the sample content. Replace descriptions and prices with the
 * client's approved content before launch. Media is not seeded: upload images
 * in the admin panel and attach them.
 */
import { DEFAULT_EXCLUSIONS, DEFAULT_INCLUSIONS, DEFAULT_SETTINGS } from "../src/lib/defaults";
import type { Destination, RoutePricing, RouteStop, TourPackage, TourRoute, TripType } from "../src/lib/types";
import { db } from "./firebase-admin-script";

const now = Date.now();

type D = Pick<Destination, "name" | "region" | "shortDescription">;
const DESTINATIONS: Record<string, D> = {
  "bentota-river": { name: "Bentota River Safari", region: "Bentota", shortDescription: "A boat ride through mangroves, small islands and village life on the Bentota River." },
  "brief-garden": { name: "Brief Garden", region: "Bentota", shortDescription: "The landscaped garden and house of artist Bevis Bawa, a short drive inland from Bentota." },
  lunuganga: { name: "Lunuganga Estate", region: "Bentota", shortDescription: "Architect Geoffrey Bawa's country estate and garden overlooking Dedduwa Lake." },
  "kosgoda-turtles": { name: "Kosgoda Turtle Hatchery", region: "South Coast", shortDescription: "A conservation hatchery where sea turtle eggs are protected until release." },
  "madu-river": { name: "Madu River", region: "South Coast", shortDescription: "A wetland river with mangrove channels, cinnamon islands and birdlife." },
  "galle-fort": { name: "Galle Fort", region: "South Coast", shortDescription: "A walled old town with ramparts, a lighthouse, museums and cafés." },
  unawatuna: { name: "Unawatuna Beach", region: "South Coast", shortDescription: "A sheltered bay for swimming and a relaxed lunch by the sea." },
  koggala: { name: "Koggala Stilt Fishermen", region: "South Coast", shortDescription: "The traditional stilt fishing spots along the coast near Koggala." },
  mirissa: { name: "Mirissa", region: "South Coast", shortDescription: "A crescent beach town known for sunsets and seasonal whale watching." },
  yala: { name: "Yala National Park", region: "Deep South", shortDescription: "Jeep safari in Sri Lanka's best-known park for leopards, elephants and birds." },
  "kandy-temple": { name: "Temple of the Sacred Tooth Relic", region: "Hill Country", shortDescription: "The royal temple complex beside Kandy Lake." },
  peradeniya: { name: "Royal Botanical Gardens, Peradeniya", region: "Hill Country", shortDescription: "Large botanical gardens just outside Kandy." },
  "nuwara-eliya": { name: "Nuwara Eliya Tea Country", region: "Hill Country", shortDescription: "Cool hills, tea estates and a working tea factory visit." },
};

interface R {
  name: string;
  tripType: TripType;
  summary: string;
  duration: string;
  stops: Array<[string, 1 | 2, boolean]>;
  maxSelectable: number;
  pricing: Omit<RoutePricing, "minPax" | "maxPax">;
}

const ROUTES: Record<string, R> = {
  "bentota-river-and-gardens": {
    name: "Bentota River and Gardens",
    tripType: "one-day",
    summary: "An easy day close to Bentota: river safari, two famous gardens and the turtle hatchery.",
    duration: "8:00 AM – 4:00 PM",
    stops: [["kosgoda-turtles", 1, false], ["bentota-river", 1, true], ["brief-garden", 1, false], ["lunuganga", 1, false]],
    maxSelectable: 3,
    pricing: { foreignAdult: 55, foreignChild: 28, foreignSingleSupplement: 0, localAdult: 9500, localChild: 4800, localSingleSupplement: 0 },
  },
  "galle-and-the-south-coast": {
    name: "Galle and the South Coast",
    tripType: "one-day",
    summary: "Head south along the coast to Galle Fort, with stops for wetlands, beaches and stilt fishermen.",
    duration: "7:00 AM – 6:30 PM",
    stops: [["madu-river", 1, false], ["galle-fort", 1, true], ["unawatuna", 1, false], ["koggala", 1, false]],
    maxSelectable: 3,
    pricing: { foreignAdult: 70, foreignChild: 35, foreignSingleSupplement: 0, localAdult: 14000, localChild: 7000, localSingleSupplement: 0 },
  },
  "south-coast-and-yala-safari": {
    name: "South Coast and Yala Safari",
    tripType: "two-day",
    summary: "Travel the south coast on day one, stay overnight, then take an early jeep safari in Yala.",
    duration: "Day 1 from 7:00 AM · back by 7:00 PM on Day 2",
    stops: [["galle-fort", 1, false], ["koggala", 1, false], ["mirissa", 1, false], ["yala", 2, true]],
    maxSelectable: 3,
    pricing: { foreignAdult: 240, foreignChild: 150, foreignSingleSupplement: 45, localAdult: 48000, localChild: 30000, localSingleSupplement: 9000 },
  },
  "kandy-and-tea-country": {
    name: "Kandy and Tea Country",
    tripType: "two-day",
    summary: "Kandy's temple and gardens on day one, then up into the tea hills on day two.",
    duration: "Day 1 from 6:30 AM · back by 8:00 PM on Day 2",
    stops: [["peradeniya", 1, false], ["kandy-temple", 1, true], ["nuwara-eliya", 2, true]],
    maxSelectable: 3,
    pricing: { foreignAdult: 220, foreignChild: 130, foreignSingleSupplement: 40, localAdult: 45000, localChild: 26000, localSingleSupplement: 8000 },
  },
};

const PACKAGES: Record<string, { title: string; tripType: TripType; summary: string; highlights: string[]; routes: string[]; featured: boolean }> = {
  "bentota-day-tours": {
    title: "Day tours from Bentota",
    tripType: "one-day",
    summary: "Private day trips with hotel pickup. Choose the route and the stops that suit you.",
    highlights: ["Private air-conditioned vehicle", "Choose your own stops", "Child rates and free travel for infants"],
    routes: ["bentota-river-and-gardens", "galle-and-the-south-coast"],
    featured: true,
  },
  "two-day-journeys": {
    title: "Two-day journeys",
    tripType: "two-day",
    summary: "Go further with one night at a hotel on the route, including dinner and breakfast.",
    highlights: ["One night half board", "Wildlife or hill country", "Twin or double sharing rooms"],
    routes: ["south-coast-and-yala-safari", "kandy-and-tea-country"],
    featured: false,
  },
};

async function main() {
  const batch = db.batch();

  Object.entries(DESTINATIONS).forEach(([slug, d], i) => {
    const doc: Omit<Destination, "id"> = {
      ...d,
      slug,
      description: `${d.shortDescription}\n\nSample description. Replace with the client's approved text before launch.`,
      coverMediaId: null,
      galleryMediaIds: [],
      videoMediaId: null,
      status: "published",
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(db.collection("destinations").doc(`sample-${slug}`), doc);
  });

  Object.entries(ROUTES).forEach(([slug, r], i) => {
    const stops: RouteStop[] = r.stops.map(([dest, day, mandatory]) => ({ destinationId: `sample-${dest}`, day, mandatory }));
    const doc: Omit<TourRoute, "id"> = {
      name: r.name,
      slug,
      tripType: r.tripType,
      summary: r.summary,
      duration: r.duration,
      stops,
      destinationIds: stops.map((s) => s.destinationId),
      maxSelectable: r.maxSelectable,
      pickupPoints: ["Hotels in Bentota", "Hotels in Aluthgama and Beruwala", "Hotels in Induruwa and Kosgoda"],
      pricing: { ...r.pricing, minPax: 2, maxPax: 15 },
      coverMediaId: null,
      status: "active",
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(db.collection("routes").doc(`sample-${slug}`), doc);
  });

  Object.entries(PACKAGES).forEach(([slug, p], i) => {
    const doc: Omit<TourPackage, "id"> = {
      title: p.title,
      slug,
      tripType: p.tripType,
      summary: p.summary,
      description: "Sample package description. Replace with the client's approved text before launch.",
      highlights: p.highlights,
      inclusions: DEFAULT_INCLUSIONS[p.tripType],
      exclusions: DEFAULT_EXCLUSIONS[p.tripType],
      routeIds: p.routes.map((r) => `sample-${r}`),
      coverMediaId: null,
      galleryMediaIds: [],
      featured: p.featured,
      status: "published",
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(db.collection("packages").doc(`sample-${slug}`), doc);
  });

  const settingsRef = db.collection("settings").doc("site");
  if (!(await settingsRef.get()).exists) {
    batch.set(settingsRef, { ...DEFAULT_SETTINGS, updatedAt: now });
  }

  await batch.commit();
  console.log(
    `✔ Seeded ${Object.keys(DESTINATIONS).length} destinations, ${Object.keys(ROUTES).length} routes and ${Object.keys(PACKAGES).length} packages.`,
  );
  console.log("  Prices and descriptions are samples. Update them in the admin panel.");
}

void main();
