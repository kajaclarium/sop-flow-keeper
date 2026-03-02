import { useState, useMemo } from "react";
import { useWorkInventory, AVAILABLE_SOPS } from "@/contexts/WorkInventoryContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { RiskLevel, WorkOperation } from "@/types/workInventory";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EzButton, EzInput, EzTextarea, EzSelect, EzDialog, EzMenu, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  Plus, Search, ListTodo, User, ArrowDownToLine, ArrowUpFromLine, FileText, ChevronDown,
  Eye, Pencil, Trash2, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
const RISK_FILTERS: (RiskLevel | "All")[] = ["All", "Low", "Medium", "High", "Critical"];

/** Risk level options formatted for EzSelect. */
const RISK_OPTIONS = RISK_LEVELS.map((r) => ({ label: r, value: r }));

/** Lists all tasks for a selected module with search, risk filtering, KPI tracking, and CRUD actions. */
export function TaskList() {
  const {
    tasks, operations, getSelectedModule, createTask, updateTask, deleteTask,
    createOperation, updateOperation, deleteOperation,
    navigateToTaskDetail, getTaskControlStatus, selectedModuleId, selectedTaskId, selectedOperationId,
    setSelectedOperationId,
  } = useWorkInventory();
  const { getRoleOptions } = useOrganization();

  const module = getSelectedModule();
  
  /** Role options from org structure for the owner dropdown. 
   * Filtered by current department or strategic tier roles.
   */
  const { roles: allOrgRoles, tiers: orgTiers } = useOrganization();
  const roleOptions = useMemo(() => {
    if (!module) return [];
    return allOrgRoles
      .filter(r => !r.departmentId || r.departmentId === module.departmentId || r.tierId === "strategic")
      .map((r) => {
        const tier = orgTiers.find((t) => t.id === r.tierId);
        return { label: `${r.name} — ${tier?.name ?? r.tierId}`, value: r.name };
      });
  }, [allOrgRoles, orgTiers, module]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Operation Dialog State
  const [opDialogOpen, setOpDialogOpen] = useState(false);
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [opName, setOpName] = useState("");
  const [opDescription, setOpDescription] = useState("");

  // Task Dialog State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Medium");
  const [linkedSopIds, setLinkedSopIds] = useState<string[]>([]);
  const [sopSearch, setSopSearch] = useState("");

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");

  const moduleTasks = useMemo(() => tasks.filter((t) => t.moduleId === selectedModuleId), [tasks, selectedModuleId]);
  const moduleOperations = useMemo(() => operations.filter((o) => o.moduleId === selectedModuleId), [operations, selectedModuleId]);

  const filtered = useMemo(() => {
    return moduleTasks.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter === "All" || t.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [moduleTasks, search, riskFilter]);

  const stats = useMemo(() => {
    return {
      operations: moduleOperations.length,
      total: moduleTasks.length,
      controlled: moduleTasks.filter((t) => getTaskControlStatus(t) === "SOP Mapped").length,
      uncontrolled: moduleTasks.filter((t) => getTaskControlStatus(t) === "SOP Unmapped").length,
      critical: moduleTasks.filter((t) => t.riskLevel === "Critical").length,
    }
  }, [moduleTasks, moduleOperations, getTaskControlStatus]);

  /** Filter SOPs based on search query — matches ID or title. */
  const filteredSops = useMemo(() => {
    if (!sopSearch.trim()) return AVAILABLE_SOPS;
    const q = sopSearch.toLowerCase();
    return AVAILABLE_SOPS.filter((s) =>
      s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
    );
  }, [sopSearch]);


  /** Saves a new or edited task. */
  const handleSave = () => {
    if (!name.trim() || !owner.trim() || !selectedModuleId) return;
    if (editingId) {
      updateTask(editingId, { name: name.trim(), operationId: selectedOperationId || undefined, description: description.trim(), owner: owner.trim(), riskLevel, linkedSopIds });
    } else {
      createTask(selectedModuleId, name.trim(), description.trim(), owner.trim(), riskLevel, linkedSopIds, selectedOperationId || undefined);
    }
    resetForm();
  };

  /** Saves a new or edited operation. */
  const handleSaveOp = () => {
    if (!opName.trim() || !selectedModuleId) return;
    if (editingOpId) {
      updateOperation(editingOpId, { name: opName.trim(), description: opDescription.trim() });
    } else {
      createOperation(selectedModuleId, opName.trim(), opDescription.trim());
    }
    resetOpForm();
  };

  const resetForm = () => {
    setName("");
    setSelectedOperationId(null);
    setDescription("");
    setOwner("");
    setRiskLevel("Medium");
    setLinkedSopIds([]);
    setSopSearch("");
    setEditingId(null);
    setDialogOpen(false);
  };

  const resetOpForm = () => {
    setOpName("");
    setOpDescription("");
    setEditingOpId(null);
    setOpDialogOpen(false);
  };

  const startEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setEditingId(id);
    setName(task.name);
    setSelectedOperationId(task.operationId || null);
    setDescription(task.description);
    setOwner(task.owner);
    setRiskLevel(task.riskLevel);
    setLinkedSopIds([...task.linkedSopIds]);
    setSopSearch("");
    setDialogOpen(true);
  };

  const startEditOp = (id: string) => {
    const op = moduleOperations.find((o) => o.id === id);
    if (!op) return;
    setEditingOpId(op.id);
    setOpName(op.name);
    setOpDescription(op.description);
    setOpDialogOpen(true);
  };

  const startAddTaskToOp = (opId: string) => {
    resetForm();
    setSelectedOperationId(opId);
    setDialogOpen(true);
  };

  const toggleSopLink = (sopId: string) => {
    setLinkedSopIds((prev) => prev.includes(sopId) ? prev.filter((id) => id !== sopId) : [...prev, sopId]);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingType, setDeletingType] = useState<"task" | "operation" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Opens the delete confirmation dialog. */
  const openDeleteDialog = (type: "task" | "operation", id: string) => {
    setDeletingType(type);
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  /** Executes the delete action and closes the dialog. */
  const confirmDelete = () => {
    if (deletingId) {
      if (deletingType === "task") deleteTask(deletingId);
      if (deletingType === "operation") deleteOperation(deletingId);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
    setDeletingType(null);
  };

  const deletingItemName = deletingType === "task" 
    ? tasks.find((t) => t.id === deletingId)?.name 
    : deletingType === "operation" 
      ? operations.find((o) => o.id === deletingId)?.name 
      : "";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Module Header with Description */}
        {module && (
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{module.name}</h2>
                  <InfoTooltip
                    title={module.name}
                    description={module.description || "No description available."}
                    tip={`This process contains ${moduleTasks.length} task(s). Each task must have linked SOPs (SOP Mapped) or it will be flagged as SOP Unmapped.`}
                    side="bottom"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{module.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <RiskBadge level={module.riskLevel} />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{module.owner}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Operations", value: stats.operations, color: "text-foreground" },
            { label: "Total Tasks", value: stats.total, color: "text-foreground" },
            { label: "SOP Mapped", value: stats.controlled, color: "text-emerald-600" },
            { label: "SOP Unmapped", value: stats.uncontrolled, color: "text-red-600" },
            { label: "Critical Risk", value: stats.critical, color: "text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <EzInput
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {RISK_FILTERS.map((r) => (
              <EzButton
                key={r}
                variant={riskFilter === r ? "classic" : "text"}
                severity={riskFilter === r ? "primary" : undefined}
                size="small"
                onClick={() => setRiskFilter(r)}
              >
                {r}
              </EzButton>
            ))}
          </div>
          <EzButton onClick={() => setOpDialogOpen(true)} className="ml-auto" icon={<Plus className="h-4 w-4" />}>
            New Operation
          </EzButton>
        </div>

        {/* Create/Edit Operation Dialog */}
        <EzDialog
          open={opDialogOpen}
          onOpenChange={(open) => { if (!open) resetOpForm(); }}
          title={editingOpId ? "Edit Operation" : "Create Operation"}
        >
          <div className="space-y-4 py-2">
            <EzInput label="Name" placeholder="e.g. Screening" value={opName} onChange={(e) => setOpName(e.target.value)} required />
            <EzTextarea label="Description" placeholder="Operation description…" value={opDescription} onChange={(e) => setOpDescription(e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <EzButton variant="outlined" onClick={resetOpForm}>Cancel</EzButton>
            <EzButton onClick={handleSaveOp} disabled={!opName.trim()}>
              {editingOpId ? "Update" : "Create"}
            </EzButton>
          </div>
        </EzDialog>

        {/* Create/Edit Task Dialog */}
        <EzDialog
          open={dialogOpen}
          onOpenChange={(open) => { if (!open) resetForm(); }}
          title={editingId ? "Edit Task" : "Create Task"}
          className="max-w-2xl"
        >
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <EzInput label="Name" placeholder="e.g. Preventive Maintenance" value={name} onChange={(e) => setName(e.target.value)} required />
              <EzSelect label="Operation" placeholder="Select an operation (optional)" options={moduleOperations.map(o => ({ label: o.name, value: o.id }))} value={selectedOperationId || undefined} onValueChange={(v) => setSelectedOperationId(v as string)} searchable clearable />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <EzSelect label="Owner (Role)" placeholder="Select a role" options={roleOptions} value={owner || undefined} onValueChange={(v) => setOwner(v as string)} searchable clearable />
              <EzSelect label="Risk Level" options={RISK_OPTIONS} value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)} />
            </div>
            <EzTextarea 
              label="Description" 
              placeholder="Describe the task steps and expectations..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
            />

            {/* SOP Linking with Search */}
            <div className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                Link SOPs
              </span>
              <EzInput
                placeholder="Search SOPs by ID or title…"
                value={sopSearch}
                onChange={(e) => setSopSearch(e.target.value)}
                suffix={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                className="text-xs"
              />
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {filteredSops.map((sop) => {
                  const isLinked = linkedSopIds.includes(sop.id);
                  return (
                    <EzButton
                      key={sop.id}
                      type="button"
                      variant={isLinked ? "outlined" : "text"}
                      severity={isLinked ? "primary" : undefined}
                      onClick={() => toggleSopLink(sop.id)}
                      className={cn(
                        "flex items-center gap-2 text-xs text-left justify-start h-auto py-2",
                        !isLinked && "border border-border bg-muted/30"
                      )}
                    >
                      <FileText className={cn("h-3.5 w-3.5 shrink-0", isLinked ? "text-primary" : "")} />
                      <div className="min-w-0">
                        <span className="font-mono text-[10px]">{sop.id}</span>
                        <p className="truncate">{sop.title}</p>
                      </div>
                    </EzButton>
                  );
                })}
                {filteredSops.length === 0 && (
                  <p className="col-span-2 text-xs text-muted-foreground text-center py-3">No SOPs match your search</p>
                )}
              </div>
              {linkedSopIds.length === 0 && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  No SOPs linked — task will be flagged as SOP Unmapped
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <EzButton variant="outlined" onClick={resetForm}>Cancel</EzButton>
            <EzButton onClick={handleSave} disabled={!name.trim() || !owner.trim()}>
              {editingId ? "Update" : "Create"}
            </EzButton>
          </div>
        </EzDialog>

        {/* Task List (Grouped by Operation) */}
        <div className="space-y-4">
          {moduleOperations.length === 0 && filtered.length === 0 ? (
            <div className="text-center py-16">
              <ListTodo className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mt-3">No operations/tasks found</p>
            </div>
          ) : (
            <>
            {moduleOperations.map((op) => {
              const opTasks = filtered.filter(t => t.operationId === op.id);
              // Calculate control counts for operation
              const controlledOpTasks = opTasks.filter(t => getTaskControlStatus(t) === "SOP Mapped").length;

              return (
                <details 
                  key={op.id} 
                  id={`op-${op.id}`}
                  open={selectedOperationId === op.id || !!opTasks.find(t => t.id === selectedTaskId)}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      setSelectedOperationId(op.id);
                    }
                  }}
                  className="group/op rounded-xl border bg-card overflow-hidden"
                >
                  <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors list-none relative">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
                      <ListTodo className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="font-semibold text-sm truncate">{op.name}</div>
                      {op.description && <div className="text-xs text-muted-foreground truncate opacity-80 mt-0.5">{op.description}</div>}
                    </div>
                    
                    {/* Operation Stats & Actions */}
                    <div className="flex items-center gap-4 shrink-0 pr-8">
                        <div className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full border">
                          {opTasks.length} task{opTasks.length !== 1 ? 's' : ''} {opTasks.length > 0 && `(${controlledOpTasks} mapped)`}
                        </div>
                        
                        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                            <EzButton variant="text" size="small" onClick={(e) => { e.stopPropagation(); startEditOp(op.id); }} icon={<Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />} aria-label="Edit Operation" />
                            <EzButton variant="text" size="small" severity="danger" onClick={(e) => { e.stopPropagation(); openDeleteDialog("operation", op.id); }} icon={<Trash2 className="h-3.5 w-3.5" />} aria-label="Delete Operation" />
                            <EzButton size="small" onClick={(e) => { e.stopPropagation(); startAddTaskToOp(op.id); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Task</EzButton>
                        </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open/op:rotate-180 absolute right-4 top-1/2 -translate-y-1/2" />
                  </summary>
                  
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 border-t">
                    {opTasks.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed">No tasks in this operation yet.</div>
                    ) : (
                      opTasks.map((task) => {
                        const controlStatus = getTaskControlStatus(task);
                        const isUnmapped = controlStatus === "SOP Unmapped";

                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "group/task relative flex flex-col gap-1.5 p-3 rounded-lg border bg-card transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer overflow-hidden",
                              isUnmapped ? "border-red-200 bg-red-50/10 hover:bg-red-50/20" : "border-border"
                            )}
                            onClick={() => navigateToTaskDetail(task.id)}
                          >
                            <div className="flex-1 min-w-0 pr-6">
                              <div className="text-[10px] font-bold text-primary/80 leading-none mb-1 uppercase tracking-wider">{task.id}</div>
                              <h4 className="text-sm font-bold leading-tight text-foreground line-clamp-2 group-hover/task:text-primary transition-colors">
                                {task.name}
                              </h4>
                            </div>

                            <div className="absolute top-1 right-1 opacity-0 group-hover/task:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <EzMenu
                                  trigger={
                                    <EzButton variant="text" size="small" className="h-6 w-6 !p-0" icon={<ChevronDown className="h-3 w-3 text-muted-foreground" />} aria-label="Actions" />
                                  }
                                  items={[
                                    { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: () => navigateToTaskDetail(task.id) },
                                    { label: "Edit Task", icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => startEdit(task.id) },
                                    { label: "Delete Task", icon: <Trash2 className="h-3.5 w-3.5 text-red-600" />, onClick: () => openDeleteDialog("task", task.id) },
                                  ]}
                                  align="end"
                                />
                            </div>
                            
                            {/* Unmapped Indicator Dot */}
                            {isUnmapped && (
                              <div className="absolute top-2 right-2 flex h-1.5 w-1.5 pointer-events-none">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </details>
              );
            })}
            
            {/* Unassigned Tasks */}
            {filtered.filter(t => !t.operationId).length > 0 && (
              <details 
                open={selectedOperationId === "unassigned" || filtered.filter(t => !t.operationId).some(t => t.id === selectedTaskId)}
                className="group/op rounded-xl border bg-card overflow-hidden"
              >
                <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors list-none relative">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-500/10 shrink-0">
                        <ListTodo className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 font-semibold text-sm">Unassigned Operations</div>
                    <div className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full border mr-8">
                        {filtered.filter(t => !t.operationId).length} task{filtered.filter(t => !t.operationId).length !== 1 ? 's' : ''}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open/op:rotate-180 absolute right-4 top-1/2 -translate-y-1/2" />
                </summary>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 border-t">
                    {filtered.filter(t => !t.operationId).map((task) => {
                        const controlStatus = getTaskControlStatus(task);
                        const isUnmapped = controlStatus === "SOP Unmapped";

                        return (
                            <div
                              key={task.id}
                              className={cn(
                                "group/task relative flex flex-col gap-1.5 p-3 rounded-lg border bg-card transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer overflow-hidden",
                                isUnmapped ? "border-red-200 bg-red-50/10 hover:bg-red-50/20" : "border-border"
                              )}
                              onClick={() => navigateToTaskDetail(task.id)}
                            >
                              <div className="flex-1 min-w-0 pr-6">
                                <div className="text-[10px] font-bold text-orange-600/80 leading-none mb-1 uppercase tracking-wider">{task.id}</div>
                                <h4 className="text-sm font-bold leading-tight text-foreground line-clamp-2 group-hover/task:text-orange-600 transition-colors">
                                  {task.name}
                                </h4>
                              </div>

                              <div className="absolute top-1 right-1 opacity-0 group-hover/task:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                  <EzMenu
                                    trigger={
                                      <EzButton variant="text" size="small" className="h-6 w-6 !p-0" icon={<ChevronDown className="h-3 w-3 text-muted-foreground" />} aria-label="Actions" />
                                    }
                                    items={[
                                      { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: () => navigateToTaskDetail(task.id) },
                                      { label: "Edit Task", icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => startEdit(task.id) },
                                      { label: "Delete Task", icon: <Trash2 className="h-3.5 w-3.5 text-red-600" />, onClick: () => openDeleteDialog("task", task.id) },
                                    ]}
                                    align="end"
                                  />
                              </div>

                              {isUnmapped && (
                                <div className="absolute top-2 right-2 flex h-1.5 w-1.5 pointer-events-none">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </div>
                              )}
                            </div>
                        );
                    })}
                </div>
              </details>
            )}
            </>
          )}
        </div>

        {/* Delete Confirmation */}
        <EzAlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => { if (!open) setDeleteDialogOpen(false); }}
          title={`Delete "${deletingItemName}"?`}
          description={deletingType === "task" 
            ? "This will permanently delete this task. This action cannot be undone."
            : "This will permanently delete this operation. Tasks within it will become unassigned."}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialogOpen(false)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
