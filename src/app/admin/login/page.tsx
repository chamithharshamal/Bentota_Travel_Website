"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { LogoMark } from "@/components/site/logo";
import { clientAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { isDemoMode, setDemoRole } from "@/lib/demo-store";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const demo = isDemoMode();

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!isFirebaseClientConfigured) {
        setDemoRole("admin");
        window.location.href = "/admin";
        return;
      }
      await signInWithEmailAndPassword(clientAuth(), email.trim(), password);
    } catch {
      setError("The email or password is incorrect.");
    } finally {
      setBusy(false);
    }
  }

  function enterDemo(role: Role) {
    setDemoRole(role);
    window.location.href = "/admin";
  }

  async function reset() {
    if (!isFirebaseClientConfigured) {
      setNotice("Password reset is disabled in demo mode.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email first, then choose Reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(clientAuth(), email.trim());
      setNotice("If an account exists for this email, a reset link is on its way.");
      setError(null);
    } catch {
      setError("The reset email could not be sent. Check the address and try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ocean-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2 text-ocean-900">
          <LogoMark />
          <span className="font-display font-bold">Bentota Smart Journeys</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold">Sign in to the admin panel</h1>

        {demo && (
          <div className="mt-4 rounded-xl border border-sun-300 bg-sun-50 p-4 text-xs text-ocean-950">
            <p className="font-semibold text-sun-900">✨ Firebase not connected (Demo Mode)</p>
            <p className="mt-1 text-ocean-950/80">
              You can explore the admin portal immediately with full privileges:
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Button type="button" variant="dark" size="sm" onClick={() => enterDemo("admin")}>
                Continue as Admin
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => enterDemo("editor")}>
                  As Content Editor
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => enterDemo("agent")}>
                  As Booking Agent
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={signIn} className="mt-6">
          <div className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={demo ? "admin@bentotasmartjourneys.com" : ""}
                required={!demo}
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={demo ? "••••••••" : ""}
                required={!demo}
              />
            </Field>
          </div>
          {error && <div className="mt-4"><Alert>{error}</Alert></div>}
          {notice && <div className="mt-4"><Alert tone="palm">{notice}</Alert></div>}
          <Button type="submit" variant="dark" size="lg" className="mt-6 w-full" disabled={busy}>
            {busy ? "Signing in…" : demo ? "Enter Admin Panel" : "Sign in"}
          </Button>
          {!demo && (
            <button type="button" onClick={reset} className="mt-4 text-sm font-medium text-ocean-600 hover:underline">
              Reset password
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
