import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWorkInventory, AVAILABLE_SOPS, SOP_TITLE_MAP } from "@/contexts/WorkInventoryContext";
import { TaskIO, IOType, CompletionStatus } from "@/types/workInventory";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EzButton, EzInput, EzSelect, EzAlert, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  ArrowLeft, User, ArrowDownToLine, ArrowUpFromLine, FileText,
  Link2, Plus, Pencil, Trash2, Search, CheckCircle2, Clock, Circle,
  TrendingUp, Save, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IO_TYPES: IOType[] = ["document", "material", "data", "approval", "other"];

/** I/O type options formatted for EzSelect. */
const IO_TYPE_OPTIONS = IO_TYPES.map((t) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }));

/** Visual styles for I/O type badges. */
const IO_TYPE_STYLES: Record<string, string> = {
  document: "bg-blue-50 text-blue-700 border-blue-200",
  material: "bg-amber-50 text-amber-700 border-amber-200",
  data: "bg-violet-50 text-violet-700 border-violet-200",
  approval: "bg-green-50 text-green-700 border-green-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

/** Completion status options for EzSelect. */
const COMPLETION_OPTIONS: { label: string; value: CompletionStatus }[] = [
  { label: "Not Started", value: "Not Started" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

/** Icon and style mapping for completion status indicators. */
const COMPLETION_CONFIG = {
  "Not Started": { icon: Circle, color: "text-muted-foreground", bg: "bg-gray-100 text-gray-600" },
  "In Progress": { icon: Clock, color: "text-amber-600", bg: "bg-amber-100 text-amber-700" },
  "Completed": { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 text-emerald-700" },
};

/** Displays detailed view of a single task with editable I/O, SOP linking, and KPI tracking. */
export function TaskDetail() {
  const {
    getSelectedTask, getTaskControlStatus, navigateToTasks, updateTask,
    getTaskKpiScore, getTaskWeight,
  } = useWorkInventory();
  const task = getSelectedTask();

  /* ---- I/O Editing State ---- */
  const [editingIO, setEditingIO] = useState<{ id: string; direction: "input" | "output" } | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<IOType>("data");
  const [editDesc, setEditDesc] = useState("");

  /* ---- Add I/O State ---- */
  const [addingDirection, setAddingDirection] = useState<"input" | "output" | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<IOType>("data");
  const [newDesc, setNewDesc] = useState("");

  /* ---- SOP Search State ---- */
  const [sopSearch, setSopSearch] = useState("");
  const [showSopSearch, setShowSopSearch] = useState(false);

  /* ---- Delete I/O Confirmation ---- */
  const [deleteIODialog, setDeleteIODialog] = useState<{ id: string; direction: "input" | "output"; label: string } | null>(null);

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Task not found</p>
      </div>
    );
  }

  const controlStatus = getTaskControlStatus(task);
  const taskKpi = getTaskKpiScore(task);
  const weight = getTaskWeight(task.moduleId);
  const weightedScore = (weight * taskKpi) / 100;
  const completionConfig = COMPLETION_CONFIG[task.completionStatus];
  const CompIcon = completionConfig.icon;

  /* ---- I/O Edit Handlers ---- */

  /** Opens the inline editor for an existing I/O item. */
  const startEditIO = (io: TaskIO, direction: "input" | "output") => {
    setEditingIO({ id: io.id, direction });
    setEditLabel(io.label);
    setEditType(io.type);
    setEditDesc(io.description);
  };

  /** Saves changes to the I/O item being edited. */
  const saveEditIO = () => {
    if (!editingIO || !editLabel.trim()) return;
    const field = editingIO.direction === "input" ? "inputs" : "outputs";
    const items = task[field].map((io) =>
      io.id === editingIO.id ? { ...io, label: editLabel.trim(), type: editType, description: editDesc.trim() } : io
    );
    updateTask(task.id, { [field]: items });
    setEditingIO(null);
  };

  /** Cancels the current I/O edit. */
  const cancelEditIO = () => setEditingIO(null);

  /** Opens the delete confirmation for an I/O item. */
  const openDeleteIODialog = (io: TaskIO, direction: "input" | "output") => {
    setDeleteIODialog({ id: io.id, direction, label: io.label });
  };

  /** Deletes the I/O item after confirmation. */
  const confirmDeleteIO = () => {
    if (!deleteIODialog) return;
    const field = deleteIODialog.direction === "input" ? "inputs" : "outputs";
    const items = task[field].filter((io) => io.id !== deleteIODialog.id);
    updateTask(task.id, { [field]: items });
    setDeleteIODialog(null);
  };

  /* ---- Add I/O Handlers ---- */

  /** Opens the inline form for adding a new I/O item. */
  const startAddIO = (direction: "input" | "output") => {
    setAddingDirection(direction);
    setNewLabel("");
    setNewType("data");
    setNewDesc("");
  };

  /** Saves the new I/O item. */
  const saveAddIO = () => {
    if (!addingDirection || !newLabel.trim()) return;
    const newIO: TaskIO = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      type: newType,
      description: newDesc.trim(),
    };
    const field = addingDirection === "input" ? "inputs" : "outputs";
    updateTask(task.id, { [field]: [...task[field], newIO] });
    setAddingDirection(null);
  };

  /** Cancels the add I/O form. */
  const cancelAddIO = () => setAddingDirection(null);

  /* ---- SOP Link Handlers ---- */

  /** Adds a SOP link to this task. */
  const addSopLink = (sopId: string) => {
    if (task.linkedSopIds.includes(sopId)) return;
    updateTask(task.id, { linkedSopIds: [...task.linkedSopIds, sopId] });
  };

  /** Removes a SOP link from this task. */
  const removeSopLink = (sopId: string) => {
    updateTask(task.id, { linkedSopIds: task.linkedSopIds.filter((id) => id !== sopId) });
  };

  /** Filtered SOP suggestions based on search, excluding already-linked ones. */
  const sopSuggestions = useMemo(() => {
    if (!sopSearch.trim()) return [];
    const q = sopSearch.toLowerCase();
    return AVAILABLE_SOPS.filter(
      (s) => !task.linkedSopIds.includes(s.id) && (s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q))
    );
  }, [sopSearch, task.linkedSopIds]);

  /** Unlinked SOPs to show when panel is open. */
  const unlinkedSops = useMemo(() => {
    return AVAILABLE_SOPS.filter((s) => !task.linkedSopIds.includes(s.id));
  }, [task.linkedSopIds]);

  /* ---- Completion Status Handler ---- */
  const handleCompletionChange = useCallback((value: string) => {
    updateTask(task.id, { completionStatus: value as CompletionStatus });
  }, [task.id, updateTask]);

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

        {/* KPI Card */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold">Task KPI</h3>
                <InfoTooltip
                  title="Task KPI Score"
                  description="This task's KPI contribution is its weight multiplied by its completion score. Completed = full weight, In Progress = half, Not Started = zero."
                  tip="Change the completion status below to update this task's KPI contribution to the overall process score."
                  side="right"
                  iconSize={12}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Weight: {weight.toFixed(1)}% of module — Contribution: {weightedScore.toFixed(1)}%
              </p>
            </div>
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold", completionConfig.bg)}>
              <CompIcon className="h-3.5 w-3.5" />
              {task.completionStatus}
            </div>
          </div>

          {/* Completion Status Selector */}
          <div className="flex items-center gap-3 pt-3 border-t">
            <span className="text-xs font-medium text-muted-foreground">Update Status:</span>
            <div className="flex items-center gap-1.5">
              {COMPLETION_OPTIONS.map((opt) => {
                const isActive = task.completionStatus === opt.value;
                const cfg = COMPLETION_CONFIG[opt.value];
                const Icon = cfg.icon;
                return (
                  <EzButton
                    key={opt.value}
                    variant={isActive ? "classic" : "text"}
                    severity={isActive ? "primary" : undefined}
                    size="small"
                    onClick={() => handleCompletionChange(opt.value)}
                    icon={<Icon className="h-3.5 w-3.5" />}
                  >
                    {opt.label}
                  </EzButton>
                );
              })}
            </div>
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                Inputs
                <span className="text-xs font-normal text-muted-foreground">({task.inputs.length})</span>
                <InfoTooltip
                  title="Task Inputs"
                  description="Inputs are the documents, materials, data, or approvals required before this task can begin. They define the prerequisites for task execution."
                  tip="Define all inputs to ensure nothing is missed during execution. Each input should have a clear label, type, and description."
                  side="bottom"
                  iconSize={12}
                />
              </h3>
              <EzButton variant="text" size="small" onClick={() => startAddIO("input")} icon={<Plus className="h-3.5 w-3.5" />}>
                Add
              </EzButton>
            </div>

            {/* Add Input Inline Form */}
            {addingDirection === "input" && (
              <div className="rounded-lg border-2 border-dashed border-primary/30 p-3 space-y-2 bg-primary/5">
                <EzInput placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="h-8 text-xs" />
                <div className="flex gap-2">
                  <EzSelect options={IO_TYPE_OPTIONS} value={newType} onValueChange={(v) => setNewType(v as IOType)} className="h-8 text-xs w-28" />
                  <EzInput placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="h-8 text-xs flex-1" />
                </div>
                <div className="flex justify-end gap-1.5">
                  <EzButton variant="text" size="small" onClick={cancelAddIO} icon={<X className="h-3 w-3" />}>Cancel</EzButton>
                  <EzButton size="small" onClick={saveAddIO} disabled={!newLabel.trim()} icon={<Save className="h-3 w-3" />}>Save</EzButton>
                </div>
              </div>
            )}

            {task.inputs.length === 0 && addingDirection !== "input" ? (
              <p className="text-xs text-muted-foreground text-center py-4">No inputs defined</p>
            ) : (
              <div className="space-y-2">
                {task.inputs.map((io) => (
                  <div key={io.id}>
                    {editingIO?.id === io.id && editingIO.direction === "input" ? (
                      /* Edit Mode */
                      <div className="rounded-lg border-2 border-primary/30 p-3 space-y-2 bg-primary/5">
                        <EzInput value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-8 text-xs" />
                        <div className="flex gap-2">
                          <EzSelect options={IO_TYPE_OPTIONS} value={editType} onValueChange={(v) => setEditType(v as IOType)} className="h-8 text-xs w-28" />
                          <EzInput value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 text-xs flex-1" />
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <EzButton variant="text" size="small" onClick={cancelEditIO} icon={<X className="h-3 w-3" />}>Cancel</EzButton>
                          <EzButton size="small" onClick={saveEditIO} disabled={!editLabel.trim()} icon={<Save className="h-3 w-3" />}>Save</EzButton>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="rounded-lg border p-3 space-y-1 group/io hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{io.label}</span>
                          <div className="flex items-center gap-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", IO_TYPE_STYLES[io.type])}>
                              {io.type}
                            </span>
                            <EzButton
                              variant="text" size="small"
                              className="opacity-0 group-hover/io:opacity-100 h-6 w-6 p-0"
                              onClick={() => startEditIO(io, "input")}
                              icon={<Pencil className="h-3 w-3" />}
                              aria-label="Edit"
                            />
                            <EzButton
                              variant="text" severity="danger" size="small"
                              className="opacity-0 group-hover/io:opacity-100 h-6 w-6 p-0"
                              onClick={() => openDeleteIODialog(io, "input")}
                              icon={<Trash2 className="h-3 w-3" />}
                              aria-label="Delete"
                            />
                          </div>
                        </div>
                        {io.description && (
                          <p className="text-xs text-muted-foreground">{io.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outputs */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ArrowUpFromLine className="h-4 w-4 text-emerald-500" />
                Outputs
                <span className="text-xs font-normal text-muted-foreground">({task.outputs.length})</span>
                <InfoTooltip
                  title="Task Outputs"
                  description="Outputs are the deliverables produced when this task is completed. They feed into downstream tasks or serve as evidence of work done."
                  tip="Well-defined outputs enable KPI tracking and demonstrate task completion. Link outputs to downstream task inputs for full traceability."
                  side="bottom"
                  iconSize={12}
                />
              </h3>
              <EzButton variant="text" size="small" onClick={() => startAddIO("output")} icon={<Plus className="h-3.5 w-3.5" />}>
                Add
              </EzButton>
            </div>

            {/* Add Output Inline Form */}
            {addingDirection === "output" && (
              <div className="rounded-lg border-2 border-dashed border-primary/30 p-3 space-y-2 bg-primary/5">
                <EzInput placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="h-8 text-xs" />
                <div className="flex gap-2">
                  <EzSelect options={IO_TYPE_OPTIONS} value={newType} onValueChange={(v) => setNewType(v as IOType)} className="h-8 text-xs w-28" />
                  <EzInput placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="h-8 text-xs flex-1" />
                </div>
                <div className="flex justify-end gap-1.5">
                  <EzButton variant="text" size="small" onClick={cancelAddIO} icon={<X className="h-3 w-3" />}>Cancel</EzButton>
                  <EzButton size="small" onClick={saveAddIO} disabled={!newLabel.trim()} icon={<Save className="h-3 w-3" />}>Save</EzButton>
                </div>
              </div>
            )}

            {task.outputs.length === 0 && addingDirection !== "output" ? (
              <p className="text-xs text-muted-foreground text-center py-4">No outputs defined</p>
            ) : (
              <div className="space-y-2">
                {task.outputs.map((io) => (
                  <div key={io.id}>
                    {editingIO?.id === io.id && editingIO.direction === "output" ? (
                      /* Edit Mode */
                      <div className="rounded-lg border-2 border-primary/30 p-3 space-y-2 bg-primary/5">
                        <EzInput value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-8 text-xs" />
                        <div className="flex gap-2">
                          <EzSelect options={IO_TYPE_OPTIONS} value={editType} onValueChange={(v) => setEditType(v as IOType)} className="h-8 text-xs w-28" />
                          <EzInput value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 text-xs flex-1" />
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <EzButton variant="text" size="small" onClick={cancelEditIO} icon={<X className="h-3 w-3" />}>Cancel</EzButton>
                          <EzButton size="small" onClick={saveEditIO} disabled={!editLabel.trim()} icon={<Save className="h-3 w-3" />}>Save</EzButton>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="rounded-lg border p-3 space-y-1 group/io hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{io.label}</span>
                          <div className="flex items-center gap-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", IO_TYPE_STYLES[io.type])}>
                              {io.type}
                            </span>
                            <EzButton
                              variant="text" size="small"
                              className="opacity-0 group-hover/io:opacity-100 h-6 w-6 p-0"
                              onClick={() => startEditIO(io, "output")}
                              icon={<Pencil className="h-3 w-3" />}
                              aria-label="Edit"
                            />
                            <EzButton
                              variant="text" severity="danger" size="small"
                              className="opacity-0 group-hover/io:opacity-100 h-6 w-6 p-0"
                              onClick={() => openDeleteIODialog(io, "output")}
                              icon={<Trash2 className="h-3 w-3" />}
                              aria-label="Delete"
                            />
                          </div>
                        </div>
                        {io.description && (
                          <p className="text-xs text-muted-foreground">{io.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Linked SOPs — with Search & Add */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Linked SOPs
              <span className="text-xs font-normal text-muted-foreground">({task.linkedSopIds.length})</span>
              <InfoTooltip
                title="Linked SOPs"
                description="Standard Operating Procedures (SOPs) linked to this task define how the work must be performed. Tasks without linked SOPs are flagged as 'Uncontrolled' per the No-Standard-No-Work principle."
                tip="Search and link relevant SOPs to ensure this task is governed by documented procedures. Click 'View SOP' to navigate directly to the SOP document."
                side="left"
                iconSize={12}
              />
            </h3>
            <EzButton
              variant={showSopSearch ? "outlined" : "text"}
              severity={showSopSearch ? "primary" : undefined}
              size="small"
              onClick={() => { setShowSopSearch(!showSopSearch); setSopSearch(""); }}
              icon={showSopSearch ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            >
              {showSopSearch ? "Close" : "Add SOP"}
            </EzButton>
          </div>

          {/* Search & Add Panel */}
          {showSopSearch && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <EzInput
                placeholder="Search SOPs by ID or title…"
                value={sopSearch}
                onChange={(e) => setSopSearch(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                className="text-xs"
              />
              {/* Show search results or all unlinked SOPs */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {(sopSearch.trim() ? sopSuggestions : unlinkedSops).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    {sopSearch.trim() ? "No matching SOPs found" : "All SOPs are already linked"}
                  </p>
                ) : (
                  (sopSearch.trim() ? sopSuggestions : unlinkedSops).map((sop) => (
                    <div
                      key={sop.id}
                      className="flex items-center gap-3 rounded-lg border p-2.5 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => addSopLink(sop.id)}
                    >
                      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 shrink-0">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-muted-foreground">{sop.id}</span>
                        <p className="text-xs font-medium truncate">{sop.title}</p>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Linked SOP List */}
          {task.linkedSopIds.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground mt-2">No SOPs linked to this task</p>
            </div>
          ) : (
            <div className="space-y-2">
              {task.linkedSopIds.map((sopId) => (
                <div key={sopId} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors group/sop">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground">{sopId}</span>
                    <p className="text-sm font-medium truncate">{SOP_TITLE_MAP[sopId] || "Unknown SOP"}</p>
                  </div>
                  <Link to="/" className="no-underline">
                    <EzButton
                      variant="text"
                      size="small"
                      className="opacity-0 group-hover/sop:opacity-100"
                      icon={<ExternalLink className="h-3.5 w-3.5" />}
                      aria-label="View SOP"
                    >
                      View SOP
                    </EzButton>
                  </Link>
                  <EzButton
                    variant="text"
                    severity="danger"
                    size="small"
                    className="opacity-0 group-hover/sop:opacity-100"
                    onClick={() => removeSopLink(sopId)}
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    aria-label="Unlink SOP"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete I/O Confirmation Dialog */}
        <EzAlertDialog
          open={deleteIODialog !== null}
          onOpenChange={(open) => { if (!open) setDeleteIODialog(null); }}
          title={`Delete "${deleteIODialog?.label}"?`}
          description={`This will remove this ${deleteIODialog?.direction} item from the task.`}
          onConfirm={confirmDeleteIO}
          onCancel={() => setDeleteIODialog(null)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
