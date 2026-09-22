import "server-only";
import { adminDb } from "../firebase/admin";
import type { StaffContext } from "./auth";

export async function writeAudit(
  staff: StaffContext,
  action: string,
  collection: string,
  docId: string,
  summary: string,
) {
  try {
    await adminDb().collection("auditLogs").add({
      action,
      collection,
      docId,
      summary,
      by: staff.uid,
      byEmail: staff.email,
      role: staff.role,
      at: Date.now(),
    });
  } catch (error) {
    console.error("[audit] failed to write audit log", error);
  }
}
