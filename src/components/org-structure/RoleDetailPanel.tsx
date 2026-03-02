import { X, Pencil, Trash2 } from "lucide-react";
import { EzButton } from "@clarium/ezui-react-components";
import type { Role, RaciKey } from "@/types/orgStructure";
import { RACI_DEFS } from "@/types/orgStructure";
import { cn } from "@/lib/utils";

interface RoleDetailPanelProps {
    roleId: string | null;
    roles: Role[];
    onClose: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onOpenRaci: (id: string) => void;
}

/** Slide-in side panel showing full details for a selected role. */
export function RoleDetailPanel({ roleId, roles, onClose, onEdit, onDelete, onOpenRaci }: RoleDetailPanelProps) {
    const role = roleId !== null ? roles.find((r) => r.id === roleId) : null;
    if (!role) return null;

    const parent = role.parent ? roles.find((r) => r.id === role.parent) : null;
    const children = roles.filter((r) => r.parent === role.id);

    const infoRows = [
        ["Icon", role.icon],
        ["Department", role.dept],
        ["Reports To", parent?.title ?? "Top Level"],
        ["SOPs Owned", String(role.sops)],
        ["Notes", role.notes || "—"],
    ];

    return (
        <div className="fixed right-0 top-[88px] bottom-0 w-[300px] bg-card border-l shadow-xl z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-card z-10">
                <span className="text-sm font-bold text-foreground">{role.title}</span>
                <button onClick={onClose} className="h-7 w-7 rounded-full border bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
            </div>

            {/* Role Info */}
            <div className="px-5 py-4 border-b">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Role Info</div>
                {infoRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-muted-foreground">{k}</span>
                        <span className={cn("text-xs font-medium", k === "SOPs Owned" ? "text-primary" : "text-foreground")}>{v}</span>
                    </div>
                ))}
            </div>

            {/* Direct Reports */}
            <div className="px-5 py-4 border-b">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                    Direct Reports ({children.length})
                </div>
                {children.length > 0 ? children.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-muted/30">
                        <span>{c.icon}</span>
                        <span className="text-xs font-medium text-foreground">{c.title}</span>
                    </div>
                )) : (
                    <div className="text-xs text-muted-foreground/60">No direct reports</div>
                )}
            </div>

            {/* RACI */}
            <div className="px-5 py-4 border-b">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">RACI</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {RACI_DEFS.map((def) => (
                        <div key={def.key} className={cn("px-3 py-2 rounded-lg border", def.bgClass, def.borderClass)}>
                            <div className={cn("text-[9px] font-bold uppercase tracking-wide mb-0.5", def.titleClass)}>{def.label}</div>
                            <div className={cn("text-[11px] font-medium", def.valClass)}>
                                {role.raci[def.key] || <span className="text-muted-foreground italic">Unset</span>}
                            </div>
                        </div>
                    ))}
                </div>
                <EzButton variant="outlined" size="small" className="w-full" onClick={() => onOpenRaci(role.id)} icon={<Pencil className="h-3 w-3" />}>
                    Edit RACI
                </EzButton>
            </div>

            {/* Quick Actions */}
            <div className="px-5 py-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Quick Actions</div>
                <div className="flex flex-col gap-2">
                    <EzButton variant="outlined" size="small" onClick={() => onEdit(role.id)} icon={<Pencil className="h-3 w-3" />}>
                        Edit Role
                    </EzButton>
                    <EzButton variant="outlined" severity="danger" size="small" onClick={() => onDelete(role.id)} icon={<Trash2 className="h-3 w-3" />}>
                        Delete Role
                    </EzButton>
                </div>
            </div>
        </div>
    );
}
