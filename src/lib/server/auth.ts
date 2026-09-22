import "server-only";
import type { Role } from "../types";
import { adminAuth } from "../firebase/admin";
import { HttpError } from "./http";

export const ALL_STAFF: Role[] = ["admin", "editor", "agent"];
export const CONTENT_ROLES: Role[] = ["admin", "editor"];
export const BOOKING_ROLES: Role[] = ["admin", "agent"];
export const ADMIN_ONLY: Role[] = ["admin"];

export interface StaffContext {
  uid: string;
  email: string;
  role: Role;
}

/** Verifies the Firebase ID token in the Authorization header and checks the role claim. */
export async function requireStaff(req: Request, allowed: Role[]): Promise<StaffContext> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Sign in to continue.");

  let decoded;
  try {
    // checkRevoked = true so disabled users and role changes take effect immediately.
    decoded = await adminAuth().verifyIdToken(token, true);
  } catch {
    throw new HttpError(401, "Your session has expired. Sign in again.");
  }

  const role = decoded.role as Role | undefined;
  if (!role || !allowed.includes(role)) {
    throw new HttpError(403, "Your account does not have permission for this action.");
  }
  return { uid: decoded.uid, email: decoded.email ?? "", role };
}
