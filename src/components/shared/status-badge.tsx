"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppointmentStatus, PaymentStatus } from "@/types";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  rescheduled: {
    label: "Rescheduled",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  completed: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full text-[11px] font-semibold px-2.5 py-0.5", config.className)}
    >
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          status === "pending" && "bg-amber-500",
          status === "confirmed" && "bg-emerald-500",
          status === "completed" && "bg-blue-500",
          status === "cancelled" && "bg-red-500",
          status === "rescheduled" && "bg-purple-500"
        )}
      />
      {config.label}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = paymentStatusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full text-[11px] font-semibold px-2.5 py-0.5", config.className)}
    >
      {config.label}
    </Badge>
  );
}
