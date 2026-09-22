import { cn } from "@/lib/utils";

export interface RouteLineStop {
  name: string;
  day?: 1 | 2;
  mandatory?: boolean;
}

/**
 * Shows a route as a line of numbered stops, like a coastal rail map.
 * "responsive" is horizontal from the small breakpoint up and vertical on phones.
 * Filled stops are always included; ringed stops are optional.
 */
export function RouteLine({
  stops,
  tone = "light",
  animate = false,
  size = "md",
  orientation = "responsive",
  className,
}: {
  stops: RouteLineStop[];
  tone?: "light" | "dark";
  animate?: boolean;
  size?: "sm" | "md";
  orientation?: "responsive" | "vertical";
  className?: string;
}) {
  const showDays = stops.some((s) => s.day === 2);
  const dark = tone === "dark";
  const md = size === "md";
  const horizontal = orientation === "responsive";
  const step = 0.28;

  const connector = md
    ? cn("left-[13px] top-3.5 h-[calc(100%+1rem)]", horizontal && "sm:left-3.5 sm:top-[13px] sm:h-0.5 sm:w-[calc(100%+0.5rem)]")
    : cn("left-[9px] top-2.5 h-[calc(100%+1rem)]", horizontal && "sm:left-2.5 sm:top-[9px] sm:h-0.5 sm:w-[calc(100%+0.5rem)]");

  return (
    <ol
      className={cn("flex flex-col gap-4", horizontal && "sm:grid sm:gap-2", className)}
      style={horizontal ? { gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` } : undefined}
    >
      {stops.map((stop, i) => {
        const dayStart = showDays && (i === 0 || stops[i - 1]?.day !== stop.day);
        const optional = stop.mandatory === false;
        return (
          <li key={`${stop.name}-${i}`} className={cn("relative flex items-start gap-3", horizontal && "sm:flex-col sm:gap-2")}>
            {i < stops.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute w-0.5",
                  dark ? "bg-sun-500" : "bg-ocean-900",
                  connector,
                  animate && (horizontal ? "route-grow" : "route-grow route-grow-vertical"),
                )}
                style={
                  animate
                    ? { animationDelay: `${0.2 + i * step}s`, animationDuration: `${step}s`, animationTimingFunction: "linear" }
                    : undefined
                }
              />
            )}
            <span
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center rounded-full font-display font-bold tabular-nums",
                md ? "size-7 text-xs" : "size-5 text-[10px]",
                optional
                  ? dark
                    ? "bg-ocean-950 text-sun-500 ring-2 ring-inset ring-sun-500"
                    : "bg-white text-ocean-900 ring-2 ring-inset ring-ocean-900"
                  : dark
                    ? "bg-sun-500 text-ocean-950"
                    : "bg-ocean-900 text-white",
                animate && "stop-pop",
              )}
              style={animate ? { animationDelay: `${0.15 + i * step}s` } : undefined}
            >
              {i + 1}
            </span>
            <span className={cn("min-w-0", md ? "pt-1" : "pt-0.5", horizontal && "sm:pt-0 sm:pr-2")}>
              {dayStart && (
                <span className={cn("block text-xs font-semibold", dark ? "text-sun-500" : "text-sun-600")}>
                  Day {stop.day}
                </span>
              )}
              <span
                className={cn(
                  "block leading-snug",
                  md ? "text-sm font-medium" : "text-xs",
                  dark ? "text-white" : "text-ocean-950",
                )}
              >
                {stop.name}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
