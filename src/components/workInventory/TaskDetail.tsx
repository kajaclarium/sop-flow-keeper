import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWorkInventory, AVAILABLE_SOPS, SOP_TITLE_MAP } from "@/contexts/WorkInventoryContext";
import { TaskIO, IOType } from "@/types/workInventory";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EzButton, EzInput, EzSelect, EzAlert, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  ArrowLeft, User, ArrowDownToLine, ArrowUpFromLine, FileText,
  Link2, Plus, Pencil, Trash2, Search,
  Save, X, ExternalLink,
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


/** Displays detailed view of a single task with editable I/O and SOP linking. */
export function TaskDetail() {
  const {
    getSelectedTask, getTaskControlStatus, navigateToTasks, updateTask,
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

  /* ---- I/O Edit Handlers ---- */
  const startEditIO = (io: TaskIO, direction: "input" | "output") => {
    setEditingIO({ id: io.id, direction });
    setEditLabel(io.label);
    setEditType(io.type);
    setEditDesc(io.description);
  };

  const saveEditIO = () => {
    if (!editingIO || !editLabel.trim()) return;
    const field = editingIO.direction === "input" ? "inputs" : "outputs";
    const items = task[field].map((io) =>
      io.id === editingIO.id ? { ...io, label: editLabel.trim(), type: editType, description: editDesc.trim() } : io
    );
    updateTask(task.id, { [field]: items });
    setEditingIO(null);
  };

  const cancelEditIO = () => setEditingIO(null);

  const openDeleteIODialog = (io: TaskIO, direction: "input" | "output") => {
    setDeleteIODialog({ id: io.id, direction, label: io.label });
  };

  const confirmDeleteIO = () => {
    if (!deleteIODialog) return;
    const field = deleteIODialog.direction === "input" ? "inputs" : "outputs";
    const items = task[field].filter((io) => io.id !== deleteIODialog.id);
    updateTask(task.id, { [field]: items });
    setDeleteIODialog(null);
  };

  /* ---- Add I/O Handlers ---- */
  const startAddIO = (direction: "input" | "output") => {
    setAddingDirection(direction);
    setNewLabel("");
    setNewType("data");
    setNewDesc("");
  };

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

  const cancelAddIO = () => setAddingDirection(null);

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
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                Inputs ({task.inputs.length})
              </h3>
              <EzButton variant="text" size="small" onClick={() => startAddIO("input")} icon={<Plus className="h-3.5 w-3.5" />}>
                Add
              </EzButton>
            </div>

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
                      <div className="rounded-lg border p-3 space-y-1 group/io hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{io.label}</span>
                          <div className="flex items-center gap-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", IO_TYPE_STYLES[io.type])}>
                              {io.type}
                            </span>
                            <EzButton variant="text" size="small" className="h-6 w-6 p-0" onClick={() => startEditIO(io, "input")} icon={<Pencil className="h-3 w-3" />} />
                            <EzButton variant="text" severity="danger" size="small" className="h-6 w-6 p-0" onClick={() => openDeleteIODialog(io, "input")} icon={<Trash2 className="h-3 w-3" />} />
                          </div>
                        </div>
                        {io.description && <p className="text-xs text-muted-foreground">{io.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ArrowUpFromLine className="h-4 w-4 text-emerald-500" />
                Outputs ({task.outputs.length})
              </h3>
              <EzButton variant="text" size="small" onClick={() => startAddIO("output")} icon={<Plus className="h-3.5 w-3.5" />}>
                Add
              </EzButton>
            </div>

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
                      <div className="rounded-lg border p-3 space-y-1 group/io hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{io.label}</span>
                          <div className="flex items-center gap-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", IO_TYPE_STYLES[io.type])}>
                              {io.type}
                            </span>
                            <EzButton variant="text" size="small" className="h-6 w-6 p-0" onClick={() => startEditIO(io, "output")} icon={<Pencil className="h-3 w-3" />} />
                            <EzButton variant="text" severity="danger" size="small" className="h-6 w-6 p-0" onClick={() => openDeleteIODialog(io, "output")} icon={<Trash2 className="h-3 w-3" />} />
                          </div>
                        </div>
                        {io.description && <p className="text-xs text-muted-foreground">{io.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
              <EzInput placeholder="Search SOPs..." value={sopSearch} onChange={(e) => setSopSearch(e.target.value)} prefix={<Search className="h-3.5 w-3.5 text-muted-foreground" />} className="text-xs" />
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

        <EzAlertDialog
          open={deleteIODialog !== null}
          onOpenChange={(open) => { if (!open) setDeleteIODialog(null); }}
          title={`Delete "${deleteIODialog?.label}"?`}
          description={`This will remove this ${deleteIODialog?.direction} item.`}
          onConfirm={confirmDeleteIO}
          onCancel={() => setDeleteIODialog(null)}
          confirmLabel="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
}
