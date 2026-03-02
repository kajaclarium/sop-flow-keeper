import { X } from "lucide-react";
import { EzButton } from "@clarium/ezui-react-components";
import type { RaciModalState, Role, RaciKey } from "@/types/orgStructure";
import { RACI_DEFS } from "@/types/orgStructure";
import { cn } from "@/lib/utils";

interface RaciFormModalProps {
    state: RaciModalState;
    roles: Role[];
    onClose: () => void;
    onSave: (roleId: string, key: RaciKey, val: string) => void;
}

/** Modal for editing RACI assignments for a specific role. */
export function RaciFormModal({ state, roles, onClose, onSave }: RaciFormModalProps) {
    if (!state.open || state.roleId === null) return null;
    const role = roles.find((r) => r.id === state.roleId);
    if (!role) return null;

    const opts = ["— None —", ...roles.map((r) => r.title)];

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl w-[580px] max-w-[95vw] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <div className="text-sm font-bold text-foreground">{role.icon} {role.title} — RACI</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Assign a role to each RACI position · changes save instantly</div>
                    </div>
                    <button onClick={onClose} className="h-7 w-7 rounded-full border bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                </div>

                {/* Context */}
                <div className="px-5 py-2.5 bg-muted/20 border-b text-[11px] text-muted-foreground">
                    Defining how <strong className="text-foreground">{role.title}</strong> ({role.dept}) participates in processes and decisions.
                </div>

                {/* Table */}
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {["RACI Position", "Assigned Role", "Meaning"].map((h) => (
                                <th key={h} className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-2.5 bg-muted/20 border-b text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {RACI_DEFS.map((def) => {
                            const current = role.raci[def.key] || "— None —";
                            return (
                                <tr key={def.key} className="border-b">
                                    <td className="px-4 py-3 align-middle">
                                        <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded", def.bgClass, def.titleClass, "whitespace-nowrap")}>
                                            {def.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <select
                                            value={current}
                                            onChange={(e) => onSave(role.id, def.key, e.target.value)}
                                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-foreground bg-muted/20 outline-none focus:border-primary/50 transition-colors"
                                        >
                                            {opts.map((o) => <option key={o}>{o}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-[11px] text-muted-foreground">{def.meaning}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Note */}
                <div className="px-5 py-3 bg-amber-50 border-t border-amber-200">
                    <span className="text-[11px] text-amber-800">
                        <strong>Note:</strong> Changes save immediately. Process-level RACI per SOP is managed in the Ownership module.
                    </span>
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-3 border-t bg-muted/20">
                    <EzButton variant="outlined" size="small" onClick={onClose}>Done</EzButton>
                </div>
            </div>
        </div>
    );
}
