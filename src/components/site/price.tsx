import { formatMoney } from "@/lib/pricing";
import type { RoutePricing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoutePrice({ pricing, className, tone = "light" }: { pricing: RoutePricing; className?: string; tone?: "light" | "dark" }) {
  return (
    <div className={cn("leading-tight", className)}>
      <p className={cn("text-xs", tone === "dark" ? "text-white/70" : "text-ocean-950/60")}>Per adult</p>
      <p className={cn("font-display text-2xl font-bold tabular-nums", tone === "dark" ? "text-white" : "text-ocean-950")}>
        {formatMoney(pricing.foreignAdult, "USD")}
      </p>
      <p className={cn("text-xs tabular-nums", tone === "dark" ? "text-white/70" : "text-ocean-950/60")}>
        Sri Lankan nationals {formatMoney(pricing.localAdult, "LKR")}
      </p>
    </div>
  );
}
