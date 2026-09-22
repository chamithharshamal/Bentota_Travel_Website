import "server-only";

/**
 * SMS alerts — future phase.
 *
 * Set SMS_ENABLED=true and implement `sendSms` for the chosen Sri Lankan SMS
 * gateway. Keep the return shape so delivery results are logged in the
 * notifications history.
 */
export function isSmsEnabled(): boolean {
  return process.env.SMS_ENABLED === "true" && Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY);
}

export async function sendSms(
  to: string[],
  message: string,
): Promise<{ status: "sent" | "failed" | "skipped"; detail: string }> {
  if (!isSmsEnabled()) return { status: "skipped", detail: "SMS alerts are turned off" };

  // TODO: Replace with the gateway's real request format once a provider is chosen.
  try {
    const res = await fetch(process.env.SMS_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SMS_API_KEY}`,
      },
      body: JSON.stringify({ to, message: message.slice(0, 320), sender: process.env.SMS_SENDER_ID }),
    });
    if (!res.ok) return { status: "failed", detail: `Gateway responded with ${res.status}` };
    return { status: "sent", detail: `Sent to ${to.length} number(s)` };
  } catch (error) {
    return { status: "failed", detail: error instanceof Error ? error.message : "Unknown SMS error" };
  }
}
