import { EzBadge } from "@clarium/ezui-react-components";
import { SOPStatus } from "@/types/sop";
import { Lock, Send, CheckCircle2, FileEdit } from "lucide-react";

/** Maps each SOP status to its EzBadge severity and icon. */
const statusConfig: Record<SOPStatus, { label: string; severity: "success" | "warning" | "info" | "primary"; icon: React.ReactNode }> = {
  Draft: {
    label: "Draft",
    severity: "warning",
    icon: <FileEdit className="h-3 w-3" />,
  },
  "In Review": {
    label: "In Review",
    severity: "info",
    icon: <Send className="h-3 w-3" />,
  },
  Approved: {
    label: "Approved",
    severity: "primary",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  Effective: {
    label: "Effective",
    severity: "success",
    icon: <Lock className="h-3 w-3" />,
  },
};

interface SOPStatusBadgeProps {
  status: SOPStatus;
  size?: "sm" | "lg";
}

/** Renders an EzBadge representing the current SOP workflow status. */
export function SOPStatusBadge({ status, size = "sm" }: SOPStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <EzBadge
      severity={config.severity}
      size={size === "sm" ? "small" : "medium"}
      text={config.label}
      icon={config.icon}
      variant="pill"
    />
  );
}
