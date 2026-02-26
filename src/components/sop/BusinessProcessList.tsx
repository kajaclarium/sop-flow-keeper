import { useState } from "react";
import { useSOP } from "@/contexts/SOPContext";
import { EzButton, EzInput, EzDialog, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  Plus, FolderOpen, Pencil, Trash2, ArrowRight, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Lists all business processes as cards, with create/edit/delete capabilities. */
export function BusinessProcessList() {
  const { businessProcesses, sops, createBusinessProcess, updateBusinessProcess, deleteBusinessProcess, navigateToProcessSops } = useSOP();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Saves a new or edited business process. */
  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateBusinessProcess(editingId, { name: name.trim(), description: description.trim() });
    } else {
      createBusinessProcess(name.trim(), description.trim());
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
    setDialogOpen(false);
  };

  const startEdit = (id: string) => {
    const bp = businessProcesses.find((b) => b.id === id);
    if (!bp) return;
    setEditingId(id);
    setName(bp.name);
    setDescription(bp.description);
    setDialogOpen(true);
  };

  /** Opens the delete confirmation dialog for a specific business process. */
  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  /** Executes the delete action and closes the dialog. */
  const confirmDelete = () => {
    if (deletingId) {
      deleteBusinessProcess(deletingId);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const getSopCount = (processId: string) => sops.filter((s) => s.businessProcessId === processId).length;
  const deletingBp = deletingId ? businessProcesses.find((b) => b.id === deletingId) : null;
  const deletingSopCount = deletingId ? getSopCount(deletingId) : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Business Processes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your SOPs by department or business process
            </p>
          </div>
          <EzButton onClick={() => setDialogOpen(true)} icon={<Plus className="h-4 w-4" />}>
            New Process
          </EzButton>
        </div>

        {/* Create/Edit Dialog */}
        <EzDialog
          open={dialogOpen}
          onOpenChange={(isOpen) => { if (!isOpen) resetForm(); }}
          title={editingId ? "Edit Business Process" : "Create Business Process"}
        >
          <div className="space-y-4 py-2">
            <EzInput
              label="Name"
              placeholder="e.g. Facility Management"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <EzInput
              label="Description"
              placeholder="Brief description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <EzButton variant="outlined" onClick={resetForm}>Cancel</EzButton>
            <EzButton onClick={handleSave} disabled={!name.trim()}>
              {editingId ? "Update" : "Create"}
            </EzButton>
          </div>
        </EzDialog>

        {/* Grid */}
        {businessProcesses.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-4">No business processes yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create one to start organizing your SOPs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessProcesses.map((bp) => {
              const count = getSopCount(bp.id);
              return (
                <div
                  key={bp.id}
                  className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
                  onClick={() => navigateToProcessSops(bp.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">{bp.name}</h3>
                        {bp.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{bp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{count} SOP{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EzButton
                        variant="text"
                        size="small"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); startEdit(bp.id); }}
                        icon={<Pencil className="h-3.5 w-3.5" />}
                        aria-label="Edit"
                      />
                      <EzButton
                        variant="text"
                        severity="danger"
                        size="small"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); openDeleteDialog(bp.id); }}
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
          onOpenChange={(isOpen) => { if (!isOpen) setDeleteDialogOpen(false); }}
          title={`Delete "${deletingBp?.name}"?`}
          description={`This will delete the business process and unlink ${deletingSopCount} SOP${deletingSopCount !== 1 ? "s" : ""}. The SOPs themselves won't be deleted.`}
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
