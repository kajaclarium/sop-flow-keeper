import { useState } from "react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { RiskLevel } from "@/types/workInventory";
import { RiskBadge } from "./RiskBadge";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Layers, Pencil, Trash2, ArrowRight, ListTodo, User,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];

export function ModuleList() {
  const { modules, tasks, createModule, updateModule, deleteModule, navigateToTasks, getTaskControlStatus } = useWorkInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Medium");

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
    setName(""); setDescription(""); setOwner(""); setRiskLevel("Medium"); setEditingId(null); setDialogOpen(false);
  };

  const startEdit = (id: string) => {
    const mod = modules.find((m) => m.id === id);
    if (!mod) return;
    setEditingId(id); setName(mod.name); setDescription(mod.description); setOwner(mod.owner); setRiskLevel(mod.riskLevel); setDialogOpen(true);
  };

  const getTaskCount = (moduleId: string) => tasks.filter((t) => t.moduleId === moduleId).length;
  const getUncontrolledCount = (moduleId: string) => tasks.filter((t) => t.moduleId === moduleId && getTaskControlStatus(t) === "Uncontrolled").length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Process Registry</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Centralized database of all business modules and operations
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "Create"} Module</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                  <Input placeholder="e.g. Maintenance Operations" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Brief description of this module…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner (Role) <span className="text-destructive">*</span></label>
                  <Input placeholder="e.g. Maintenance Manager" value={owner} onChange={(e) => setOwner(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Level</label>
                  <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_LEVELS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); startEdit(mod.id); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{mod.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the module and all {taskCount} associated task{taskCount !== 1 ? "s" : ""}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteModule(mod.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
