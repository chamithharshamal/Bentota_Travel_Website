import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { cld } from "@/lib/server/cloudinary";
import { revalidateSite } from "@/lib/server/crud";

interface CloudinaryNotification {
  notification_type?: string;
  public_id?: string;
  eager?: Array<{ status?: string; reason?: string }>;
  status?: string;
}

/** Receives Cloudinary notifications when adaptive-streaming renditions finish. */
export async function POST(req: Request) {
  const body = await req.text();
  const timestamp = Number(req.headers.get("x-cld-timestamp"));
  const signature = req.headers.get("x-cld-signature") ?? "";

  try {
    if (!timestamp || !cld().utils.verifyNotificationSignature(body, timestamp, signature, 7200)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let payload: CloudinaryNotification;
  try {
    payload = JSON.parse(body) as CloudinaryNotification;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.notification_type === "eager" && payload.public_id) {
    const snap = await adminDb().collection("media").where("publicId", "==", payload.public_id).limit(1).get();
    if (!snap.empty) {
      const failed = payload.status === "failed" || payload.eager?.some((e) => e.status === "failed");
      await snap.docs[0]!.ref.update({ streaming: failed ? "failed" : "ready", updatedAt: Date.now() });
      if (!failed) revalidateSite();
    }
  }

  return NextResponse.json({ received: true });
}
