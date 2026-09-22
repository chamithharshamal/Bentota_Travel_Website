"use client";

import { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { LogoMark } from "@/components/site/logo";
import { clientAuth } from "@/lib/firebase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(clientAuth(), email.trim(), password);
    } catch {
      setError("The email or password is incorrect.");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
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
      <form onSubmit={signIn} className="w-full max-w-sm rounded-2xl bg-white p-8">
        <div className="flex items-center gap-2 text-ocean-900">
          <LogoMark />
          <span className="font-display font-bold">Bentota Smart Journeys</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold">Sign in to the admin panel</h1>
        <div className="mt-6 space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
        </div>
        {error && <div className="mt-4"><Alert>{error}</Alert></div>}
        {notice && <div className="mt-4"><Alert tone="palm">{notice}</Alert></div>}
        <Button type="submit" variant="dark" size="lg" className="mt-6 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <button type="button" onClick={reset} className="mt-4 text-sm font-medium text-ocean-600 hover:underline">
          Reset password
        </button>
      </form>
    </div>
  );
}
