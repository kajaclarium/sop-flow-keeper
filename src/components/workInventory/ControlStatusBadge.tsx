import { ControlStatus } from "@/types/workInventory";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ControlStatusBadge({ status }: { status: ControlStatus }) {
  const isControlled = status === "Controlled";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
        isControlled
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200 animate-pulse"
      )}
    >
      {isControlled ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {status}
    </span>
  );
}
