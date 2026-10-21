import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-4xl font-bold">This page is not on any route</h1>
      <p className="text-ocean-950/70">The link may be old, or the tour may no longer be offered.</p>
      <div className="flex gap-3">
        <LinkButton href="/">Go to the home page</LinkButton>
        <LinkButton href="/packages" variant="outline">Book a trip</LinkButton>
      </div>
    </main>
  );
}
