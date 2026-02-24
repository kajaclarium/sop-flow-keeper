import { useState, useMemo } from "react";
import { useSOP } from "@/contexts/SOPContext";
import { SOPStatus } from "@/types/sop";
import { SOPStatusBadge } from "./SOPStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, Eye, Pencil, Trash2, FileText, Blocks, Lock, Clock, User, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: (SOPStatus | "All")[] = ["All", "Draft", "In Review", "Approved", "Effective"];

export function SOPList() {
  const { sops, navigateToCreate, navigateToView, navigateToEdit, deleteSop } = useSOP();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SOPStatus | "All">("All");

  const filtered = useMemo(() => {
    return sops.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.owner.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sops, search, statusFilter]);

  const stats = useMemo(() => ({
    total: sops.length,
    draft: sops.filter((s) => s.status === "Draft").length,
    review: sops.filter((s) => s.status === "In Review" || s.status === "Approved").length,
    effective: sops.filter((s) => s.status === "Effective").length,
  }), [sops]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total SOPs", value: stats.total, color: "text-foreground" },
            { label: "Drafts", value: stats.draft, color: "text-status-draft" },
            { label: "Under Review", value: stats.review, color: "text-status-review" },
            { label: "Effective", value: stats.effective, color: "text-status-effective" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search SOPs…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button onClick={navigateToCreate} className="gap-2 ml-auto">
            <Plus className="h-4 w-4" /> Create SOP
          </Button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mt-3">No SOPs found</p>
            </div>
          ) : (
            filtered.map((sop) => {
              const isEffective = sop.status === "Effective";
              // Check if this SOP has a newer version (i.e., it's superseded)
              const isSuperseded = !isEffective && sop.versions.length > 1 && sop.versions.some(v => v.status === "Effective" && v.version !== sop.currentVersion);
              return (
                <div
                  key={sop.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-xl border bg-card transition-all hover:shadow-sm cursor-pointer group",
                    isEffective && "border-status-effective/30 bg-status-effective-bg/30 ring-1 ring-status-effective/10",
                    isSuperseded && "opacity-50"
                  )}
                  onClick={() => navigateToView(sop.id)}
                >
                  <div className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg shrink-0",
                    sop.format === "block" ? "bg-primary/10" : "bg-muted"
                  )}>
                    {sop.format === "block" ? (
                      <Blocks className="h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{sop.id}</span>
                      {isEffective && <Lock className="h-3 w-3 text-status-effective" />}
                    </div>
                    <p className={cn("text-sm font-medium truncate", isSuperseded && "line-through text-muted-foreground")}>{sop.title}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <User className="h-3 w-3" /> {sop.owner}
                  </div>

                  <span className={cn("text-xs font-mono shrink-0", isEffective ? "text-status-effective font-semibold" : "text-muted-foreground")}>
                    {sop.currentVersion}
                  </span>

                  <SOPStatusBadge status={sop.status} />

                  <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-24">
                    <Clock className="h-3 w-3" /> {sop.effectiveDate || sop.createdAt}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigateToView(sop.id)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      {!isEffective && (
                        <DropdownMenuItem onClick={() => navigateToEdit(sop.id)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {sop.id}?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{sop.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSop(sop.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
