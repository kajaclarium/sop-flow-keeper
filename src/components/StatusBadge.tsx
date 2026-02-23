import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type SOPStatus = "Draft" | "In Review" | "Effective";

interface StatusBadgeProps {
  status: SOPStatus;
  className?: string;
}

const statusConfig: Record<SOPStatus, { label: string; className: string }> = {
  Draft: {
    label: "Draft",
    className: "bg-status-draft-bg text-status-draft border-transparent",
  },
  "In Review": {
    label: "In Review",
    className: "bg-status-review-bg text-status-review border-transparent",
  },
  Effective: {
    label: "Effective",
    className: "bg-status-effective-bg text-status-effective border-transparent",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium text-xs gap-1", config.className, className)}>
      {status === "Effective" && <Lock className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
