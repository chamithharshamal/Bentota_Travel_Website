"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { clientAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import type { Role } from "@/lib/types";

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(clientAuth());
  }, []);

  const refreshRole = useCallback(async () => {
    const u = clientAuth().currentUser;
    if (!u) return;
    const token = await u.getIdTokenResult(true);
    setRole((token.claims.role as Role | undefined) ?? null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, configured: isFirebaseClientConfigured, signOut, refreshRole }}>
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
