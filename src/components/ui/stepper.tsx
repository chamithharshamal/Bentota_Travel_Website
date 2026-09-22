"use client";

import { Minus, Plus } from "lucide-react";

export function NumberStepper({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p id={`${id}-label`} className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-ocean-950/60">{hint}</p>}
      </div>
      <div className="flex items-center gap-1" role="group" aria-labelledby={`${id}-label`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex size-9 items-center justify-center rounded-full border border-ocean-900/20 disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-4" />
        </button>
        <output aria-live="polite" className="w-8 text-center font-display text-lg font-bold tabular-nums">
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex size-9 items-center justify-center rounded-full border border-ocean-900/20 disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
