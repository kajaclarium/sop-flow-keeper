import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { RoleTierId, RACI_LABELS } from "@/types/organization";
import { EzButton, EzInput, EzDialog } from "@clarium/ezui-react-components";
import {
  Crown, Briefcase, Wrench, Pencil, ArrowRight, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Icon map for the three tiers. */
const TIER_ICONS: Record<RoleTierId, typeof Crown> = {
  strategic: Crown,
  managerial: Briefcase,
  operational: Wrench,
};

/** Color map for tier-specific accents. */
const TIER_COLORS: Record<RoleTierId, { bg: string; text: string; border: string }> = {
  strategic: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/30" },
  managerial: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
  operational: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30" },
};

interface TierListProps {
  /** Callback when a tier card is clicked — navigates to the role list for that tier. */
  onSelectTier: (tierId: RoleTierId) => void;
}

/** Displays the three organizational tiers as editable cards with role counts and RACI summary. */
export function TierList({ onSelectTier }: TierListProps) {
  const { tiers, updateTier, getRolesByTier, roles } = useOrganization();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<RoleTierId | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  /** Opens edit dialog pre-filled with the tier's current values. */
  const startEdit = (tierId: RoleTierId) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) return;
    setEditingTierId(tierId);
    setEditName(tier.name);
    setEditDescription(tier.description);
    setEditDialogOpen(true);
  };

  /** Saves tier edits. */
  const handleSave = () => {
    if (!editingTierId || !editName.trim()) return;
    updateTier(editingTierId, { name: editName.trim(), description: editDescription.trim() });
    resetForm();
  };

  /** Resets the edit form. */
  const resetForm = () => {
    setEditingTierId(null);
    setEditName("");
    setEditDescription("");
    setEditDialogOpen(false);
  };

  /** Counts roles by RACI type within a tier for the summary badge. */
  const getRaciSummary = (tierId: RoleTierId) => {
    const tierRoles = getRolesByTier(tierId);
    const counts: Record<string, number> = {};
    tierRoles.forEach((r) => {
      const label = RACI_LABELS[r.raciType];
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return counts;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Tiers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Three-tier organizational hierarchy with RACI designations — click a tier to manage its roles
          </p>
        </div>

        {/* Tier flow visualization */}
        <div className="flex flex-col items-center gap-0">
          {tiers.map((tier, index) => {
            const TierIcon = TIER_ICONS[tier.id];
            const colors = TIER_COLORS[tier.id];
            const roleCount = getRolesByTier(tier.id).length;
            const raciSummary = getRaciSummary(tier.id);

            return (
              <div key={tier.id} className="flex flex-col items-center w-full max-w-2xl">
                {/* Connector line between tiers */}
                {index > 0 && (
                  <div className="flex flex-col items-center my-1">
                    <div className="w-px h-6 bg-border" />
                    <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
                      {index === 1 ? "Strategy → Plans" : "Plans → Execution"}
                    </div>
                    <div className="w-px h-6 bg-border" />
                  </div>
                )}

                {/* Tier card */}
                <div
                  className={cn(
                    "group relative w-full rounded-xl border-2 bg-card p-6 transition-all cursor-pointer",
                    "hover:shadow-lg hover:-translate-y-0.5",
                    colors.border
                  )}
                  onClick={() => onSelectTier(tier.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex items-center justify-center h-12 w-12 rounded-xl shrink-0", colors.bg)}>
                        <TierIcon className={cn("h-6 w-6", colors.text)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{tier.name}</h3>
                          <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                            Tier {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{tier.description}</p>

                        {/* RACI summary badges */}
                        {Object.keys(raciSummary).length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            {Object.entries(raciSummary).map(([label, count]) => (
                              <span
                                key={label}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted border"
                              >
                                {label}: {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Role count */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>{roleCount} Role{roleCount !== 1 ? "s" : ""}</span>
                      </div>

                      {/* Edit button */}
                      <EzButton
                        variant="text"
                        size="small"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); startEdit(tier.id); }}
                        icon={<Pencil className="h-3.5 w-3.5" />}
                        aria-label={`Edit ${tier.name}`}
                      />
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Tier Dialog */}
        <EzDialog
          open={editDialogOpen}
          onOpenChange={(open) => { if (!open) resetForm(); }}
          title={`Edit ${editingTierId ? tiers.find((t) => t.id === editingTierId)?.name : ""} Tier`}
        >
          <div className="space-y-4 py-2">
            <EzInput
              label="Tier Name"
              placeholder="e.g. Strategic"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <EzInput
              label="Description"
              placeholder="Describe this tier's purpose"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <EzButton variant="outlined" onClick={resetForm}>Cancel</EzButton>
            <EzButton onClick={handleSave} disabled={!editName.trim()}>Update</EzButton>
          </div>
        </EzDialog>
      </div>
    </div>
  );
}
