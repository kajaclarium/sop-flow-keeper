import { Search, Download, Plus } from "lucide-react";
import { EzButton } from "@clarium/ezui-react-components";
import { cn } from "@/lib/utils";

interface OrgStructureTopBarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    departments: string[];
    activeFilter: string;
    onFilterChange: (dept: string) => void;
    onExport: () => void;
    onAddRole: () => void;
}

/** Top bar for the Org Structure page — search, department filters, and action buttons. */
export function OrgStructureTopBar({
    searchQuery,
    onSearchChange,
    departments,
    activeFilter,
    onFilterChange,
    onExport,
    onAddRole,
}: OrgStructureTopBarProps) {
    return (
        <div className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/30 w-56">
                    <Search className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search roles…"
                        className="border-none outline-none bg-transparent text-xs text-foreground w-full placeholder:text-muted-foreground/50"
                    />
                </div>

                {/* Department filters */}
                <div className="flex gap-1.5">
                    {departments.map((d) => (
                        <button
                            key={d}
                            onClick={() => onFilterChange(d)}
                            className={cn(
                                "text-[11px] px-3 py-1 rounded-full border font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
                                activeFilter === d
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <EzButton variant="outlined" size="small" onClick={onExport} icon={<Download className="h-3.5 w-3.5" />}>
                    Export
                </EzButton>
                <EzButton size="small" onClick={onAddRole} icon={<Plus className="h-3.5 w-3.5" />}>
                    Add Role
                </EzButton>
            </div>
        </div>
    );
}
