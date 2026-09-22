import { NextResponse } from "next/server";
import { CONTENT_ROLES, requireStaff } from "@/lib/server/auth";
import { HttpError, jsonError } from "@/lib/server/http";
import { BLOCKED_UPLOAD_PARAMS, cld } from "@/lib/server/cloudinary";
import { rateLimit } from "@/lib/server/rate-limit";

type SignParams = Parameters<ReturnType<typeof cld>["utils"]["api_sign_request"]>[0];

/** Signs upload widget requests. Only staff with content permissions can upload. */
export async function POST(req: Request) {
  try {
    const staff = await requireStaff(req, CONTENT_ROLES);
    if (!rateLimit(`sign:${staff.uid}`, 120, 60_000)) throw new HttpError(429, "Too many uploads at once. Wait a moment.");

    const body = (await req.json().catch(() => null)) as { paramsToSign?: Record<string, unknown> } | null;
    const params = body?.paramsToSign;
    if (!params || typeof params !== "object") throw new HttpError(400, "Missing upload parameters.");

    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!preset || params.upload_preset !== preset) {
      throw new HttpError(400, "Uploads must use the configured signed upload preset.");
    }
    const blocked = BLOCKED_UPLOAD_PARAMS.filter((key) => key in params);
    if (blocked.length) throw new HttpError(400, `These upload settings are not allowed: ${blocked.join(", ")}.`);

    const signature = cld().utils.api_sign_request(params as SignParams, process.env.CLOUDINARY_API_SECRET!);
    return NextResponse.json({ signature });
  } catch (error) {
    return jsonError(error);
  }
}
