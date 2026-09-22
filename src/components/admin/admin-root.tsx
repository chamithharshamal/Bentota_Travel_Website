"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { AdminShell } from "./admin-shell";
import { AuthProvider, useAuth } from "./auth-provider";

export function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { user, role, loading, configured, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) router.replace("/admin/login");
    if (user && role && isLogin) router.replace("/admin");
  }, [loading, user, role, isLogin, router]);

  if (!configured) {
    return (
      <Centered>
        <h1 className="text-2xl font-bold">Connect Firebase to use the admin panel</h1>
        <p className="mt-2 text-sm text-ocean-950/70">
          Add the NEXT_PUBLIC_FIREBASE_* values to <code>.env.local</code> and restart the dev server. The README lists every
          step.
        </p>
      </Centered>
    );
  }

  if (isLogin) return <>{children}</>;

  if (loading || !user) {
    return (
      <Centered>
        <Spinner label="Checking your session" />
      </Centered>
    );
  }

  if (!role) {
    return (
      <Centered>
        <h1 className="text-2xl font-bold">Your account has no admin role yet</h1>
        <p className="mt-2 text-sm text-ocean-950/70">
          Signed in as {user.email}. Ask an admin to give you access from Staff accounts, then sign in again.
        </p>
        <Button variant="outline" className="mt-5" onClick={() => signOut()}>
          Sign out
        </Button>
      </Centered>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surf px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 ring-1 ring-ocean-900/10">{children}</div>
    </div>
  );
}
