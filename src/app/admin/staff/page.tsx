"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireRole } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/admin/auth-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Alert, Badge, Card, PageHeader, Spinner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { ROLES, type Role, type StaffUser } from "@/lib/types";

const ROLE_INFO: Record<Role, { label: string; description: string }> = {
  admin: { label: "Admin", description: "Everything, including staff accounts" },
  editor: { label: "Content editor", description: "Routes, destinations, packages, media and settings" },
  agent: { label: "Booking agent", description: "Bookings and notifications only" },
};

export default function StaffPage() {
  return (
    <RequireRole roles={["admin"]}>
      <Staff />
    </RequireRole>
  );
}

function Staff() {
  const { user } = useAuth();
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ users: StaffUser[] }>("/api/admin/users");
      setUsers(res.users);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(uid: string, body: { role?: Role | null; disabled?: boolean }) {
    setError(null);
    try {
      await apiFetch("/api/admin/users", { method: "PATCH", body: { uid, ...body } });
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Staff accounts"
        description="Changing a role or disabling an account signs that person out everywhere."
        actions={<Button variant="dark" onClick={() => setAdding(true)}>Add staff member</Button>}
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r} className="rounded-lg bg-white p-4 text-sm ring-1 ring-ocean-900/10">
            <p className="font-semibold">{ROLE_INFO[r].label}</p>
            <p className="text-ocean-950/65">{ROLE_INFO[r].description}</p>
          </div>
        ))}
      </div>
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {!users ? (
        <Spinner />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ocean-900/10 text-xs text-ocean-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Last sign-in</th>
                <th className="px-4 py-3 font-medium">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-900/5">
              {users.map((u) => {
                const self = u.uid === user?.uid;
                return (
                  <tr key={u.uid}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.displayName || u.email}</p>
                      {u.displayName && <p className="text-xs text-ocean-950/60">{u.email}</p>}
                      {self && <Badge tone="ocean" className="mt-1">You</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        aria-label={`Role for ${u.email}`}
                        value={u.role ?? ""}
                        disabled={self}
                        onChange={(e) => update(u.uid, { role: (e.target.value || null) as Role | null })}
                        className="h-8 w-44"
                      >
                        <option value="">No access</option>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_INFO[r].label}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-ocean-950/60">{u.lastSignIn ? new Date(u.lastSignIn).toLocaleString("en-GB") : "Never"}</td>
                    <td className="px-4 py-3">
                      {self ? (
                        <Badge tone="palm">Active</Badge>
                      ) : (
                        <Button variant={u.disabled ? "outline" : "ghost"} size="sm" onClick={() => update(u.uid, { disabled: !u.disabled })}>
                          {u.disabled ? "Enable account" : "Disable account"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {adding && <AddStaff onClose={() => setAdding(false)} onAdded={load} />}
    </>
  );
}

function AddStaff({ onClose, onAdded }: { onClose: () => void; onAdded: () => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("agent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/admin/users", { method: "POST", body: { email: email.trim(), displayName: displayName.trim(), password, role } });
      await onAdded();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add staff member"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="dark" onClick={submit} disabled={busy}>{busy ? "Adding…" : "Add staff member"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Email" htmlFor="s-email"><Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Name" htmlFor="s-name"><Input id="s-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field>
        <Field label="Temporary password" htmlFor="s-pass" hint="At least 8 characters. Ask them to change it using Reset password on the sign-in page.">
          <Input id="s-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Role" htmlFor="s-role">
          <Select id="s-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_INFO[r].label}: {ROLE_INFO[r].description}</option>
            ))}
          </Select>
        </Field>
        {error && <Alert>{error}</Alert>}
      </div>
    </Modal>
  );
}
