"use client";

import { useEffect, useState, type DependencyList } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type DocumentReference,
  type Query,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import type { Destination, MediaAsset, TourPackage, TourRoute } from "@/lib/types";

export function useLiveQuery<T>(factory: () => Query | null, deps: DependencyList) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = factory();
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.code === "permission-denied" ? "Your account cannot view this data." : err.message);
        setLoading(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export function useLiveDoc<T>(factory: () => DocumentReference | null, deps: DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = factory();
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
        setLoading(false);
      },
      (err) => {
        setError(err.code === "permission-denied" ? "Your account cannot view this data." : err.message);
        setLoading(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export function useMediaLibrary(enabled = true) {
  return useLiveQuery<MediaAsset>(
    () => (enabled ? query(collection(clientDb(), "media"), orderBy("createdAt", "desc")) : null),
    [enabled],
  );
}

export function useDestinations() {
  return useLiveQuery<Destination>(() => query(collection(clientDb(), "destinations"), orderBy("name")), []);
}

export function useRoutes() {
  return useLiveQuery<TourRoute>(() => query(collection(clientDb(), "routes"), orderBy("name")), []);
}

export function usePackages() {
  return useLiveQuery<TourPackage>(() => query(collection(clientDb(), "packages"), orderBy("title")), []);
}

export function docRef(path: string, id: string) {
  return doc(clientDb(), path, id);
}
