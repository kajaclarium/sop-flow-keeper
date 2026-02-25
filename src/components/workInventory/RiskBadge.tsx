import { RiskLevel } from "@/types/workInventory";
import { Shield, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const riskConfig: Record<RiskLevel, { label: string; className: string; icon: React.ElementType }> = {
  Low: { label: "Low", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Shield },
  Medium: { label: "Medium", className: "bg-amber-50 text-amber-700 border-amber-200", icon: ShieldAlert },
  High: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-200", icon: ShieldX },
  Critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
};

export function RiskBadge({ level, showLabel = true }: { level: RiskLevel; showLabel?: boolean }) {
  const config = riskConfig[level];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border", config.className)}>
      <Icon className="h-3 w-3" />
      {showLabel && config.label}
    </span>
  );
}
