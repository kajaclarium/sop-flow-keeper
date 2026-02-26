import { useState, useMemo } from "react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { RiskLevel, TaskIO, IOType } from "@/types/workInventory";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { EzButton, EzInput, EzTextarea, EzSelect, EzDialog, EzMenu, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  Plus, Search, ListTodo, User, ArrowDownToLine, ArrowUpFromLine, FileText, ChevronDown,
  Eye, Pencil, Trash2, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
const IO_TYPES: IOType[] = ["document", "material", "data", "approval", "other"];
const RISK_FILTERS: (RiskLevel | "All")[] = ["All", "Low", "Medium", "High", "Critical"];

/** Risk level options formatted for EzSelect. */
const RISK_OPTIONS = RISK_LEVELS.map((r) => ({ label: r, value: r }));

/** I/O type options formatted for EzSelect. */
const IO_TYPE_OPTIONS = IO_TYPES.map((t) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }));

const AVAILABLE_SOPS = [
  { id: "SOP-001", title: "Facility Cleaning Protocol" },
  { id: "SOP-002", title: "Equipment Calibration Procedure" },
  { id: "SOP-003", title: "Incident Response Plan" },
  { id: "SOP-004", title: "Chemical Waste Disposal" },
  { id: "SOP-005", title: "Employee Onboarding Checklist" },
  { id: "SOP-006", title: "Data Backup & Recovery" },
];

interface IOEditorProps {
  items: TaskIO[];
  onChange: (items: TaskIO[]) => void;
  direction: "input" | "output";
}

/** Editable list of input or output items for a task definition. */
function IOEditor({ items, onChange, direction }: IOEditorProps) {
  const addItem = () => {
    onChange([...items, { id: crypto.randomUUID(), label: "", type: "data", description: "" }]);
  };
  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));
  const updateItem = (id: string, updates: Partial<TaskIO>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const Icon = direction === "input" ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {direction === "input" ? "Inputs" : "Outputs"}
        </span>
        <EzButton type="button" variant="text" size="small" onClick={addItem} icon={<Plus className="h-3 w-3" />}>
          Add
        </EzButton>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-2 rounded-lg border p-2.5 bg-muted/30">
          <div className="flex-1 space-y-2">
            <EzInput
              placeholder="Label"
              value={item.label}
              onChange={(e) => updateItem(item.id, { label: e.target.value })}
              className="h-8 text-xs"
            />
            <div className="flex gap-2">
              <EzSelect
                options={IO_TYPE_OPTIONS}
                value={item.type}
                onValueChange={(v) => updateItem(item.id, { type: v as IOType })}
                className="h-8 text-xs w-28"
              />
              <EzInput
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                className="h-8 text-xs flex-1"
              />
            </div>
          </div>
          <EzButton
            type="button"
            variant="text"
            severity="danger"
            size="small"
            onClick={() => removeItem(item.id)}
            icon={<Trash2 className="h-3 w-3" />}
            aria-label="Remove"
          />
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No {direction}s defined</p>
      )}
    </div>
  );
}

/** Lists all tasks for a selected module with search, risk filtering, and CRUD actions. */
export function TaskList() {
  const {
    tasks, getSelectedModule, createTask, updateTask, deleteTask,
    navigateToTaskDetail, getTaskControlStatus, selectedModuleId,
  } = useWorkInventory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Medium");
  const [inputs, setInputs] = useState<TaskIO[]>([]);
  const [outputs, setOutputs] = useState<TaskIO[]>([]);
  const [linkedSopIds, setLinkedSopIds] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const module = getSelectedModule();
  const moduleTasks = useMemo(() => tasks.filter((t) => t.moduleId === selectedModuleId), [tasks, selectedModuleId]);

  const filtered = useMemo(() => {
    return moduleTasks.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter === "All" || t.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [moduleTasks, search, riskFilter]);

  const stats = useMemo(() => ({
    total: moduleTasks.length,
    controlled: moduleTasks.filter((t) => getTaskControlStatus(t) === "Controlled").length,
    uncontrolled: moduleTasks.filter((t) => getTaskControlStatus(t) === "Uncontrolled").length,
    critical: moduleTasks.filter((t) => t.riskLevel === "Critical").length,
  }), [moduleTasks, getTaskControlStatus]);

  /** Saves a new or edited task. */
  const handleSave = () => {
    if (!name.trim() || !owner.trim() || !selectedModuleId) return;
    if (editingId) {
      updateTask(editingId, { name: name.trim(), description: description.trim(), owner: owner.trim(), riskLevel, inputs, outputs, linkedSopIds });
    } else {
      createTask(selectedModuleId, name.trim(), description.trim(), owner.trim(), riskLevel, inputs, outputs, linkedSopIds);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setOwner("");
    setRiskLevel("Medium");
    setInputs([]);
    setOutputs([]);
    setLinkedSopIds([]);
    setEditingId(null);
    setDialogOpen(false);
  };

  const startEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setEditingId(id);
    setName(task.name);
    setDescription(task.description);
    setOwner(task.owner);
    setRiskLevel(task.riskLevel);
    setInputs([...task.inputs]);
    setOutputs([...task.outputs]);
    setLinkedSopIds([...task.linkedSopIds]);
    setDialogOpen(true);
  };

  const toggleSopLink = (sopId: string) => {
    setLinkedSopIds((prev) => prev.includes(sopId) ? prev.filter((id) => id !== sopId) : [...prev, sopId]);
  };

  /** Opens the delete confirmation dialog for a specific task. */
  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  /** Executes the delete action and closes the dialog. */
  const confirmDelete = () => {
    if (deletingId) {
      deleteTask(deletingId);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const deletingTask = deletingId ? tasks.find((t) => t.id === deletingId) : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {module && <h2 className="text-lg font-semibold">{module.name}</h2>}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Tasks", value: stats.total, color: "text-foreground" },
            { label: "Controlled", value: stats.controlled, color: "text-emerald-600" },
            { label: "Uncontrolled", value: stats.uncontrolled, color: "text-red-600" },
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
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
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
          <EzButton onClick={() => setDialogOpen(true)} className="ml-auto" icon={<Plus className="h-4 w-4" />}>
            Add Task
          </EzButton>
        </div>

        {/* Create/Edit Task Dialog */}
        <EzDialog
          open={dialogOpen}
          onOpenChange={(isOpen) => { if (!isOpen) resetForm(); }}
          title={editingId ? "Edit Task" : "Create Task"}
          className="max-w-2xl"
        >
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <EzInput label="Name" placeholder="e.g. Preventive Maintenance" value={name} onChange={(e) => setName(e.target.value)} required />
              <EzInput label="Owner" placeholder="e.g. Maintenance Technician" value={owner} onChange={(e) => setOwner(e.target.value)} required />
            </div>
            <EzTextarea label="Description" placeholder="Task description…" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            <EzSelect label="Risk Level" options={RISK_OPTIONS} value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)} />

            <IOEditor items={inputs} onChange={setInputs} direction="input" />
            <IOEditor items={outputs} onChange={setOutputs} direction="output" />

            {/* SOP Linking */}
            <div className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                Link SOPs
              </span>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_SOPS.map((sop) => {
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
              </div>
              {linkedSopIds.length === 0 && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  No SOPs linked — task will be flagged as Uncontrolled
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

        {/* Task List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <ListTodo className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mt-3">No tasks found</p>
            </div>
          ) : (
            filtered.map((task) => {
              const controlStatus = getTaskControlStatus(task);
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-xl border bg-card transition-all hover:shadow-sm cursor-pointer group",
                    controlStatus === "Uncontrolled" && "border-red-200/60 bg-red-50/20"
                  )}
                  onClick={() => navigateToTaskDetail(task.id)}
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
                    <ListTodo className="h-4 w-4 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{task.name}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <User className="h-3 w-3" /> {task.owner}
                  </div>

                  <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <ArrowDownToLine className="h-3 w-3" /> {task.inputs.length}
                    <ArrowUpFromLine className="h-3 w-3 ml-1" /> {task.outputs.length}
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Link2 className="h-3 w-3" />
                    {task.linkedSopIds.length} SOP{task.linkedSopIds.length !== 1 ? "s" : ""}
                  </div>

                  <RiskBadge level={task.riskLevel} />
                  <ControlStatusBadge status={controlStatus} />

                  <div onClick={(e) => e.stopPropagation()}>
                    <EzMenu
                      trigger={
                        <EzButton variant="text" className="shrink-0 opacity-0 group-hover:opacity-100" icon={<ChevronDown className="h-4 w-4" />} aria-label="Actions" />
                      }
                      items={[
                        { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => navigateToTaskDetail(task.id) },
                        { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => startEdit(task.id) },
                        { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => openDeleteDialog(task.id) },
                      ]}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation */}
        <EzAlertDialog
          open={deleteDialogOpen}
          onOpenChange={(isOpen) => { if (!isOpen) setDeleteDialogOpen(false); }}
          title={`Delete "${deletingTask?.name}"?`}
          description="This will permanently delete this task. This action cannot be undone."
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
