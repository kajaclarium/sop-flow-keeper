import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { RoleTierId, RACIType, RACI_LABELS, RACI_DESCRIPTIONS } from "@/types/organization";
import { EzButton, EzInput, EzSelect, EzDialog, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  Plus, Pencil, Trash2, Shield, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** RACI type select options for role creation/edit. */
const RACI_OPTIONS: Array<{ label: string; value: RACIType }> = [
  { label: "Responsible — Does the work", value: "responsible" },
  { label: "Accountable — Owns the outcome", value: "accountable" },
  { label: "Consulted — Provides input", value: "consulted" },
  { label: "Informed — Kept updated", value: "informed" },
];

/** Color classes per RACI type for badge styling. */
const RACI_BADGE_COLORS: Record<RACIType, string> = {
  responsible: "bg-emerald-100 text-emerald-700",
  accountable: "bg-violet-100 text-violet-700",
  consulted: "bg-blue-100 text-blue-700",
  informed: "bg-amber-100 text-amber-700",
};

interface RoleListProps {
  /** The tier whose roles are displayed. */
  tierId: RoleTierId;
}

/** Displays all roles within a specific tier with create/edit/delete CRUD and RACI badges. */
export function RoleList({ tierId }: RoleListProps) {
  const { tiers, getRolesByTier, createRole, updateRole, deleteRole } = useOrganization();

  const tier = tiers.find((t) => t.id === tierId);
  const tierRoles = getRolesByTier(tierId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [raciType, setRaciType] = useState<RACIType>("responsible");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Saves a new or edited role. */
  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateRole(editingId, { name: name.trim(), description: description.trim(), raciType });
    } else {
      createRole({ name: name.trim(), description: description.trim(), tierId, raciType });
    }
    resetForm();
  };

  /** Resets form to default values and closes the dialog. */
  const resetForm = () => {
    setName("");
    setDescription("");
    setRaciType("responsible");
    setEditingId(null);
    setDialogOpen(false);
  };

  /** Opens the dialog in edit mode populated with the role's current values. */
  const startEdit = (roleId: string) => {
    const role = tierRoles.find((r) => r.id === roleId);
    if (!role) return;
    setEditingId(roleId);
    setName(role.name);
    setDescription(role.description);
    setRaciType(role.raciType);
    setDialogOpen(true);
  };

  /** Opens the delete confirmation dialog for a specific role. */
  const openDeleteDialog = (roleId: string) => {
    setDeletingId(roleId);
    setDeleteDialogOpen(true);
  };

  /** Executes the delete and closes the dialog. */
  const confirmDelete = () => {
    if (deletingId) deleteRole(deletingId);
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const deletingRole = deletingId ? tierRoles.find((r) => r.id === deletingId) : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tier?.name ?? "Tier"} Roles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tier?.description ?? "Manage roles in this tier"}
            </p>
          </div>
          <EzButton onClick={() => setDialogOpen(true)} icon={<Plus className="h-4 w-4" />}>
            New Role
          </EzButton>
        </div>

        {/* RACI Legend */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">RACI Matrix</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RACI_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-start gap-2">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5", RACI_BADGE_COLORS[opt.value])}>
                  {RACI_LABELS[opt.value].charAt(0)}
                </span>
                <div>
                  <p className="text-xs font-medium">{RACI_LABELS[opt.value]}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{RACI_DESCRIPTIONS[opt.value]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <EzDialog
          open={dialogOpen}
          onOpenChange={(open) => { if (!open) resetForm(); }}
          title={editingId ? "Edit Role" : "Create Role"}
        >
          <div className="space-y-4 py-2">
            <EzInput
              label="Role Name"
              placeholder="e.g. Shift Lead"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <EzInput
              label="Description"
              placeholder="Responsibilities of this role"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <EzSelect
              label="RACI Designation"
              placeholder="Select RACI type"
              options={RACI_OPTIONS}
              value={raciType}
              onValueChange={(v) => setRaciType(v as RACIType)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <EzButton variant="outlined" onClick={resetForm}>Cancel</EzButton>
            <EzButton onClick={handleSave} disabled={!name.trim()}>
              {editingId ? "Update" : "Create"}
            </EzButton>
          </div>
        </EzDialog>

        {/* Role Grid */}
        {tierRoles.length === 0 ? (
          <div className="text-center py-20">
            <UserCircle className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-4">No roles in this tier yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create roles (abstract positions) to assign across departments and processes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tierRoles.map((role) => (
              <div
                key={role.id}
                className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate">{role.name}</h3>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{role.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RACI badge + actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", RACI_BADGE_COLORS[role.raciType])}>
                    {RACI_LABELS[role.raciType]}
                  </span>
                  <div className="flex items-center gap-1">
                    <EzButton
                      variant="text"
                      size="small"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => startEdit(role.id)}
                      icon={<Pencil className="h-3.5 w-3.5" />}
                      aria-label={`Edit ${role.name}`}
                    />
                    <EzButton
                      variant="text"
                      severity="danger"
                      size="small"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => openDeleteDialog(role.id)}
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      aria-label={`Delete ${role.name}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <EzAlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => { if (!open) setDeleteDialogOpen(false); }}
          title={`Delete "${deletingRole?.name}"?`}
          description="This role will be removed from the catalog. Any assignments referencing this role will need to be updated."
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
