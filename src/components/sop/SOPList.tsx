import { useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSOP } from "@/contexts/SOPContext";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { SOPStatus } from "@/types/sop";
import { SOPStatusBadge } from "./SOPStatusBadge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EzButton, EzInput, EzMenu, EzAlertDialog } from "@clarium/ezui-react-components";
import {
  Plus, Search, Eye, Pencil, Trash2, FileText, Blocks, Lock, Clock, User, ChevronDown,
  Boxes, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: (SOPStatus | "All")[] = ["All", "Draft", "In Review", "Approved", "Effective"];

/** Lists all SOPs for the selected business process with search, status filtering, and CRUD actions. */
export function SOPList() {
  const { sops, navigateToCreate, navigateToView, navigateToEdit, deleteSop, selectedProcessId, getSelectedProcess } = useSOP();
  const { allTasks, navigateToTasks, navigateToTaskDetail } = useWorkInventory();
  const navigate = useNavigate();
  const { departmentId } = useParams<{ departmentId: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SOPStatus | "All">("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSopId, setDeletingSopId] = useState<string | null>(null);

  const processSops = useMemo(() => {
    return selectedProcessId ? sops.filter((s) => s.businessProcessId === selectedProcessId) : sops;
  }, [sops, selectedProcessId]);

  const filtered = useMemo(() => {
    return processSops.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.owner.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processSops, search, statusFilter]);

  const stats = useMemo(() => ({
    total: processSops.length,
    draft: processSops.filter((s) => s.status === "Draft").length,
    review: processSops.filter((s) => s.status === "In Review" || s.status === "Approved").length,
    effective: processSops.filter((s) => s.status === "Effective").length,
  }), [processSops]);

  const processName = getSelectedProcess()?.name;

  /** Opens the delete confirmation dialog for a specific SOP. */
  const openDeleteDialog = (sopId: string) => {
    setDeletingSopId(sopId);
    setDeleteDialogOpen(true);
  };

  /** Executes the delete action and closes the dialog. */
  const confirmDelete = () => {
    if (deletingSopId) {
      deleteSop(deletingSopId);
    }
    setDeleteDialogOpen(false);
    setDeletingSopId(null);
  };

  const deletingSop = deletingSopId ? sops.find((s) => s.id === deletingSopId) : null;

  /**
   * Reverse lookup: given a sopId, find all tasks in the work inventory that
   * list this SOP in their `linkedSopIds`.
   */
  const getLinkedTasks = (sopId: string) =>
    allTasks.filter((t) => t.linkedSopIds.includes(sopId));

  /**
   * Navigate to Work Inventory and deep-link directly to the task via URL search param.
   * The WorkInventory page reads `?taskId=` on mount and auto-selects the task.
   * This is cross-page safe — context state mutations don't survive page transitions.
   */
  const handleTaskClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    navigate(`/department/${departmentId}/work-inventory?taskId=${taskId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Process Title */}
        {processName && (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{processName}</h2>
            <InfoTooltip
              title={processName}
              description="This business process groups related SOPs that govern how work is performed within this department or function. Each SOP follows a lifecycle: Draft → In Review → Approved → Effective."
              tip="SOPs in 'Effective' status are locked and cannot be edited. Create a new version to make changes to an effective SOP."
              side="bottom"
            />
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total SOPs", value: stats.total, color: "text-foreground", tooltip: "Total number of Standard Operating Procedures registered under this business process, across all lifecycle stages." },
            { label: "Drafts", value: stats.draft, color: "text-status-draft", tooltip: "SOPs still being authored. Drafts can be freely edited and are not yet live." },
            { label: "Under Review", value: stats.review, color: "text-status-review", tooltip: "SOPs submitted for review or already approved but not yet made effective. These are pending final sign-off." },
            { label: "Effective", value: stats.effective, color: "text-status-effective", tooltip: "Locked, live SOPs governing current operations. Cannot be edited — create a new version instead." },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <InfoTooltip title={stat.label} description={stat.tooltip} side="bottom" iconSize={11} />
              </div>
              <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-6">
          <div className="flex-1 max-w-sm">
            <EzInput
              placeholder="Search SOPs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<Search size={16} />}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <EzButton
                key={s}
                variant={statusFilter === s ? "classic" : "text"}
                severity={statusFilter === s ? "primary" : undefined}
                size="small"
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </EzButton>
            ))}
          </div>
          <EzButton onClick={navigateToCreate} className="ml-auto" icon={<Plus className="h-4 w-4" />}>
            Create SOP
          </EzButton>
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
              /* Check if this SOP has a newer effective version (i.e., it's superseded) */
              const isSuperseded = !isEffective && sop.versions.length > 1 && sop.versions.some(v => v.status === "Effective" && v.version !== sop.currentVersion);
              const linkedTasks = getLinkedTasks(sop.id);
              return (
                <div key={sop.id} className="rounded-xl border bg-card overflow-hidden transition-all hover:shadow-sm group">
                  {/* Main SOP row */}
                  <div
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 cursor-pointer",
                      isEffective && "border-b-0 bg-status-effective-bg/30",
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

                    <div onClick={(e) => e.stopPropagation()}>
                      <EzMenu
                        trigger={
                          <EzButton variant="text" className="shrink-0 opacity-0 group-hover:opacity-100" icon={<ChevronDown className="h-4 w-4" />} aria-label="Actions" />
                        }
                        items={[
                          { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => navigateToView(sop.id) },
                          ...(!isEffective ? [{ label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => navigateToEdit(sop.id) }] : []),
                          { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => openDeleteDialog(sop.id) },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Linked Tasks sub-row — bi-directional traceability for admins */}
                  <div
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 border-t bg-muted/20 flex-wrap",
                      linkedTasks.length === 0 && "opacity-60"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
                      <Boxes className="h-3 w-3" />
                      <span>Linked Tasks</span>
                    </div>

                    {linkedTasks.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground italic">No tasks linked to this SOP</span>
                    ) : (
                      <>
                        {/* Show first 3 tasks as direct chips */}
                        {linkedTasks.slice(0, 3).map((task) => (
                          <button
                            key={task.id}
                            onClick={(e) => handleTaskClick(e, task.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-[11px] font-medium text-primary hover:bg-primary/15 transition-colors cursor-pointer group/task"
                            title={`Go to task ${task.id} in Work Inventory`}
                          >
                            <span className="font-mono text-[10px] text-primary/60">{task.id}</span>
                            <span className="truncate max-w-[120px]">{task.name}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover/task:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                        
                        {/* Summarize remaining tasks */}
                        {linkedTasks.length > 3 && (
                          <div 
                            className="px-2 py-1 rounded-full bg-muted border border-border text-[10px] font-bold text-muted-foreground cursor-help"
                            title={linkedTasks.slice(3).map(t => `${t.id}: ${t.name}`).join('\n')}
                          >
                            +{linkedTasks.length - 3} more
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <EzAlertDialog
          open={deleteDialogOpen}
          onOpenChange={(isOpen) => { if (!isOpen) setDeleteDialogOpen(false); }}
          title={`Delete ${deletingSop?.id}?`}
          description={`This will permanently delete "${deletingSop?.title}".`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialogOpen(false)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
