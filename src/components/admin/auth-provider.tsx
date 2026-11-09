"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { clientAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getDemoRole, isDemoMode, setDemoRole as persistDemoRole, subscribeDemoStore } from "@/lib/demo-store";
import type { Role } from "@/lib/types";

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
  configured: boolean;
  isDemo: boolean;
  setDemoRole: (role: Role) => void;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [demoActive] = useState(() => isDemoMode());
  const [demoRole, setRoleState] = useState<Role>(() => getDemoRole());
  const [user, setUser] = useState<User | null>(() => {
    if (isDemoMode()) {
      return {
        uid: "demo-admin",
        email: "admin@bentotasmartjourneys.com",
        displayName: "Demo Administrator",
        getIdToken: async () => "demo-token",
        getIdTokenResult: async () => ({
          claims: { role: getDemoRole() },
          authTime: new Date().toISOString(),
          issuedAtTime: new Date().toISOString(),
          expirationTime: new Date(Date.now() + 3600000).toISOString(),
          signInProvider: "custom",
          signInSecondFactor: null,
          token: "demo-token",
        }),
      } as unknown as User;
    }
    return null;
  });
  const [role, setRole] = useState<Role | null>(() => (isDemoMode() ? getDemoRole() : null));
  const [loading, setLoading] = useState(() => !isDemoMode() && isFirebaseClientConfigured);

  useEffect(() => {
    if (demoActive) {
      return subscribeDemoStore(() => {
        const next = getDemoRole();
        setRoleState(next);
        setRole(next);
      });
    }

    if (!isFirebaseClientConfigured) {
      setLoading(false);
      return;
    }

    return onIdTokenChanged(clientAuth(), async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      const token = await u.getIdTokenResult();
      setUser(u);
      setRole((token.claims.role as Role | undefined) ?? null);
      setLoading(false);
    });
  }, [demoActive]);

  const setDemoRoleHandler = useCallback((newRole: Role) => {
    persistDemoRole(newRole);
    setRoleState(newRole);
    setRole(newRole);
  }, []);

  const signOut = useCallback(async () => {
    if (demoActive) {
      setUser(null);
      setRole(null);
      return;
    }
    await fbSignOut(clientAuth());
  }, [demoActive]);

  const refreshRole = useCallback(async () => {
    if (demoActive) {
      setRole(getDemoRole());
      return;
    }
    const u = clientAuth().currentUser;
    if (!u) return;
    const token = await u.getIdTokenResult(true);
    setRole((token.claims.role as Role | undefined) ?? null);
  }, [demoActive]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: demoActive ? demoRole : role,
        loading,
        configured: demoActive ? true : isFirebaseClientConfigured,
        isDemo: demoActive,
        setDemoRole: setDemoRoleHandler,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function canManageBookings(role: Role | null) {
  return role === "admin" || role === "agent";
}

export function canManageContent(role: Role | null) {
  return role === "admin" || role === "editor";
}
