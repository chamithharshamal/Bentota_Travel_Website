import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "sun" | "palm" | "ocean" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-ocean-900/8 text-ocean-900",
  sun: "bg-sun-100 text-sun-600",
  palm: "bg-palm-100 text-palm-700",
  ocean: "bg-ocean-100 text-ocean-800",
  danger: "bg-danger-100 text-danger",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-ocean-900/10 bg-white", className)}>{children}</div>;
}

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-ocean-950/60", className)}>
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {label}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-ocean-900/20 bg-white/60 p-8">
      <p className="font-display text-lg font-semibold">{title}</p>
      {body && <p className="max-w-prose text-sm text-ocean-950/70">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-ocean-950">{title}</h1>
        {description && <p className="mt-1 max-w-prose text-sm text-ocean-950/65">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Alert({ tone = "danger", children }: { tone?: "danger" | "sun" | "palm"; children: ReactNode }) {
  const map = {
    danger: "border-danger/30 bg-danger-100 text-danger",
    sun: "border-sun-500/40 bg-sun-100 text-ocean-950",
    palm: "border-palm-500/30 bg-palm-100 text-palm-700",
  };
  return <div className={cn("rounded-lg border px-4 py-3 text-sm", map[tone])}>{children}</div>;
}
