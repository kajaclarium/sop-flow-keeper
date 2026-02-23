import { cn } from "@/lib/utils";
import { SOPStatus } from "@/types/sop";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const WORKFLOW_STEPS: SOPStatus[] = ["Draft", "In Review", "Approved", "Effective"];

const stepColors: Record<SOPStatus, string> = {
  Draft: "bg-status-draft",
  "In Review": "bg-status-review",
  Approved: "bg-status-approved",
  Effective: "bg-status-effective",
};

export function StatusWorkflow({ currentStatus }: { currentStatus: SOPStatus }) {
  const currentIdx = WORKFLOW_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {WORKFLOW_STEPS.map((step, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                isCurrent && `${stepColors[step]} text-white`,
                isPast && "bg-muted text-muted-foreground",
                !isCurrent && !isPast && "bg-muted/50 text-muted-foreground/50"
              )}
            >
              {isPast && <CheckCircle2 className="h-3 w-3" />}
              {step}
            </div>
            {i < WORKFLOW_STEPS.length - 1 && (
              <ArrowRight className={cn("h-3 w-3", i < currentIdx ? "text-muted-foreground" : "text-muted-foreground/30")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
