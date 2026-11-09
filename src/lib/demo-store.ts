"use client";

import {
  DEMO_BOOKINGS,
  DEMO_DESTINATIONS,
  DEMO_MEDIA,
  DEMO_NOTIFICATIONS,
  DEMO_PACKAGES,
  DEMO_ROUTES,
  DEMO_SETTINGS,
  DEMO_STAFF,
} from "./demo-data";
import { isFirebaseClientConfigured } from "./firebase/client";
import type { Role } from "./types";

const STORAGE_KEY = "bsj_admin_demo_store_v1";
const ROLE_KEY = "bsj_admin_demo_role";

interface StoreData {
  destinations: typeof DEMO_DESTINATIONS;
  routes: typeof DEMO_ROUTES;
  packages: typeof DEMO_PACKAGES;
  bookings: typeof DEMO_BOOKINGS;
  notifications: typeof DEMO_NOTIFICATIONS;
  settings: typeof DEMO_SETTINGS;
  staff: typeof DEMO_STAFF;
  media: typeof DEMO_MEDIA;
}

function getInitialStore(): StoreData {
  return {
    destinations: [...DEMO_DESTINATIONS],
    routes: [...DEMO_ROUTES],
    packages: [...DEMO_PACKAGES],
    bookings: [...DEMO_BOOKINGS],
    notifications: [...DEMO_NOTIFICATIONS],
    settings: { ...DEMO_SETTINGS },
    staff: [...DEMO_STAFF],
    media: [...DEMO_MEDIA],
  };
}

let memoryStore: StoreData = getInitialStore();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Demo store listener error", e);
    }
  });
}

function loadFromStorage(): StoreData {
  if (typeof window === "undefined") return memoryStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryStore;
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      destinations: parsed.destinations ?? memoryStore.destinations,
      routes: parsed.routes ?? memoryStore.routes,
      packages: parsed.packages ?? memoryStore.packages,
      bookings: parsed.bookings ?? memoryStore.bookings,
      notifications: parsed.notifications ?? memoryStore.notifications,
      settings: parsed.settings ?? memoryStore.settings,
      staff: parsed.staff ?? memoryStore.staff,
      media: parsed.media ?? memoryStore.media,
    };
  } catch {
    return memoryStore;
  }
}

function persist(data: StoreData) {
  memoryStore = data;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage full or disabled
    }
  }
  notify();
}

// Initialize on client load
if (typeof window !== "undefined") {
  memoryStore = loadFromStorage();
}

export function isDemoMode(): boolean {
  if (typeof window !== "undefined") {
    const override = new URLSearchParams(window.location.search).get("demo");
    if (override === "true") return true;
    if (override === "false") return false;
  }
  return !isFirebaseClientConfigured || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function getDemoCollection<T = unknown>(collection: string): T[] {
  const store = memoryStore;
  switch (collection) {
    case "destinations":
      return store.destinations as unknown as T[];
    case "routes":
      return store.routes as unknown as T[];
    case "packages":
      return store.packages as unknown as T[];
    case "bookings":
      return store.bookings as unknown as T[];
    case "notifications":
      return store.notifications as unknown as T[];
    case "media":
      return store.media as unknown as T[];
    case "staff":
    case "users":
      return store.staff as unknown as T[];
    default:
      return [];
  }
}

export function getDemoDoc<T = unknown>(collection: string, id: string): T | null {
  if (collection === "settings") {
    return memoryStore.settings as unknown as T;
  }
  const list = getDemoCollection<{ id?: string; uid?: string }>(collection);
  return (list.find((item) => (item.id ?? item.uid) === id) as unknown as T) ?? null;
}

export function saveDemoDoc<T extends Record<string, unknown>>(
  collection: string,
  id: string,
  doc: Partial<T>,
): T {
  const store = { ...memoryStore };
  const now = Date.now();

  if (collection === "settings") {
    store.settings = { ...store.settings, ...doc, updatedAt: now };
    persist(store);
    return store.settings as unknown as T;
  }

  type Item = { id?: string; uid?: string; createdAt?: number; updatedAt?: number } & Record<string, unknown>;
  const list = [...(getDemoCollection<Item>(collection) || [])];
  const idx = list.findIndex((item) => (item.id ?? item.uid) === id);

  let updatedItem: Item;
  if (idx >= 0) {
    updatedItem = { ...list[idx], ...doc, updatedAt: now };
    list[idx] = updatedItem;
  } else {
    updatedItem = {
      id,
      createdAt: now,
      updatedAt: now,
      ...doc,
    };
    list.unshift(updatedItem);
  }

  if (collection === "destinations") store.destinations = list as unknown as typeof DEMO_DESTINATIONS;
  else if (collection === "routes") store.routes = list as unknown as typeof DEMO_ROUTES;
  else if (collection === "packages") store.packages = list as unknown as typeof DEMO_PACKAGES;
  else if (collection === "bookings") store.bookings = list as unknown as typeof DEMO_BOOKINGS;
  else if (collection === "notifications") store.notifications = list as unknown as typeof DEMO_NOTIFICATIONS;
  else if (collection === "media") store.media = list as unknown as typeof DEMO_MEDIA;
  else if (collection === "staff" || collection === "users") store.staff = list as unknown as typeof DEMO_STAFF;

  persist(store);
  return updatedItem as unknown as T;
}

export function deleteDemoDoc(collection: string, id: string): boolean {
  const store = { ...memoryStore };
  let changed = false;

  const filterOut = <Item extends { id?: string; uid?: string }>(items: Item[]) => {
    const filtered = items.filter((item) => (item.id ?? item.uid) !== id);
    if (filtered.length !== items.length) changed = true;
    return filtered;
  };

  if (collection === "destinations") store.destinations = filterOut(store.destinations);
  else if (collection === "routes") store.routes = filterOut(store.routes);
  else if (collection === "packages") store.packages = filterOut(store.packages);
  else if (collection === "bookings") store.bookings = filterOut(store.bookings);
  else if (collection === "notifications") store.notifications = filterOut(store.notifications);
  else if (collection === "media") store.media = filterOut(store.media);
  else if (collection === "staff" || collection === "users") store.staff = filterOut(store.staff);

  if (changed) persist(store);
  return changed;
}

export function subscribeDemoStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetDemoStore(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ROLE_KEY);
  }
  persist(getInitialStore());
}

export function getDemoRole(): Role {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(ROLE_KEY) as Role | null;
    if (stored && ["admin", "editor", "agent"].includes(stored)) return stored;
  }
  return "admin";
}

export function setDemoRole(role: Role): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ROLE_KEY, role);
  }
  notify();
}

