import { useState, useMemo } from "react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { RiskLevel, TaskIO, IOType } from "@/types/workInventory";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, ListTodo, User, ArrowDownToLine, ArrowUpFromLine, FileText, ChevronDown,
  Eye, Pencil, Trash2, Link2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
const IO_TYPES: IOType[] = ["document", "material", "data", "approval", "other"];
const RISK_FILTERS: (RiskLevel | "All")[] = ["All", "Low", "Medium", "High", "Critical"];

const AVAILABLE_SOPS = [
  { id: "SOP-001", title: "Facility Cleaning Protocol" },
  { id: "SOP-002", title: "Equipment Calibration Procedure" },
  { id: "SOP-003", title: "Incident Response Plan" },
  { id: "SOP-004", title: "Chemical Waste Disposal" },
  { id: "SOP-005", title: "Employee Onboarding Checklist" },
  { id: "SOP-006", title: "Data Backup & Recovery" },
];

function IOEditor({ items, onChange, direction }: { items: TaskIO[]; onChange: (items: TaskIO[]) => void; direction: "input" | "output" }) {
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
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {direction === "input" ? "Inputs" : "Outputs"}
        </label>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addItem}>
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-2 rounded-lg border p-2.5 bg-muted/30">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Label"
              value={item.label}
              onChange={(e) => updateItem(item.id, { label: e.target.value })}
              className="h-8 text-xs"
            />
            <div className="flex gap-2">
              <Select value={item.type} onValueChange={(v) => updateItem(item.id, { type: v as IOType })}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IO_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                className="h-8 text-xs flex-1"
              />
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={() => removeItem(item.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No {direction}s defined</p>
      )}
    </div>
  );
}

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
    setName(""); setDescription(""); setOwner(""); setRiskLevel("Medium");
    setInputs([]); setOutputs([]); setLinkedSopIds([]);
    setEditingId(null); setDialogOpen(false);
  };

  const startEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setEditingId(id); setName(task.name); setDescription(task.description); setOwner(task.owner);
    setRiskLevel(task.riskLevel); setInputs([...task.inputs]); setOutputs([...task.outputs]);
    setLinkedSopIds([...task.linkedSopIds]); setDialogOpen(true);
  };

  const toggleSopLink = (sopId: string) => {
    setLinkedSopIds((prev) => prev.includes(sopId) ? prev.filter((id) => id !== sopId) : [...prev, sopId]);
  };

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
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1.5">
            {RISK_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  riskFilter === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 ml-auto">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "Create"} Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                    <Input placeholder="e.g. Preventive Maintenance" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Owner <span className="text-destructive">*</span></label>
                    <Input placeholder="e.g. Maintenance Technician" value={owner} onChange={(e) => setOwner(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Task description…" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Level</label>
                  <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RISK_LEVELS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <IOEditor items={inputs} onChange={setInputs} direction="input" />
                <IOEditor items={outputs} onChange={setOutputs} direction="output" />

                {/* SOP Linking */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Link SOPs
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_SOPS.map((sop) => {
                      const isLinked = linkedSopIds.includes(sop.id);
                      return (
                        <button
                          key={sop.id}
                          type="button"
                          onClick={() => toggleSopLink(sop.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-colors",
                            isLinked ? "border-primary bg-primary/5 text-foreground" : "border-border bg-muted/30 text-muted-foreground hover:bg-accent"
                          )}
                        >
                          <FileText className={cn("h-3.5 w-3.5 shrink-0", isLinked ? "text-primary" : "")} />
                          <div className="min-w-0">
                            <span className="font-mono text-[10px]">{sop.id}</span>
                            <p className="truncate">{sop.title}</p>
                          </div>
                        </button>
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
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSave} disabled={!name.trim() || !owner.trim()}>
                  {editingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigateToTaskDetail(task.id)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => startEdit(task.id)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{task.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this task. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTask(task.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
