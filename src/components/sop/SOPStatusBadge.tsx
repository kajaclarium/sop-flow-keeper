import { cn } from "@/lib/utils";
import { SOPStatus } from "@/types/sop";
import { Lock, Send, CheckCircle2, FileEdit } from "lucide-react";

const statusConfig: Record<SOPStatus, { label: string; className: string; icon: React.ElementType }> = {
  Draft: {
    label: "Draft",
    className: "bg-status-draft-bg text-status-draft",
    icon: FileEdit,
  },
  "In Review": {
    label: "In Review",
    className: "bg-status-review-bg text-status-review",
    icon: Send,
  },
  Approved: {
    label: "Approved",
    className: "bg-status-approved-bg text-status-approved",
    icon: CheckCircle2,
  },
  Effective: {
    label: "Effective",
    className: "bg-status-effective-bg text-status-effective",
    icon: Lock,
  },
};

export function SOPStatusBadge({ status, size = "sm" }: { status: SOPStatus; size?: "sm" | "lg" }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        config.className,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
}
