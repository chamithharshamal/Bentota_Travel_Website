import { z } from "zod";
import { BOOKING_STATUSES, ROLES, TRIP_TYPES } from "./types";

const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);
const slug = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers and hyphens.");
const mediaId = z.string().trim().min(1).max(128);
const money = z.number().min(0, "Price cannot be negative.").max(10_000_000);
const lines = z.array(text(300)).max(40);

export const tripTypeSchema = z.enum(TRIP_TYPES as [string, ...string[]], { error: "Choose one-day or two-day as the trip length." });

/* ─────────────── Public booking ─────────────── */

export const bookingInputSchema = z.object({
  tripType: tripTypeSchema,
  routeId: requiredText(128, "Route"),
  destinationIds: z.array(z.string().min(1).max(128)).min(1, "Select at least one destination.").max(30),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
  traveler: z.object({
    name: requiredText(120, "Name"),
    nationalityCode: z.string().length(2, "Choose your nationality."),
    email: z.email("Enter a valid email address.").max(160),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone or WhatsApp number.")
      .max(24)
      .regex(/^[+\d][\d\s()-]+$/, "Enter a valid phone or WhatsApp number."),
  }),
  pax: z.object({
    adults: z.number().int().min(1).max(50),
    children: z.number().int().min(0).max(50),
    infants: z.number().int().min(0).max(20),
    singleRooms: z.number().int().min(0).max(50),
  }),
  pickupPoint: requiredText(200, "Pickup point"),
  notes: text(1000).default(""),
  consent: z.literal(true, "Please accept the privacy notice to send your request."),
  turnstileToken: z.string().max(4096).optional(),
});
export type BookingInput = z.infer<typeof bookingInputSchema>;

/* ─────────────── Admin: content ─────────────── */

export const destinationSchema = z.object({
  name: requiredText(120, "Name"),
  slug,
  region: text(80).default(""),
  shortDescription: text(240).default(""),
  description: text(5000).default(""),
  coverMediaId: mediaId.nullable().default(null),
  galleryMediaIds: z.array(mediaId).max(40).default([]),
  videoMediaId: mediaId.nullable().default(null),
  status: z.enum(["published", "draft"]),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const routeSchema = z
  .object({
    name: requiredText(120, "Name"),
    slug,
    tripType: tripTypeSchema,
    summary: text(400).default(""),
    duration: text(80).default(""),
    stops: z
      .array(
        z.object({
          destinationId: mediaId,
          day: z.union([z.literal(1), z.literal(2)]),
          mandatory: z.boolean(),
        }),
      )
      .min(1, "Add at least one destination to the route.")
      .max(30),
    maxSelectable: z.number().int().min(1).max(30),
    pickupPoints: lines.min(1, "Add at least one pickup point."),
    pricing: z
      .object({
        foreignAdult: money,
        foreignChild: money,
        foreignSingleSupplement: money,
        localAdult: money,
        localChild: money,
        localSingleSupplement: money,
        minPax: z.number().int().min(1).max(50),
        maxPax: z.number().int().min(1).max(100),
      })
      .refine((p) => p.maxPax >= p.minPax, "Maximum travelers must be at least the minimum."),
    coverMediaId: mediaId.nullable().default(null),
    status: z.enum(["active", "disabled"]),
    sortOrder: z.number().int().min(0).max(9999).default(0),
  })
  .superRefine((r, ctx) => {
    const ids = r.stops.map((s) => s.destinationId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", message: "A destination can only appear once in a route.", path: ["stops"] });
    }
    const mandatory = r.stops.filter((s) => s.mandatory).length;
    if (r.maxSelectable < Math.max(1, mandatory)) {
      ctx.addIssue({
        code: "custom",
        message: "Maximum selectable destinations must include all mandatory stops.",
        path: ["maxSelectable"],
      });
    }
    if (r.maxSelectable > r.stops.length) {
      ctx.addIssue({
        code: "custom",
        message: "Maximum selectable destinations cannot be more than the stops on the route.",
        path: ["maxSelectable"],
      });
    }
    if (r.tripType === "one-day" && r.stops.some((s) => s.day !== 1)) {
      ctx.addIssue({ code: "custom", message: "One-day routes can only have Day 1 stops.", path: ["stops"] });
    }
  });

export const packageSchema = z.object({
  title: requiredText(140, "Title"),
  slug,
  tripType: tripTypeSchema,
  summary: text(400).default(""),
  description: text(6000).default(""),
  highlights: lines.default([]),
  inclusions: lines.default([]),
  exclusions: lines.default([]),
  routeIds: z.array(mediaId).min(1, "Link at least one route to the package.").max(20),
  coverMediaId: mediaId.nullable().default(null),
  galleryMediaIds: z.array(mediaId).max(40).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["published", "draft"]),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const settingsSchema = z.object({
  businessName: requiredText(120, "Business name"),
  tagline: text(200).default(""),
  contactEmail: z.union([z.email("Enter a valid contact email."), z.literal("")]).default(""),
  contactPhone: text(30).default(""),
  whatsappNumber: text(30).default(""),
  address: text(300).default(""),
  childPolicy: z
    .object({
      infantMaxAge: z.number().int().min(0).max(5),
      childMaxAge: z.number().int().min(1).max(17),
    })
    .refine((c) => c.childMaxAge > c.infantMaxAge, "Child age limit must be above the infant age limit."),
  bookingMinDaysAhead: z.number().int().min(0).max(30),
  heroMediaId: mediaId.nullable().default(null),
  heroVideoMediaId: mediaId.nullable().default(null),
  galleryMediaIds: z.array(mediaId).max(100).default([]),
  adminSmsNumbers: z.array(text(24)).max(10).default([]),
});

/* ─────────────── Admin: bookings, media, users ─────────────── */

export const bookingUpdateSchema = z
  .object({
    status: z.enum(BOOKING_STATUSES as [string, ...string[]]).optional(),
    note: text(2000).optional(),
    markSeen: z.boolean().optional(),
  })
  .refine((v) => v.status || v.note || v.markSeen, "Nothing to update.");

export const mediaCreateSchema = z.object({
  publicId: requiredText(300, "Public ID"),
  resourceType: z.enum(["image", "video"]),
  originalFilename: text(300).default(""),
  duration: z.number().min(0).nullable().optional(),
});

export const mediaUpdateSchema = z.object({
  altText: text(200).optional(),
  caption: text(500).optional(),
  tags: z.array(text(40)).max(20).optional(),
  status: z.enum(["ready", "archived"]).optional(),
  replaceWith: mediaCreateSchema.optional(),
});

export const notificationReadSchema = z.object({
  ids: z.array(z.string().min(1).max(128)).max(200).optional(),
  all: z.boolean().optional(),
});

export const staffCreateSchema = z.object({
  email: z.email("Enter a valid email."),
  displayName: text(80).default(""),
  password: z.string().min(8, "Temporary password must be at least 8 characters.").max(128),
  role: z.enum(ROLES as [string, ...string[]]),
});

export const staffUpdateSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(ROLES as [string, ...string[]]).nullable().optional(),
  disabled: z.boolean().optional(),
});

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? "Invalid input.";
}
