import type { RoutePricing, SiteSettings, TripType } from "./types";

/**
 * Pricing and policy defaults based on common practice for Sri Lankan tour operators.
 * All of these can be changed from the admin panel.
 */
export const DEFAULT_SETTINGS: Omit<SiteSettings, "updatedAt"> = {
  businessName: "Bentota Smart Journeys",
  tagline: "Day trips and two-day journeys from Bentota",
  contactEmail: "",
  contactPhone: "",
  whatsappNumber: "",
  address: "Bentota, Sri Lanka",
  // Infants 0–4 travel free, children 5–11 pay the child rate, 12+ pay the adult rate.
  childPolicy: { infantMaxAge: 4, childMaxAge: 11 },
  // Bookings must be made at least one day before the trip date (Asia/Colombo time).
  bookingMinDaysAhead: 1,
  heroMediaId: null,
  heroVideoMediaId: null,
  galleryMediaIds: [],
  adminSmsNumbers: [],
};

export const DEFAULT_PRICING: RoutePricing = {
  foreignAdult: 0,
  foreignChild: 0,
  foreignSingleSupplement: 0,
  localAdult: 0,
  localChild: 0,
  localSingleSupplement: 0,
  // Private tours commonly require at least 2 paying travelers.
  minPax: 2,
  maxPax: 15,
};

/** Suggested child rate as a share of the adult rate. Used as a hint in the admin form. */
export const SUGGESTED_CHILD_RATE = 0.5;

export const DEFAULT_INCLUSIONS: Record<TripType, string[]> = {
  "one-day": [
    "Air-conditioned private vehicle with fuel",
    "English-speaking chauffeur guide",
    "Hotel pickup and drop-off in the Bentota area",
    "Bottled water",
    "All taxes and service charges",
  ],
  "two-day": [
    "Air-conditioned private vehicle with fuel",
    "English-speaking chauffeur guide",
    "Hotel pickup and drop-off in the Bentota area",
    "1 night accommodation on twin/double sharing basis",
    "Dinner and breakfast at the hotel (half board)",
    "Bottled water",
    "All taxes and service charges",
  ],
};

export const DEFAULT_EXCLUSIONS: Record<TripType, string[]> = {
  "one-day": [
    "Entrance fees to sites and parks",
    "Lunch and personal expenses",
    "Tips for guide and driver",
  ],
  "two-day": [
    "Entrance fees to sites and parks",
    "Lunches and personal expenses",
    "Single room supplement (charged per person)",
    "Tips for guide and driver",
  ],
};

export const TRIP_TYPE_LABEL: Record<TripType, string> = {
  "one-day": "One-day tour",
  "two-day": "Two-day tour",
};
