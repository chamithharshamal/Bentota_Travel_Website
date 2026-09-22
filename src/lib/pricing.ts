import type { BookingPax, BookingPrice, Currency, PriceTier, RoutePricing, TripType } from "./types";

export const LOCAL_NATIONALITY = "LK";

export const CURRENCY_FOR_TIER: Record<PriceTier, Currency> = {
  foreign: "USD",
  local: "LKR",
};

export function tierForNationality(code: string | null | undefined): PriceTier {
  return code === LOCAL_NATIONALITY ? "local" : "foreign";
}

export function ratesFor(pricing: RoutePricing, tier: PriceTier) {
  return tier === "local"
    ? { adult: pricing.localAdult, child: pricing.localChild, single: pricing.localSingleSupplement }
    : { adult: pricing.foreignAdult, child: pricing.foreignChild, single: pricing.foreignSingleSupplement };
}

/** Destinations do not change the price: the per-person rate is fixed per route. */
export function calculatePrice(
  pricing: RoutePricing,
  tier: PriceTier,
  pax: BookingPax,
  tripType: TripType,
): BookingPrice {
  const rates = ratesFor(pricing, tier);
  const singleRooms = tripType === "two-day" ? pax.singleRooms : 0;
  const total = pax.adults * rates.adult + pax.children * rates.child + singleRooms * rates.single;
  return {
    tier,
    currency: CURRENCY_FOR_TIER[tier],
    adultRate: rates.adult,
    childRate: rates.child,
    singleSupplementRate: tripType === "two-day" ? rates.single : 0,
    estimatedTotal: Math.round(total * 100) / 100,
  };
}

/** Returns an error message, or null when the traveler counts are valid. */
export function validatePax(pax: BookingPax, pricing: RoutePricing, tripType: TripType): string | null {
  const paying = pax.adults + pax.children;
  const everyone = paying + pax.infants;
  if (pax.adults < 1) return "At least one adult must travel.";
  if (paying < pricing.minPax) {
    return `This route needs at least ${pricing.minPax} paying travelers (adults and children).`;
  }
  if (everyone > pricing.maxPax) return `This route takes up to ${pricing.maxPax} travelers including infants.`;
  if (tripType === "two-day" && pax.singleRooms > paying) {
    return "Single rooms cannot be more than the number of paying travelers.";
  }
  return null;
}

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "LKR" ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Lowest adult rate for display, e.g. "from USD 65 per adult". */
export function fromPrice(pricing: RoutePricing, tier: PriceTier = "foreign") {
  const rates = ratesFor(pricing, tier);
  return { amount: rates.adult, currency: CURRENCY_FOR_TIER[tier] };
}
