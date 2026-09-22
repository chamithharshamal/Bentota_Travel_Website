import { Badge } from "@/components/ui/misc";
import type { BookingStatus } from "@/lib/types";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const TONE = {
  new: "sun",
  contacted: "ocean",
  confirmed: "palm",
  completed: "neutral",
  cancelled: "danger",
} as const;

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

export function PriorityBadge() {
  return <Badge tone="sun" className="ring-1 ring-sun-500">Foreign · priority</Badge>;
}
