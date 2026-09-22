import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Bentota Smart Journeys — Day trips and two-day tours from Bentota",
    template: "%s · Bentota Smart Journeys",
  },
  description:
    "Book one-day and two-day private tours from Bentota, Sri Lanka. Choose your route, pick your stops, and get picked up from your hotel.",
};

export const viewport: Viewport = {
  themeColor: "#0b2c4a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
