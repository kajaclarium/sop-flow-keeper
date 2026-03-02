import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWorkInventory, AVAILABLE_SOPS, SOP_TITLE_MAP } from "@/contexts/WorkInventoryContext";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EzButton, EzInput, EzSelect, EzAlert, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  ArrowLeft, User, FileText,
  Link2, Plus, Pencil, Trash2, Search,
  Save, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Displays detailed view of a single task with editable SOP linking. */
export function TaskDetail() {
  const {
    getSelectedTask, getTaskControlStatus, navigateToTasks, updateTask,
  } = useWorkInventory();
  const task = getSelectedTask();

  /* ---- SOP Search State ---- */
  const [sopSearch, setSopSearch] = useState("");
  const [showSopSearch, setShowSopSearch] = useState(false);

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Task not found</p>
      </div>
    );
  }

  const controlStatus = getTaskControlStatus(task);

  /* ---- SOP Link Handlers ---- */
  const addSopLink = (sopId: string) => {
    if (task.linkedSopIds.includes(sopId)) return;
    updateTask(task.id, { linkedSopIds: [...task.linkedSopIds, sopId] });
  };

  const removeSopLink = (sopId: string) => {
    updateTask(task.id, { linkedSopIds: task.linkedSopIds.filter((id) => id !== sopId) });
  };

  const sopSuggestions = useMemo(() => {
    if (!sopSearch.trim()) return [];
    const q = sopSearch.toLowerCase();
    return AVAILABLE_SOPS.filter(
      (s) => !task.linkedSopIds.includes(s.id) && (s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q))
    );
  }, [sopSearch, task.linkedSopIds]);

  const unlinkedSops = useMemo(() => {
    return AVAILABLE_SOPS.filter((s) => !task.linkedSopIds.includes(s.id));
  }, [task.linkedSopIds]);


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

        {/* Unmapped Warning */}
        {controlStatus === "SOP Unmapped" && (
          <EzAlert variant="danger">
            <p className="text-sm font-medium">No Active SOP Linked</p>
            <p className="text-xs mt-0.5">
              This task has no linked Standard Operating Procedure and is flagged as <strong>SOP Unmapped</strong>.
              Per the No-Standard-No-Work principle, critical activities without active SOPs require immediate attention.
            </p>
          </EzAlert>
        )}

        {/* Linked SOPs */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Linked SOPs ({task.linkedSopIds.length})
            </h3>
            <EzButton
              variant={showSopSearch ? "outlined" : "text"}
              size="small"
              onClick={() => { setShowSopSearch(!showSopSearch); setSopSearch(""); }}
              icon={showSopSearch ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            >
              {showSopSearch ? "Close" : "Add SOP"}
            </EzButton>
          </div>

          {showSopSearch && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <EzInput placeholder="Search SOPs..." value={sopSearch} onChange={(e) => setSopSearch(e.target.value)} suffix={<Search className="h-3.5 w-3.5 text-muted-foreground" />} className="text-xs" />
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {(sopSearch.trim() ? sopSuggestions : unlinkedSops).map((sop) => (
                  <div key={sop.id} className="flex items-center gap-3 rounded-lg border p-2.5 hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => addSopLink(sop.id)}>
                    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground">{sop.id}</span>
                      <p className="text-xs font-medium truncate">{sop.title}</p>
                    </div>
                    <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {task.linkedSopIds.map((sopId) => (
              <div key={sopId} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors group/sop">
                <FileText className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground">{sopId}</span>
                  <p className="text-sm font-medium truncate">{SOP_TITLE_MAP[sopId] || "Unknown SOP"}</p>
                </div>
                <EzButton variant="text" severity="danger" size="small" onClick={() => removeSopLink(sopId)} icon={<Trash2 className="h-3.5 w-3.5" />} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
