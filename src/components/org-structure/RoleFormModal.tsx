import { X } from "lucide-react";
import { EzButton } from "@clarium/ezui-react-components";
import type { RoleModalState, Role } from "@/types/orgStructure";

interface RoleFormModalProps {
    state: RoleModalState;
    roles: Role[];
    deptOptions: string[];
    iconOptions: string[];
    onChange: (patch: Partial<RoleModalState>) => void;
    onSave: () => void;
    onClose: () => void;
}

/** Modal for creating or editing a role. */
export function RoleFormModal({ state, roles, deptOptions, iconOptions, onChange, onSave, onClose }: RoleFormModalProps) {
    if (!state.open) return null;
    const isEdit = state.editId !== null;

    const labelClass = "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5";
    const inputClass = "w-full px-3 py-2 border rounded-lg text-xs text-foreground bg-muted/20 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors";

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <span className="text-sm font-bold text-foreground">{isEdit ? "Edit Role" : "Add New Role"}</span>
                    <button onClick={onClose} className="h-7 w-7 rounded-full border bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={labelClass}>Title *</label>
                            <input value={state.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. QA Manager" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Department *</label>
                            <select value={state.dept} onChange={(e) => onChange({ dept: e.target.value })} className={inputClass}>
                                <option value="">Select…</option>
                                {deptOptions.map((d) => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={labelClass}>Reports To</label>
                            <select value={state.parent} onChange={(e) => onChange({ parent: e.target.value })} className={inputClass}>
                                <option value="">— Top Level —</option>
                                {roles.filter((r) => r.id !== state.editId).map((r) => (
                                    <option key={r.id} value={r.id}>{r.icon} {r.title} ({r.dept})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Icon</label>
                            <select value={state.icon} onChange={(e) => onChange({ icon: e.target.value })} className={inputClass}>
                                {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className={labelClass}>SOPs Owned</label>
                        <input type="number" value={state.sops} onChange={(e) => onChange({ sops: e.target.value })} min={0} placeholder="0" className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Permissions / Notes</label>
                        <input value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} placeholder="e.g. Can approve SOPs, manage KPIs" className={inputClass} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20">
                    <EzButton variant="outlined" size="small" onClick={onClose}>Cancel</EzButton>
                    <EzButton size="small" onClick={onSave}>Save Role</EzButton>
                </div>
            </div>
        </div>
    );
}
