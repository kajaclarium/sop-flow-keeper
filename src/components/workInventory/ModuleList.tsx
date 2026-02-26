import { useState, useMemo } from "react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { RiskLevel } from "@/types/workInventory";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EzButton, EzInput, EzTextarea, EzSelect, EzDialog, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  Plus, Layers, Pencil, Trash2, ArrowRight, ListTodo, User, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];

/** Risk level options formatted for EzSelect. */
const RISK_OPTIONS = RISK_LEVELS.map((r) => ({ label: r, value: r }));

/** Color mapping for RAG (Red-Amber-Green) KPI status indicators. */
const RAG_COLORS = {
  Green: { bg: "bg-emerald-500", text: "text-emerald-700", track: "bg-emerald-100", label: "On Track" },
  Amber: { bg: "bg-amber-500", text: "text-amber-700", track: "bg-amber-100", label: "At Risk" },
  Red: { bg: "bg-red-500", text: "text-red-700", track: "bg-red-100", label: "Critical" },
};

/** Lists all registered modules with create/edit/delete functionality and KPI scores. */
export function ModuleList() {
  const {
    modules, tasks, createModule, updateModule, deleteModule,
    navigateToTasks, getTaskControlStatus, getModuleKpiScore, getModuleRagStatus,
  } = useWorkInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Medium");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Saves a new or edited module. */
  const handleSave = () => {
    if (!name.trim() || !owner.trim()) return;
    if (editingId) {
      updateModule(editingId, { name: name.trim(), description: description.trim(), owner: owner.trim(), riskLevel });
    } else {
      createModule(name.trim(), description.trim(), owner.trim(), riskLevel);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setOwner("");
    setRiskLevel("Medium");
    setEditingId(null);
    setDialogOpen(false);
  };

  const startEdit = (id: string) => {
    const mod = modules.find((m) => m.id === id);
    if (!mod) return;
    setEditingId(id);
    setName(mod.name);
    setDescription(mod.description);
    setOwner(mod.owner);
    setRiskLevel(mod.riskLevel);
    setDialogOpen(true);
  };

  /** Opens the delete confirmation dialog for a specific module. */
  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  /** Executes the delete action and closes the dialog. */
  const confirmDelete = () => {
    if (deletingId) {
      deleteModule(deletingId);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const getTaskCount = (moduleId: string) => tasks.filter((t) => t.moduleId === moduleId).length;
  const getUncontrolledCount = (moduleId: string) => tasks.filter((t) => t.moduleId === moduleId && getTaskControlStatus(t) === "Uncontrolled").length;

  const deletingMod = deletingId ? modules.find((m) => m.id === deletingId) : null;
  const deletingTaskCount = deletingId ? getTaskCount(deletingId) : 0;

  /* KPI summary across all modules */
  const overallKpi = useMemo(() => {
    if (modules.length === 0) return 0;
    const total = modules.reduce((acc, m) => acc + getModuleKpiScore(m.id), 0);
    return Math.round((total / modules.length) * 10) / 10;
  }, [modules, getModuleKpiScore]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Process Registry</h1>
              <InfoTooltip
                title="Process Registry"
                description="The Process Registry is the central database of all business modules (processes) in your organization. Each module groups related tasks that form a complete workflow."
                tip="Start by mapping your core business processes. Each process should have a clear owner, risk assessment, and defined tasks with inputs/outputs."
                side="bottom"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Centralized database of all business modules and operations
            </p>
          </div>
          <EzButton onClick={() => setDialogOpen(true)} icon={<Plus className="h-4 w-4" />}>
            New Module
          </EzButton>
        </div>

        {/* Overall KPI Banner */}
        {modules.length > 0 && (
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
              <h3 className="text-sm font-semibold">Organization KPI Overview</h3>
                <InfoTooltip
                  title="KPI Overview"
                  description="Key Performance Indicators track completion across all processes. Each task carries equal weight within its module. The aggregate score drives RAG (Red-Amber-Green) alerts."
                  tip="Green ≥ 75% completion, Amber ≥ 40%, Red < 40%. Use this to identify underperforming processes and prioritize corrective actions."
                  side="bottom"
                  iconSize={12}
                />
                <p className="text-xs text-muted-foreground">
                  Aggregate completion across all modules — {overallKpi}%
                </p>
              </div>
              <span className="ml-auto text-2xl font-bold text-primary">{overallKpi}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(overallKpi, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <EzDialog
          open={dialogOpen}
          onOpenChange={(open) => { if (!open) resetForm(); }}
          title={editingId ? "Edit Module" : "Create Module"}
        >
          <div className="space-y-4 py-2">
            <EzInput
              label="Name"
              placeholder="e.g. Maintenance Operations"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <EzTextarea
              label="Description"
              placeholder="Detailed description of this module's scope, responsibilities, and objectives…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <EzInput
              label="Owner (Role)"
              placeholder="e.g. Maintenance Manager"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
            />
            <EzSelect
              label="Risk Level"
              options={RISK_OPTIONS}
              value={riskLevel}
              onValueChange={(v) => setRiskLevel(v as RiskLevel)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <EzButton variant="outlined" onClick={resetForm}>Cancel</EzButton>
            <EzButton onClick={handleSave} disabled={!name.trim() || !owner.trim()}>
              {editingId ? "Update" : "Create"}
            </EzButton>
          </div>
        </EzDialog>

        {/* Grid */}
        {modules.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-4">No modules registered yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create a module to start building your process registry</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod) => {
              const taskCount = getTaskCount(mod.id);
              const uncontrolled = getUncontrolledCount(mod.id);
              const kpiScore = getModuleKpiScore(mod.id);
              const rag = getModuleRagStatus(mod.id);
              const ragStyle = RAG_COLORS[rag];
              return (
                <div
                  key={mod.id}
                  className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
                  onClick={() => navigateToTasks(mod.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">{mod.name}</h3>
                        <InfoTooltip
                          title={mod.name}
                          description={mod.description || "No description provided for this module."}
                          tip={`Owner: ${mod.owner} · Risk: ${mod.riskLevel} · Created: ${mod.createdAt}`}
                          side="bottom"
                          iconSize={12}
                        />
                        {mod.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{mod.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <RiskBadge level={mod.riskLevel} />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{mod.owner}</span>
                    </div>
                  </div>

                  {/* KPI Progress Bar */}
                  {taskCount > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn("font-medium", ragStyle.text)}>
                          KPI: {kpiScore}%
                        </span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                          rag === "Green" && "bg-emerald-100 text-emerald-700",
                          rag === "Amber" && "bg-amber-100 text-amber-700",
                          rag === "Red" && "bg-red-100 text-red-700",
                        )}>
                          {ragStyle.label}
                        </span>
                      </div>
                      <div className={cn("h-1.5 rounded-full overflow-hidden", ragStyle.track)}>
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", ragStyle.bg)}
                          style={{ width: `${Math.min(kpiScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ListTodo className="h-3.5 w-3.5" />
                        <span>{taskCount} Task{taskCount !== 1 ? "s" : ""}</span>
                      </div>
                      {uncontrolled > 0 && (
                        <ControlStatusBadge status="Uncontrolled" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <EzButton
                        variant="text"
                        size="small"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); startEdit(mod.id); }}
                        icon={<Pencil className="h-3.5 w-3.5" />}
                        aria-label="Edit"
                      />
                      <EzButton
                        variant="text"
                        severity="danger"
                        size="small"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); openDeleteDialog(mod.id); }}
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        aria-label="Delete"
                      />
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation */}
        <EzAlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => { if (!open) setDeleteDialogOpen(false); }}
          title={`Delete "${deletingMod?.name}"?`}
          description={`This will delete the module and all ${deletingTaskCount} associated task${deletingTaskCount !== 1 ? "s" : ""}. This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialogOpen(false)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      </div>
    </div>
  );
}
