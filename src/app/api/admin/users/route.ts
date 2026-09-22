import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { staffCreateSchema, staffUpdateSchema } from "@/lib/validation";
import { ADMIN_ONLY, requireStaff } from "@/lib/server/auth";
import { HttpError, jsonError, readJson } from "@/lib/server/http";
import { writeAudit } from "@/lib/server/audit";
import type { Role, StaffUser } from "@/lib/types";

export async function GET(req: Request) {
  try {
    await requireStaff(req, ADMIN_ONLY);
    const result = await adminAuth().listUsers(1000);
    const users: StaffUser[] = result.users.map((u) => ({
      uid: u.uid,
      email: u.email ?? "",
      displayName: u.displayName ?? "",
      role: ((u.customClaims?.role as Role | undefined) ?? null) as Role | null,
      disabled: u.disabled,
      lastSignIn: u.metadata.lastSignInTime ?? null,
    }));
    users.sort((a, b) => a.email.localeCompare(b.email));
    return NextResponse.json({ users });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const staff = await requireStaff(req, ADMIN_ONLY);
    const input = await readJson(req, staffCreateSchema);
    let user;
    try {
      user = await adminAuth().createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName || undefined,
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/email-already-exists") throw new HttpError(409, "An account with this email already exists.");
      throw error;
    }
    await adminAuth().setCustomUserClaims(user.uid, { role: input.role });
    await writeAudit(staff, "create", "users", user.uid, `Added ${input.email} as ${input.role}`);
    return NextResponse.json({ uid: user.uid }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const staff = await requireStaff(req, ADMIN_ONLY);
    const input = await readJson(req, staffUpdateSchema);
    if (input.uid === staff.uid && (input.role !== undefined || input.disabled)) {
      throw new HttpError(400, "You cannot change your own role or disable your own account.");
    }
    const auth = adminAuth();
    if (input.role !== undefined) {
      await auth.setCustomUserClaims(input.uid, input.role ? { role: input.role } : {});
    }
    if (input.disabled !== undefined) await auth.updateUser(input.uid, { disabled: input.disabled });
    // Sign the user out everywhere so the change applies immediately.
    await auth.revokeRefreshTokens(input.uid);
    await writeAudit(
      staff,
      "update",
      "users",
      input.uid,
      [input.role !== undefined && `role → ${input.role ?? "none"}`, input.disabled !== undefined && `disabled → ${input.disabled}`]
        .filter(Boolean)
        .join(", "),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
