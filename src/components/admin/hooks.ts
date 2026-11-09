"use client";

import { useEffect, useState, type DependencyList } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentReference,
  type Query,
} from "firebase/firestore";
import { clientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getDemoCollection, getDemoDoc, isDemoMode, subscribeDemoStore } from "@/lib/demo-store";
import type { Booking, Destination, MediaAsset, NotificationItem, TourPackage, TourRoute } from "@/lib/types";

export function useLiveQuery<T>(
  factory: () => Query | null,
  deps: DependencyList,
  collectionName?: string,
) {
  const [data, setData] = useState<T[]>(() => {
    if (isDemoMode() && collectionName) {
      return getDemoCollection<T>(collectionName);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => !isDemoMode() && isFirebaseClientConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      if (!collectionName) {
        setData([]);
        setLoading(false);
        return;
      }
      setData(getDemoCollection<T>(collectionName));
      setLoading(false);
      return subscribeDemoStore(() => {
        setData(getDemoCollection<T>(collectionName));
      });
    }

    if (!isFirebaseClientConfigured) {
      setData([]);
      setLoading(false);
      return;
    }

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
  }, [collectionName, ...deps]);

  return { data, loading, error };
}

export function useLiveDoc<T>(
  factory: () => DocumentReference | null,
  deps: DependencyList,
  demoDoc?: { collection: string; id: string },
) {
  const [data, setData] = useState<T | null>(() => {
    if (isDemoMode() && demoDoc) {
      return getDemoDoc<T>(demoDoc.collection, demoDoc.id);
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !isDemoMode() && isFirebaseClientConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      if (!demoDoc) {
        setData(null);
        setLoading(false);
        return;
      }
      setData(getDemoDoc<T>(demoDoc.collection, demoDoc.id));
      setLoading(false);
      return subscribeDemoStore(() => {
        setData(getDemoDoc<T>(demoDoc.collection, demoDoc.id));
      });
    }

    if (!isFirebaseClientConfigured) {
      setData(null);
      setLoading(false);
      return;
    }

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
  }, [demoDoc?.collection, demoDoc?.id, ...deps]);

  return { data, loading, error };
}

export function useMediaLibrary(enabled = true) {
  return useLiveQuery<MediaAsset>(
    () =>
      enabled && isFirebaseClientConfigured
        ? query(collection(clientDb(), "media"), orderBy("createdAt", "desc"))
        : null,
    [enabled],
    "media",
  );
}

export function useDestinations() {
  return useLiveQuery<Destination>(
    () => (isFirebaseClientConfigured ? query(collection(clientDb(), "destinations"), orderBy("name")) : null),
    [],
    "destinations",
  );
}

export function useRoutes() {
  return useLiveQuery<TourRoute>(
    () => (isFirebaseClientConfigured ? query(collection(clientDb(), "routes"), orderBy("name")) : null),
    [],
    "routes",
  );
}

export function usePackages() {
  return useLiveQuery<TourPackage>(
    () => (isFirebaseClientConfigured ? query(collection(clientDb(), "packages"), orderBy("title")) : null),
    [],
    "packages",
  );
}

export function useBookings(filter?: { status?: string; minDate?: string; limit?: number }) {
  const [data, setData] = useState<Booking[]>(() => {
    if (isDemoMode()) {
      const all = getDemoCollection<Booking>("bookings");
      return filterBookings(all, filter);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => !isDemoMode() && isFirebaseClientConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      const all = getDemoCollection<Booking>("bookings");
      setData(filterBookings(all, filter));
      setLoading(false);
      return subscribeDemoStore(() => {
        const fresh = getDemoCollection<Booking>("bookings");
        setData(filterBookings(fresh, filter));
      });
    }

    if (!isFirebaseClientConfigured) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      let q: Query = collection(clientDb(), "bookings");
      if (filter?.status) {
        q = query(q, where("status", "==", filter.status));
      }
      if (filter?.minDate) {
        q = query(q, where("date", ">=", filter.minDate), orderBy("date"));
      } else {
        q = query(q, orderBy("createdAt", "desc"));
      }
      if (filter?.limit) {
        q = query(q, orderBy("createdAt", "desc"));
      }

      setLoading(true);
      return onSnapshot(
        q,
        (snap) => {
          setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking));
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error querying bookings");
      setLoading(false);
    }
  }, [filter?.status, filter?.minDate, filter?.limit]);

  return { data, loading, error };
}

function filterBookings(list: Booking[], filter?: { status?: string; minDate?: string; limit?: number }): Booking[] {
  let res = [...list];
  if (filter?.status) {
    res = res.filter((b) => b.status === filter.status);
  }
  if (filter?.minDate) {
    res = res.filter((b) => b.date >= filter.minDate!).sort((a, b) => a.date.localeCompare(b.date));
  } else {
    res = res.sort((a, b) => b.createdAt - a.createdAt);
  }
  if (filter?.limit) {
    res = res.slice(0, filter.limit);
  }
  return res;
}

export function useNotifications(limitCount = 100) {
  const [data, setData] = useState<NotificationItem[]>(() => {
    if (isDemoMode()) {
      return getDemoCollection<NotificationItem>("notifications").slice(0, limitCount);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => !isDemoMode() && isFirebaseClientConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      setData(getDemoCollection<NotificationItem>("notifications").slice(0, limitCount));
      setLoading(false);
      return subscribeDemoStore(() => {
        setData(getDemoCollection<NotificationItem>("notifications").slice(0, limitCount));
      });
    }

    if (!isFirebaseClientConfigured) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(clientDb(), "notifications"), orderBy("createdAt", "desc"));
      setLoading(true);
      return onSnapshot(
        q,
        (snap) => {
          setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NotificationItem).slice(0, limitCount));
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error querying notifications");
      setLoading(false);
    }
  }, [limitCount]);

  return { data, loading, error };
}

export function docRef(path: string, id: string): DocumentReference {
  if (!isFirebaseClientConfigured) {
    return {
      id,
      path: `${path}/${id}`,
    } as unknown as DocumentReference;
  }
  return doc(clientDb(), path, id);
}
