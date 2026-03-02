import type { Role } from "@/types/orgStructure";
import { OrgNode } from "@/components/org-structure/OrgNode";

interface OrgTreePanelProps {
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

/** Left panel containing the visual org tree with recursive nodes. */
export function OrgTreePanel({
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
}: OrgTreePanelProps) {
    const roots = roles.filter((r) => r.parent === null);

    return (
        <div className="w-[55%] border-r flex flex-col overflow-hidden bg-muted/20">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-card shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Visual Org Tree
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                    Drag nodes to re-parent · Click to select
                </span>
            </div>

            {/* Tree canvas */}
            <div className="flex-1 overflow-auto pt-2 px-6 pb-8">
                <div className="flex flex-col items-center min-w-max pb-4">
                    {roots.map((root) => (
                        <OrgNode
                            key={root.id}
                            role={root}
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
                    ))}
                </div>
            </div>
        </div>
    );
}
