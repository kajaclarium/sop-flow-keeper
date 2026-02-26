import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EzButton, EzAlertDialog } from "@clarium/ezui-react-components";
import { Plus, Network, Building2, ShieldCheck, Boxes, Crown, Users } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { DWMTopBar } from "@/components/organization/DWMTopBar";
import { OrgTree } from "@/components/organization/OrgTree";
import { CreateDepartmentPanel } from "@/components/organization/CreateDepartmentPanel";
import { cn } from "@/lib/utils";

/** Landing page for DWM — shows the global org structure hub with a department tree. */
export function DWMLanding() {
  const { departments, roles, deleteDepartment, getDepartmentById } = useOrganization();
  const navigate = useNavigate();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Opens the slide panel in create mode. */
  const openCreatePanel = () => {
    setEditingId(null);
    setPanelOpen(true);
  };

  /** Opens the slide panel in edit mode for a specific department. */
  const handleEdit = (id: string) => {
    setEditingId(id);
    setPanelOpen(true);
  };

  /** Opens the delete confirmation dialog. */
  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  /** Executes the department deletion and closes the dialog. */
  const confirmDelete = () => {
    if (deletingId) {
      deleteDepartment(deletingId);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const deletingDept = deletingId ? getDepartmentById(deletingId) : null;
  const hasAnyDepartments = departments.length > 0;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <DWMTopBar />

      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <div className="min-w-fit px-6 py-8">
          {/* Page header */}
          <div className="max-w-5xl mx-auto flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Organization Structure</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage departments and visualize your organizational hierarchy
              </p>
            </div>
            <EzButton onClick={openCreatePanel} icon={<Plus className="h-4 w-4" />}>
              Create Department
            </EzButton>
          </div>

          {/* ===== Central Org Tree Visualization ===== */}
          <div className="flex flex-col items-center w-full">
            {/* Root node: Global Organizational Structure — clicks → Org Structure screen */}
            <div
              className={cn(
                "relative flex flex-col items-center rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-primary/5",
                "shadow-lg px-8 py-6 cursor-pointer transition-all duration-200",
                "hover:shadow-xl hover:border-primary/50 hover:-translate-y-0.5",
                "min-w-[280px]"
              )}
              onClick={() => navigate("/org-structure")}
            >
              {/* Decorative glow ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-primary/10 blur-sm -z-10" />

              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/15 mb-3">
                <Network className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground text-center">Global Organizational Structure</h2>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Click to manage RACI Role Catalog
              </p>

              {/* Stat pills */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
                  <Building2 className="h-3 w-3" />
                  <span>{departments.length} Department{departments.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-xs font-medium text-violet-600">
                  <Crown className="h-3 w-3" />
                  <span>{roles.length} Role{roles.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* Org tree growing below the root */}
            {hasAnyDepartments && (
              <OrgTree onEdit={handleEdit} onDelete={handleDeleteRequest} />
            )}

            {/* Empty state when no departments exist */}
            {!hasAnyDepartments && (
              <div className="flex flex-col items-center mt-10">
                <div className="w-px h-8 bg-border" />
                <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 px-10 py-8 text-center">
                  <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mt-3">No departments yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Create your first department to build the organizational tree
                  </p>
                  <EzButton onClick={openCreatePanel} icon={<Plus className="h-4 w-4" />} variant="outlined">
                    Create Department
                  </EzButton>
                </div>
              </div>
            )}

            {/* Legend / key */}
            {hasAnyDepartments && (
              <div className="flex items-center gap-6 mt-8 px-4 py-3 rounded-lg bg-muted/40 border">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Click department → SOP &amp; Work Inventory</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  <span>SOP Management</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Boxes className="h-3 w-3" />
                  <span>Work Inventory</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Panel */}
      <CreateDepartmentPanel
        isOpen={panelOpen}
        onClose={() => { setPanelOpen(false); setEditingId(null); }}
        editingId={editingId}
      />

      {/* Delete Confirmation */}
      <EzAlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => { if (!open) setDeleteDialogOpen(false); }}
        title={`Delete "${deletingDept?.name}"?`}
        description="This department will be removed. Any child departments will be moved up to the parent level."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
