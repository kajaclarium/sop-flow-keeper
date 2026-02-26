import { EzBadge } from "@clarium/ezui-react-components";
import { ControlStatus } from "@/types/workInventory";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ControlStatusBadgeProps {
  status: ControlStatus;
}

/** Renders an EzBadge indicating whether a task is controlled or uncontrolled. */
export function ControlStatusBadge({ status }: ControlStatusBadgeProps) {
  const isControlled = status === "Controlled";
  return (
    <EzBadge
      severity={isControlled ? "success" : "danger"}
      size="small"
      text={status}
      icon={isControlled ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      outlined
    />
  );
}
