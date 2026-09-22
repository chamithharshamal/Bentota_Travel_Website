export interface MapDestination {
  id: string;
  name: string;
  region: string;
  description: string;
  /** Real Geographic Latitude */
  lat: number;
  /** Real Geographic Longitude */
  lng: number;
  /** SVG x-coordinate on a 500-wide viewBox */
  x: number;
  /** SVG y-coordinate on a 720-tall viewBox */
  y: number;
  labelAlign?: "left" | "right" | "top" | "bottom";
}

/**
 * All bookable destinations positioned on the map of Sri Lanka with real GPS coordinates.
 */
export const MAP_DESTINATIONS: MapDestination[] = [
  // ── Western Coast & Colombo ───────────────────────────────────────
  {
    id: "colombo",
    name: "Colombo",
    region: "Western Coast",
    description: "Vibrant capital city with colonial history and modern charm",
    lat: 6.9271,
    lng: 79.8612,
    x: 79,
    y: 511,
    labelAlign: "left",
  },

  // ── South Coast ───────────────────────────────────────────────────
  {
    id: "bentota",
    name: "Bentota",
    region: "South Coast",
    description: "Golden beaches and water sports on the south-west coast",
    lat: 6.4233,
    lng: 79.9972,
    x: 105,
    y: 591,
    labelAlign: "left",
  },
  {
    id: "hikkaduwa",
    name: "Hikkaduwa",
    region: "South Coast",
    description: "Coral reefs, surf breaks and a lively beach town",
    lat: 6.1390,
    lng: 80.1030,
    x: 125,
    y: 636,
    labelAlign: "left",
  },
  {
    id: "galle",
    name: "Galle",
    region: "South Coast",
    description: "UNESCO fort, cobblestone streets and ocean-side cafés",
    lat: 6.0535,
    lng: 80.2210,
    x: 147,
    y: 650,
    labelAlign: "left",
  },
  {
    id: "unawatuna",
    name: "Unawatuna",
    region: "South Coast",
    description: "Sheltered crescent bay with calm turquoise water",
    lat: 6.0125,
    lng: 80.2492,
    x: 158,
    y: 662,
    labelAlign: "bottom",
  },
  {
    id: "mirissa",
    name: "Mirissa",
    region: "South Coast",
    description: "Whale watching, palm-fringed bay and famous sunsets",
    lat: 5.9483,
    lng: 80.4550,
    x: 190,
    y: 666,
    labelAlign: "bottom",
  },
  {
    id: "matara",
    name: "Matara",
    region: "South Coast",
    description: "Southern tip temples and dramatic coastal cliffs",
    lat: 5.9496,
    lng: 80.5460,
    x: 212,
    y: 666,
    labelAlign: "right",
  },

  // ── Hill Country ──────────────────────────────────────────────────
  {
    id: "kandy",
    name: "Kandy",
    region: "Hill Country",
    description: "Temple of the Tooth, misty lake and royal heritage",
    lat: 7.2906,
    lng: 80.6337,
    x: 223,
    y: 453,
    labelAlign: "right",
  },
  {
    id: "nuwara-eliya",
    name: "Nuwara Eliya",
    region: "Hill Country",
    description: "Tea plantations, cool climate and colonial hill station",
    lat: 6.9708,
    lng: 80.7829,
    x: 251,
    y: 503,
    labelAlign: "right",
  },
  {
    id: "ella",
    name: "Ella",
    region: "Hill Country",
    description: "Nine Arches Bridge, Little Adam's Peak and epic train ride",
    lat: 6.8667,
    lng: 81.0466,
    x: 301,
    y: 520,
    labelAlign: "right",
  },
  {
    id: "haputale",
    name: "Haputale",
    region: "Hill Country",
    description: "Cliff-edge views, Lipton's Seat and misty tea estates",
    lat: 6.7684,
    lng: 80.9635,
    x: 285,
    y: 536,
    labelAlign: "left",
  },

  // ── Cultural Triangle ─────────────────────────────────────────────
  {
    id: "sigiriya",
    name: "Sigiriya",
    region: "Cultural Triangle",
    description: "Lion Rock fortress rising from the jungle — a world wonder",
    lat: 7.9570,
    lng: 80.7603,
    x: 247,
    y: 347,
    labelAlign: "right",
  },
  {
    id: "dambulla",
    name: "Dambulla",
    region: "Cultural Triangle",
    description: "Ancient cave temples with stunning Buddha murals",
    lat: 7.8742,
    lng: 80.6511,
    x: 227,
    y: 360,
    labelAlign: "left",
  },
  {
    id: "polonnaruwa",
    name: "Polonnaruwa",
    region: "Cultural Triangle",
    description: "Medieval capital with exquisite stone carvings",
    lat: 7.9403,
    lng: 81.0188,
    x: 295,
    y: 350,
    labelAlign: "right",
  },
  {
    id: "anuradhapura",
    name: "Anuradhapura",
    region: "Cultural Triangle",
    description: "Sacred city with the world's oldest documented tree",
    lat: 8.3114,
    lng: 80.4037,
    x: 181,
    y: 291,
    labelAlign: "left",
  },

  // ── East & Wildlife ───────────────────────────────────────────────
  {
    id: "trincomalee",
    name: "Trincomalee",
    region: "East Coast",
    description: "Natural harbour, pristine beaches and hot springs",
    lat: 8.5874,
    lng: 81.2152,
    x: 332,
    y: 247,
    labelAlign: "right",
  },
  {
    id: "arugam-bay",
    name: "Arugam Bay",
    region: "East Coast",
    description: "World-class surf point break on the east coast",
    lat: 6.8417,
    lng: 81.8361,
    x: 448,
    y: 524,
    labelAlign: "right",
  },
  {
    id: "yala",
    name: "Yala",
    region: "Wildlife",
    description: "Leopard capital of the world — premier safari park",
    lat: 6.3713,
    lng: 81.4170,
    x: 370,
    y: 598,
    labelAlign: "right",
  },
  {
    id: "udawalawe",
    name: "Udawalawe",
    region: "Wildlife",
    description: "Wild elephant herds and open grassland safaris",
    lat: 6.4744,
    lng: 80.8894,
    x: 271,
    y: 582,
    labelAlign: "left",
  },
];

/** Regions in display order for sidebar grouping */
export const REGION_ORDER = [
  "South Coast",
  "Hill Country",
  "Cultural Triangle",
  "Western Coast",
  "East Coast",
  "Wildlife",
] as const;

/** Get a destination by its id */
export function getMapDestination(id: string) {
  return MAP_DESTINATIONS.find((d) => d.id === id);
}

/** Get all destinations in a region */
export function getDestinationsByRegion(region: string) {
  return MAP_DESTINATIONS.filter((d) => d.region === region);
}

/** Calculate Haversine distance in km between two GPS coordinates */
export function getHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/** Calculate total distance of a route in kilometers */
export function calculateTotalRouteDistance(destinations: MapDestination[]): number {
  if (destinations.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < destinations.length - 1; i++) {
    total += getHaversineDistance(
      destinations[i].lat,
      destinations[i].lng,
      destinations[i + 1].lat,
      destinations[i + 1].lng,
    );
  }
  return total;
}

/**
 * Smart Shortest Path Insertion:
 * Inserts a new destination at the position in the route sequence
 * that minimizes the total added travel distance.
 */
export function insertOptimalRouteStop(currentIds: string[], newId: string): string[] {
  if (currentIds.length === 0) return [newId];
  if (currentIds.length === 1) return [...currentIds, newId];

  const newDest = getMapDestination(newId);
  if (!newDest) return [...currentIds, newId];

  let bestIndex = currentIds.length;
  let minAddedDist = Infinity;

  // Test inserting newId at position k (from index 1 to currentIds.length)
  for (let k = 1; k <= currentIds.length; k++) {
    const prevDest = getMapDestination(currentIds[k - 1]);
    const nextDest = k < currentIds.length ? getMapDestination(currentIds[k]) : null;

    if (!prevDest) continue;

    let addedDist = 0;
    if (nextDest) {
      const currentSegment = getHaversineDistance(prevDest.lat, prevDest.lng, nextDest.lat, nextDest.lng);
      const newSegment1 = getHaversineDistance(prevDest.lat, prevDest.lng, newDest.lat, newDest.lng);
      const newSegment2 = getHaversineDistance(newDest.lat, newDest.lng, nextDest.lat, nextDest.lng);
      addedDist = newSegment1 + newSegment2 - currentSegment;
    } else {
      addedDist = getHaversineDistance(prevDest.lat, prevDest.lng, newDest.lat, newDest.lng);
    }

    if (addedDist < minAddedDist) {
      minAddedDist = addedDist;
      bestIndex = k;
    }
  }

  const updated = [...currentIds];
  updated.splice(bestIndex, 0, newId);
  return updated;
}
