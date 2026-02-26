import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { EzButton, EzAlert } from "@clarium/ezui-react-components";
import {
  ArrowLeft, User, ArrowDownToLine, ArrowUpFromLine, FileText,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_SOPS: Record<string, string> = {
  "SOP-001": "Facility Cleaning Protocol",
  "SOP-002": "Equipment Calibration Procedure",
  "SOP-003": "Incident Response Plan",
  "SOP-004": "Chemical Waste Disposal",
  "SOP-005": "Employee Onboarding Checklist",
  "SOP-006": "Data Backup & Recovery",
};

const IO_TYPE_STYLES: Record<string, string> = {
  document: "bg-blue-50 text-blue-700 border-blue-200",
  material: "bg-amber-50 text-amber-700 border-amber-200",
  data: "bg-violet-50 text-violet-700 border-violet-200",
  approval: "bg-green-50 text-green-700 border-green-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

/** Displays detailed view of a single task with I/O definitions and linked SOPs. */
export function TaskDetail() {
  const { getSelectedTask, getTaskControlStatus, navigateToTasks } = useWorkInventory();
  const task = getSelectedTask();

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Task not found</p>
      </div>
    );
  }

  const controlStatus = getTaskControlStatus(task);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Back Button */}
        <EzButton variant="text" size="small" className="-ml-2" onClick={() => navigateToTasks(task.moduleId)} icon={<ArrowLeft className="h-4 w-4" />}>
          Back to Tasks
        </EzButton>

        {/* Task Header */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
              <h1 className="text-xl font-bold tracking-tight mt-1">{task.name}</h1>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge level={task.riskLevel} />
              <ControlStatusBadge status={controlStatus} />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium">{task.owner}</span>
            </div>
            <span>Created {task.createdAt}</span>
          </div>
        </div>

        {/* Uncontrolled Warning */}
        {controlStatus === "Uncontrolled" && (
          <EzAlert variant="danger">
            <p className="text-sm font-medium">No Active SOP Linked</p>
            <p className="text-xs mt-0.5">
              This task has no linked Standard Operating Procedure and is flagged as <strong>Uncontrolled</strong>.
              Per the No-Standard-No-Work principle, critical activities without active SOPs require immediate attention.
            </p>
          </EzAlert>
        )}

        {/* I/O Definitions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-blue-500" />
              Inputs
              <span className="text-xs font-normal text-muted-foreground">({task.inputs.length})</span>
            </h3>
            {task.inputs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No inputs defined</p>
            ) : (
              <div className="space-y-2">
                {task.inputs.map((io) => (
                  <div key={io.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{io.label}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", IO_TYPE_STYLES[io.type])}>
                        {io.type}
                      </span>
                    </div>
                    {io.description && (
                      <p className="text-xs text-muted-foreground">{io.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outputs */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4 text-emerald-500" />
              Outputs
              <span className="text-xs font-normal text-muted-foreground">({task.outputs.length})</span>
            </h3>
            {task.outputs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No outputs defined</p>
            ) : (
              <div className="space-y-2">
                {task.outputs.map((io) => (
                  <div key={io.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{io.label}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", IO_TYPE_STYLES[io.type])}>
                        {io.type}
                      </span>
                    </div>
                    {io.description && (
                      <p className="text-xs text-muted-foreground">{io.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Linked SOPs */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Linked SOPs
            <span className="text-xs font-normal text-muted-foreground">({task.linkedSopIds.length})</span>
          </h3>
          {task.linkedSopIds.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground mt-2">No SOPs linked to this task</p>
            </div>
          ) : (
            <div className="space-y-2">
              {task.linkedSopIds.map((sopId) => (
                <div key={sopId} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground">{sopId}</span>
                    <p className="text-sm font-medium truncate">{AVAILABLE_SOPS[sopId] || "Unknown SOP"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
