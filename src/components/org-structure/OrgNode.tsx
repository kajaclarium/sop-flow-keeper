import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Role } from "@/types/orgStructure";
import { cn } from "@/lib/utils";

interface OrgNodeProps {
    role: Role;
    roles: Role[];
    selectedId: string | null;
    dragId: string | null;
    dragOverId: string | null;
    onSelect: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDragStart: (id: string) => void;
    onDragEnd: () => void;
    onDragOver: (id: string) => void;
    onDragLeave: (id: string) => void;
    onDrop: (targetId: string) => void;
}

/** Recursive tree node for the visual org chart. Supports drag-and-drop, selection, and hover actions. */
export function OrgNode({
    role,
    roles,
    selectedId,
    dragId,
    dragOverId,
    onSelect,
    onEdit,
    onDelete,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}: OrgNodeProps) {
    const children = roles.filter((r) => r.parent === role.id);
    const isSelected = selectedId === role.id;
    const isDragOver = dragOverId === role.id;
    const [hovered, setHovered] = useState(false);

    return (
        <div className="flex flex-col items-center">
            {/* Node card */}
            <div
                draggable
                onClick={() => onSelect(role.id)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onDragStart={(e) => { e.stopPropagation(); onDragStart(role.id); }}
                onDragEnd={onDragEnd}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(role.id); }}
                onDragLeave={() => onDragLeave(role.id)}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(role.id); }}
                className={cn(
                    "relative rounded-xl border-2 px-4 py-3 min-w-[140px] max-w-[160px] text-center cursor-pointer select-none",
                    "transition-all duration-200 shadow-sm",
                    isDragOver && "border-dashed border-emerald-400 bg-emerald-50",
                    !isDragOver && isSelected && "border-primary/60 bg-primary/5",
                    !isDragOver && !isSelected && hovered && "border-primary/40 shadow-md shadow-primary/10",
                    !isDragOver && !isSelected && !hovered && "border-border bg-card",
                    dragId === role.id && "opacity-40"
                )}
            >
                {/* Hover actions */}
                {hovered && (
                    <div className="absolute -top-2.5 -right-2.5 flex gap-1 z-10">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(role.id); }}
                            className="h-5 w-5 rounded-full border bg-card shadow-sm flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                            <Pencil className="h-2.5 w-2.5 text-muted-foreground" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(role.id); }}
                            className="h-5 w-5 rounded-full border bg-card shadow-sm flex items-center justify-center cursor-pointer hover:bg-destructive/10 transition-colors"
                        >
                            <Trash2 className="h-2.5 w-2.5 text-destructive" />
                        </button>
                    </div>
                )}

                <div className="text-xl mb-1">{role.icon}</div>
                <div className="text-[11px] font-semibold text-foreground leading-tight">{role.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{role.dept}</div>
                {role.multi && (
                    <div className="mt-1.5 flex justify-center">
                        <span className="text-[9px] px-2 py-0.5 rounded font-semibold uppercase bg-violet-100 text-violet-700">
                            Multi-Hat
                        </span>
                    </div>
                )}
            </div>

            {/* Connector line and children */}
            {children.length > 0 && (
                <>
                    <div className="w-0.5 h-5 bg-border" />
                    <div className="flex gap-5 relative">
                        {children.length > 1 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-border" style={{ width: `calc(100% - 160px)` }} />
                        )}
                        {children.map((child) => (
                            <div key={child.id} className="flex flex-col items-center">
                                <div className="w-0.5 h-5 bg-border" />
                                <OrgNode
                                    role={child}
                                    roles={roles}
                                    selectedId={selectedId}
                                    dragId={dragId}
                                    dragOverId={dragOverId}
                                    onSelect={onSelect}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onDragStart={onDragStart}
                                    onDragEnd={onDragEnd}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
