import { useState, useMemo } from "react";
import { EzInput } from "@clarium/ezui-react-components";
import {
    Search, Network, ChevronRight, ChevronDown,
    Users, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/orgStructure";
import { DEPARTMENTS } from "@/data/orgStructureData";

interface OrgStructureSidebarProps {
    roles: Role[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

/**
 * Hierarchical sidebar for navigating the Org Structure role tree.
 * Tree Structure: Department -> Roles (matching WorkInventorySidebar pattern).
 */
export function OrgStructureSidebar({ roles, selectedId, onSelect }: OrgStructureSidebarProps) {
    const [search, setSearch] = useState("");
    const [expandedDepts, setExpandedDepts] = useState<string[]>([]);

    const toggleDept = (dept: string) => {
        setExpandedDepts((prev) =>
            prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
        );
    };

    /** Group roles by department, filtering by search query. */
    const groupedData = useMemo(() => {
        const q = search.toLowerCase();
        return DEPARTMENTS.filter((d) => d !== "All").map((dept) => {
            const deptRoles = roles.filter((r) => r.dept === dept);
            const matchingRoles = deptRoles.filter(
                (r) =>
                    !q ||
                    r.title.toLowerCase().includes(q) ||
                    r.dept.toLowerCase().includes(q)
            );
            return {
                dept,
                roles: matchingRoles,
                isVisible:
                    !q ||
                    dept.toLowerCase().includes(q) ||
                    matchingRoles.length > 0,
            };
        }).filter((g) => g.isVisible);
    }, [roles, search]);

    return (
        <aside className="w-64 border-r bg-card flex flex-col shrink-0 overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role Navigator
                </h3>
                <EzInput
                    placeholder="Search roles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    suffix={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                    className="h-8 text-xs"
                />
            </div>

            {/* Navigation Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* Root node */}
                <button
                    onClick={() => onSelect("all")}
                    className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                        selectedId === null
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                >
                    <Network className="h-4 w-4" />
                    <span>All Roles</span>
                </button>

                <div className="pt-2 pb-1 px-3">
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        Departments
                    </span>
                </div>

                {groupedData.map(({ dept, roles: deptRoles }) => {
                    const isExpanded = expandedDepts.includes(dept) || search.length > 0;

                    return (
                        <div key={dept} className="space-y-0.5">
                            <div
                                className={cn(
                                    "flex items-center gap-1 group rounded-md transition-colors",
                                    "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                                )}
                            >
                                <button
                                    onClick={() => toggleDept(dept)}
                                    className="p-1 hover:bg-accent rounded"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    )}
                                </button>
                                <span className="flex-1 flex items-center gap-2 py-1.5 text-xs text-left font-medium truncate">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    <span className="truncate">{dept}</span>
                                    <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
                                        {deptRoles.length}
                                    </span>
                                </span>
                            </div>

                            {/* Roles in this department */}
                            {isExpanded && (
                                <div className="ml-4 pl-2 border-l border-border/50 space-y-0.5 mt-0.5">
                                    {deptRoles.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => onSelect(role.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-colors",
                                                selectedId === role.id
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                            )}
                                        >
                                            <span className="truncate">{role.title}</span>
                                        </button>
                                    ))}
                                    {deptRoles.length === 0 && (
                                        <span className="block px-2 py-1.5 text-[10px] text-muted-foreground/50 italic">
                                            No roles found
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/20">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    <span className="font-medium">
                        {roles.length} Role{roles.length !== 1 ? "s" : ""} Active
                    </span>
                </div>
            </div>
        </aside>
    );
}
