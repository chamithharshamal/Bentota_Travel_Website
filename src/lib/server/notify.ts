import "server-only";
import { adminDb } from "../firebase/admin";
import type { Booking, NotificationItem } from "../types";
import { formatTripDate } from "../dates";
import { sendSms, isSmsEnabled } from "./sms";

/**
 * Records a dashboard notification for every new booking.
 * The admin dashboard listens to Firestore in real time, so this is what makes
 * the alert appear instantly. SMS is a future phase and stays off until enabled.
 */
export async function notifyNewBooking(booking: Booking) {
  const db = adminDb();
  const title = booking.isForeign
    ? `Priority: foreign traveler booking ${booking.ref}`
    : `New booking ${booking.ref}`;
  const message = `${booking.traveler.name} (${booking.traveler.nationality}) · ${booking.route.name} · ${formatTripDate(
    booking.date,
  )} · ${booking.pax.adults + booking.pax.children + booking.pax.infants} travelers`;

  const base: Omit<NotificationItem, "id" | "channel" | "delivery"> = {
    type: "new_booking",
    bookingId: booking.id,
    bookingRef: booking.ref,
    isForeign: booking.isForeign,
    title,
    message,
    readBy: [],
    createdAt: Date.now(),
  };

  await db.collection("notifications").add({
    ...base,
    channel: "dashboard",
    delivery: { status: "delivered", detail: "Shown on the admin dashboard" },
  });

  if (!isSmsEnabled()) return;

  const settings = await db.collection("settings").doc("site").get();
  const numbers = (settings.get("adminSmsNumbers") as string[] | undefined) ?? [];
  if (!numbers.length) return;

  const result = await sendSms(numbers, `${title}. ${message}`);
  await db.collection("notifications").add({
    ...base,
    readBy: [],
    channel: "sms",
    delivery: result,
  });
}
