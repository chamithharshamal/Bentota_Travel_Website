"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import {
  Bell,
  CalendarCheck,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Route as RouteIcon,
  Settings,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { clientDb } from "@/lib/firebase/client";
import type { Booking, NotificationItem, Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { canManageBookings, useAuth } from "./auth-provider";
import { getSoundPreference, playChime, setSoundPreference, showDesktopNotification } from "./alerts";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Bell;
  roles: Role[];
  badge?: "bookings" | "notifications";
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "editor", "agent"] },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, roles: ["admin", "agent"], badge: "bookings" },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, roles: ["admin", "agent"], badge: "notifications" },
  { href: "/admin/routes", label: "Routes", icon: RouteIcon, roles: ["admin", "editor"] },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin, roles: ["admin", "editor"] },
  { href: "/admin/packages", label: "Packages", icon: Package, roles: ["admin", "editor"] },
  { href: "/admin/media", label: "Media library", icon: Images, roles: ["admin", "editor"] },
  { href: "/admin/settings", label: "Website settings", icon: Settings, roles: ["admin", "editor"] },
  { href: "/admin/staff", label: "Staff accounts", icon: Users, roles: ["admin"] },
];

const ROLE_LABEL: Record<Role, string> = { admin: "Admin", editor: "Content editor", agent: "Booking agent" };

interface Toast {
  bookingId: string;
  title: string;
  body: string;
  priority: boolean;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [priorityCount, setPriorityCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [sound, setSound] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const mountedAt = useRef(Date.now());
  const soundRef = useRef(sound);
  const bookingsAllowed = canManageBookings(role);

  useEffect(() => {
    setSound(getSoundPreference());
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => setMenuOpen(false), [pathname]);

  // Real-time new booking alerts.
  useEffect(() => {
    if (!bookingsAllowed) return;
    const q = query(collection(clientDb(), "bookings"), where("status", "==", "new"));
    return onSnapshot(q, (snap) => {
      setNewCount(snap.size);
      setPriorityCount(snap.docs.filter((d) => d.get("isForeign")).length);

      const fresh = snap
        .docChanges()
        .filter((c) => c.type === "added" && (c.doc.get("createdAt") as number) > mountedAt.current - 5000)
        .map((c) => ({ id: c.doc.id, ...c.doc.data() }) as Booking);
      if (!fresh.length) return;

      const booking = fresh.find((b) => b.isForeign) ?? fresh[0]!;
      const title = booking.isForeign ? `Priority booking ${booking.ref}` : `New booking ${booking.ref}`;
      const body = `${booking.traveler.name} (${booking.traveler.nationality}) · ${booking.route.name}`;
      if (soundRef.current) playChime(booking.isForeign);
      showDesktopNotification(title, body, () => router.push(`/admin/bookings/${booking.id}`));
      setToast({ bookingId: booking.id, title, body, priority: booking.isForeign });
    });
  }, [bookingsAllowed, router]);

  // Unread notification count.
  useEffect(() => {
    if (!bookingsAllowed || !user) return;
    const q = query(collection(clientDb(), "notifications"), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, (snap) => {
      setUnread(
        snap.docs.filter((d) => {
          const n = d.data() as NotificationItem;
          return n.channel === "dashboard" && !n.readBy?.includes(user.uid);
        }).length,
      );
    });
  }, [bookingsAllowed, user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 15000);
    return () => clearTimeout(t);
  }, [toast]);

  // Tab title shows the number of new bookings.
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = newCount > 0 ? `(${newCount}) ${base}` : base;
  }, [newCount, pathname]);

  const items = NAV.filter((item) => role && item.roles.includes(role));
  const badgeValue = (b?: NavItem["badge"]) => (b === "bookings" ? newCount : b === "notifications" ? unread : 0);

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-5 py-5 text-white">
        <LogoMark className="size-7" />
        <span className="font-display font-bold leading-tight">Bentota Smart Journeys</span>
      </Link>
      <ul className="flex-1 space-y-0.5 px-3">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const count = badgeValue(item.badge);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs font-bold tabular-nums",
                      item.badge === "bookings" && priorityCount > 0 ? "alert-pulse bg-sun-500 text-ocean-950" : "bg-white/20 text-white",
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-white/10 p-4 text-sm text-white/70">
        <p className="truncate text-white">{user?.email}</p>
        <p className="text-xs">{role ? ROLE_LABEL[role] : ""}</p>
        <button type="button" onClick={() => signOut()} className="mt-3 inline-flex items-center gap-2 hover:text-white">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surf lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden bg-ocean-950 lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebar}</div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ocean-950/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-ocean-950">{sidebar}</div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-ocean-900/10 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex flex-1 items-center justify-end gap-2">
            {bookingsAllowed && priorityCount > 0 && (
              <Link href="/admin/bookings?filter=priority" className="alert-pulse rounded-full bg-sun-500 px-3 py-1 text-xs font-bold text-ocean-950">
                {priorityCount} priority {priorityCount === 1 ? "booking" : "bookings"} waiting
              </Link>
            )}
            {bookingsAllowed && permission === "default" && (
              <button
                type="button"
                onClick={async () => setPermission(await Notification.requestPermission())}
                className="rounded-full border border-ocean-900/15 px-3 py-1 text-xs font-medium hover:bg-ocean-50"
              >
                Turn on desktop alerts
              </button>
            )}
            {bookingsAllowed && (
              <button
                type="button"
                onClick={() => {
                  setSound(!sound);
                  setSoundPreference(!sound);
                  if (!sound) playChime(false);
                }}
                className="rounded-full p-2 hover:bg-ocean-50"
                aria-label={sound ? "Mute booking alert sound" : "Turn on booking alert sound"}
                title={sound ? "Alert sound on" : "Alert sound off"}
              >
                {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      {toast && (
        <div
          role="alert"
          className={cn(
            "fixed right-4 bottom-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl p-4 shadow-xl sm:right-6 sm:bottom-6",
            toast.priority ? "bg-sun-500 text-ocean-950" : "bg-ocean-900 text-white",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display font-bold">{toast.title}</p>
              <p className="mt-0.5 text-sm opacity-90">{toast.body}</p>
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
              <X className="size-4" />
            </button>
          </div>
          <Link
            href={`/admin/bookings/${toast.bookingId}`}
            onClick={() => setToast(null)}
            className="mt-3 inline-block text-sm font-semibold underline"
          >
            Open booking
          </Link>
        </div>
      )}
    </div>
  );
}

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { role } = useAuth();
  if (!role || !roles.includes(role)) {
    return (
      <div className="rounded-xl border border-ocean-900/10 bg-white p-8">
        <h1 className="text-xl font-bold">You do not have access to this page</h1>
        <p className="mt-2 text-sm text-ocean-950/70">Ask an admin to change your role if you need it.</p>
      </div>
    );
  }
  return <>{children}</>;
}
