export type TripType = "one-day" | "two-day";
export type PublishStatus = "published" | "draft";
export type RouteStatus = "active" | "disabled";
export type BookingStatus = "new" | "contacted" | "confirmed" | "completed" | "cancelled";
export type Role = "admin" | "editor" | "agent";
export type PriceTier = "foreign" | "local";
export type Currency = "USD" | "LKR";
export type MediaType = "image" | "video";
export type StreamingState = "none" | "pending" | "ready" | "failed";

export const TRIP_TYPES: TripType[] = ["one-day", "two-day"];
export const BOOKING_STATUSES: BookingStatus[] = ["new", "contacted", "confirmed", "completed", "cancelled"];
export const ROLES: Role[] = ["admin", "editor", "agent"];

export interface MediaAsset {
  id: string;
  type: MediaType;
  publicId: string;
  version: number;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number;
  duration: number | null;
  originalFilename: string;
  altText: string;
  caption: string;
  tags: string[];
  /** Paths of documents using this asset, e.g. "destinations/abc123" */
  usedBy: string[];
  status: "ready" | "archived";
  streaming: StreamingState;
  uploadedBy: string;
  createdAt: number;
  updatedAt: number;
}

/** The subset of a media asset needed to render it on the public site. */
export interface MediaLite {
  id: string;
  type: MediaType;
  publicId: string;
  version: number;
  width: number | null;
  height: number | null;
  altText: string;
  streaming: StreamingState;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  shortDescription: string;
  description: string;
  coverMediaId: string | null;
  galleryMediaIds: string[];
  videoMediaId: string | null;
  status: PublishStatus;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface RouteStop {
  destinationId: string;
  day: 1 | 2;
  mandatory: boolean;
}

/**
 * Per-person pricing.
 * foreign = non-Sri Lankan nationals (USD), local = Sri Lankan nationals (LKR).
 * Children (see settings.childPolicy) pay the child rate; infants travel free.
 * Single supplement applies to two-day routes only (per person needing a single room).
 */
export interface RoutePricing {
  foreignAdult: number;
  foreignChild: number;
  foreignSingleSupplement: number;
  localAdult: number;
  localChild: number;
  localSingleSupplement: number;
  minPax: number;
  maxPax: number;
}

export interface TourRoute {
  id: string;
  name: string;
  slug: string;
  tripType: TripType;
  summary: string;
  duration: string;
  /** Ordered list of stops. Array order = route sequence. */
  stops: RouteStop[];
  /** Denormalised for querying which routes use a destination. */
  destinationIds: string[];
  maxSelectable: number;
  pickupPoints: string[];
  pricing: RoutePricing;
  coverMediaId: string | null;
  status: RouteStatus;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  tripType: TripType;
  summary: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  routeIds: string[];
  coverMediaId: string | null;
  galleryMediaIds: string[];
  featured: boolean;
  status: PublishStatus;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface BookingPax {
  adults: number;
  children: number;
  infants: number;
  singleRooms: number;
}

export interface BookingPrice {
  tier: PriceTier;
  currency: Currency;
  adultRate: number;
  childRate: number;
  singleSupplementRate: number;
  estimatedTotal: number;
}

export interface InternalNote {
  text: string;
  by: string;
  byEmail: string;
  at: number;
}

export interface StatusChange {
  status: BookingStatus;
  by: string;
  byEmail: string;
  at: number;
}

export interface Booking {
  id: string;
  ref: string;
  status: BookingStatus;
  tripType: TripType;
  route: { id: string; name: string; slug: string };
  destinations: { id: string; name: string; day: 1 | 2; mandatory: boolean }[];
  date: string;
  traveler: {
    name: string;
    nationalityCode: string;
    nationality: string;
    email: string;
    phone: string;
  };
  pax: BookingPax;
  pickupPoint: string;
  notes: string;
  isForeign: boolean;
  price: BookingPrice;
  seenBy: string[];
  firstSeenAt: number | null;
  internalNotes: InternalNote[];
  statusHistory: StatusChange[];
  consentAt: number;
  source: "website";
  createdAt: number;
  updatedAt: number;
}

export interface NotificationItem {
  id: string;
  type: "new_booking";
  channel: "dashboard" | "sms";
  bookingId: string;
  bookingRef: string;
  isForeign: boolean;
  title: string;
  message: string;
  readBy: string[];
  delivery: { status: "delivered" | "sent" | "failed" | "skipped"; detail: string };
  createdAt: number;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  childPolicy: { infantMaxAge: number; childMaxAge: number };
  bookingMinDaysAhead: number;
  heroMediaId: string | null;
  heroVideoMediaId: string | null;
  galleryMediaIds: string[];
  adminSmsNumbers: string[];
  updatedAt: number;
}

export interface StaffUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role | null;
  disabled: boolean;
  lastSignIn: string | null;
}
