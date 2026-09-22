import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { firstIssue } from "../validation";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: firstIssue(error) }, { status: 400 });
  }
  console.error("[api] unexpected error", error);
  const message =
    error instanceof Error && error.message.includes("not configured")
      ? error.message
      : "Something went wrong on the server. Try again, and check the server logs if it keeps happening.";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "The request body must be valid JSON.");
  }
  return schema.parse(body);
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
