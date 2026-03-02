import { useState } from "react";
import type { Role, RaciKey } from "@/types/orgStructure";
import { RACI_BADGE } from "@/types/orgStructure";
import { cn } from "@/lib/utils";

interface RoleRegistryTableProps {
    filteredRoles: Role[];
    allRoles: Role[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onOpenRaci: (id: string) => void;
}

/** Right panel table listing all roles with inline actions. */
export function RoleRegistryTable({
    filteredRoles,
    allRoles,
    selectedId,
    onSelect,
    onEdit,
    onDelete,
    onOpenRaci,
}: RoleRegistryTableProps) {
    const [rowHover, setRowHover] = useState<string | null>(null);
    const headers = ["Role", "Department", "Reports To", "RACI", "SOPs", "Status", ""];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-card shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Role Registry
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                    {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {headers.map((h) => (
                                <th
                                    key={h || "actions"}
                                    className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-2.5 bg-muted/30 border-b text-left whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoles.map((r) => {
                            const parentTitle = r.parent
                                ? allRoles.find((x) => x.id === r.parent)?.title ?? "—"
                                : "—";
                            const isHovered = rowHover === r.id;
                            const isSelected = selectedId === r.id;

                            return (
                                <tr
                                    key={r.id}
                                    onClick={() => onSelect(r.id)}
                                    onMouseEnter={() => setRowHover(r.id)}
                                    onMouseLeave={() => setRowHover(null)}
                                    className={cn(
                                        "cursor-pointer transition-colors",
                                        isSelected && "bg-primary/5",
                                        !isSelected && isHovered && "bg-muted/30"
                                    )}
                                >
                                    {/* Role */}
                                    <td className="px-4 py-3 text-xs border-b align-middle">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{r.icon}</span>
                                            <div>
                                                <div className="font-semibold text-foreground">{r.title}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">{r.notes}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Department */}
                                    <td className="px-4 py-3 border-b align-middle">
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                            {r.dept}
                                        </span>
                                    </td>

                                    {/* Reports To */}
                                    <td className="px-4 py-3 text-xs text-muted-foreground border-b align-middle">
                                        {parentTitle}
                                    </td>

                                    {/* RACI badges */}
                                    <td className="px-4 py-3 border-b align-middle">
                                        <div className="flex gap-1">
                                            {(["R", "A", "C", "I"] as RaciKey[]).map((k) => (
                                                <span
                                                    key={k}
                                                    title={`${k}: ${r.raci[k] || "—"}`}
                                                    className={cn(
                                                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                                        RACI_BADGE[k].bgClass,
                                                        RACI_BADGE[k].textClass
                                                    )}
                                                >
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    {/* SOPs */}
                                    <td className="px-4 py-3 text-center font-semibold text-primary border-b align-middle text-xs">
                                        {r.sops}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3 border-b align-middle">
                                        <span className="text-[9px] px-2 py-0.5 rounded font-semibold uppercase bg-emerald-100 text-emerald-800">
                                            Active
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 border-b align-middle">
                                        <div
                                            className={cn(
                                                "flex gap-1 transition-opacity",
                                                isHovered ? "opacity-100" : "opacity-0"
                                            )}
                                        >
                                            {[
                                                { label: "Edit", action: () => onEdit(r.id) },
                                                { label: "RACI", action: () => onOpenRaci(r.id) },
                                                { label: "Delete", action: () => onDelete(r.id), danger: true },
                                            ].map((btn) => (
                                                <button
                                                    key={btn.label}
                                                    onClick={(e) => { e.stopPropagation(); btn.action(); }}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded border bg-card cursor-pointer transition-colors",
                                                        "danger" in btn && btn.danger
                                                            ? "text-destructive hover:bg-destructive/10"
                                                            : "text-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
