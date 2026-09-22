import { cn } from "@/lib/utils";

/** Sun setting into a wave: simple mark drawn from the proposal's beach cover. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex size-9 items-center justify-center rounded-full bg-[#f5a623] text-[#061b2e] shadow-sm shrink-0", className)}>
      <svg viewBox="0 0 32 32" className="size-6 text-[#061b2e]" fill="none" aria-hidden>
        {/* Sun */}
        <circle cx="16" cy="11" r="5" fill="currentColor" />
        {/* Waves / hills */}
        <path
          d="M4 22C7 19.5 10.5 21 14 19.5C17.5 18 21 19.5 25 18C27.5 17 28.5 17.5 29 18V24H3V22.5C3.3 22.2 3.7 22.1 4 22Z"
          fill="currentColor"
        />
        <path
          d="M2 24C6 22.5 10 23.5 14 22.5C18 21.5 22 23 26 21.5C28.5 20.5 29.5 21 30 21.5V27H2V24Z"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

