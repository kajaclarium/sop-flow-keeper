import { EzBadge } from "@clarium/ezui-react-components";
import { RiskLevel } from "@/types/workInventory";
import { Shield, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";

/** Maps each risk level to its EzBadge severity and icon. */
const riskConfig: Record<RiskLevel, { label: string; severity: "success" | "warning" | "danger" | "neutral"; icon: React.ReactNode }> = {
  Low: { label: "Low", severity: "success", icon: <Shield className="h-3 w-3" /> },
  Medium: { label: "Medium", severity: "warning", icon: <ShieldAlert className="h-3 w-3" /> },
  High: { label: "High", severity: "danger", icon: <ShieldX className="h-3 w-3" /> },
  Critical: { label: "Critical", severity: "danger", icon: <AlertTriangle className="h-3 w-3" /> },
};

interface RiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
}

/** Renders an EzBadge representing the risk level of a module or task. */
export function RiskBadge({ level, showLabel = true }: RiskBadgeProps) {
  const config = riskConfig[level];
  return (
    <EzBadge
      severity={config.severity}
      size="small"
      text={showLabel ? config.label : undefined}
      icon={config.icon}
      outlined
    />
  );
}
