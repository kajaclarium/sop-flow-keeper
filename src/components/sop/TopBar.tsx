import { Link, useNavigate, useParams } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { useSOP } from "@/contexts/SOPContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { AppNav } from "@/components/shared/AppNav";
import { GlobalSearch, SearchableSOP, SearchableTask } from "@/components/shared/GlobalSearch";
import { useMemo } from "react";

interface TopBarProps {
  children?: React.ReactNode;
}

/**
 * Top navigation bar for the SOP module.
 * Provides breadcrumb trail and unified GlobalSearch across SOPs and Work Inventory.
 */
export function TopBar({ children }: TopBarProps) {
  const { currentView, navigateToProcesses, navigateToList, navigateToView, getSelectedProcess, getSelectedSop, sops, businessProcesses } = useSOP();
  const { modules, allTasks, navigateToTaskDetail, navigateToTasks } = useWorkInventory();
  const { getDepartmentById } = useOrganization();
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();

  const department = departmentId ? getDepartmentById(departmentId) : null;
  const process = getSelectedProcess();
  const sop = getSelectedSop();
  const showProcessCrumb = currentView !== "processes";

  /** Build process name lookup for SOP results. */
  const processMap = useMemo(
    () => Object.fromEntries(businessProcesses.map((bp) => [bp.id, bp.name])),
    [businessProcesses]
  );

  /** Module name lookup for task results. */
  const moduleMap = useMemo(
    () => Object.fromEntries(modules.map((m) => [m.id, m.name])),
    [modules]
  );

  /** Department-scoped SOPs for Global Search. */
  const searchableSops: SearchableSOP[] = useMemo(
    () =>
      sops.map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        owner: s.owner,
        businessProcessName: s.businessProcessId ? processMap[s.businessProcessId] : undefined,
      })),
    [sops, processMap]
  );

  /** Department-scoped tasks for Global Search. */
  const deptModuleIds = useMemo(
    () => new Set(modules.filter((m) => m.departmentId === departmentId).map((m) => m.id)),
    [modules, departmentId]
  );
  const searchableTasks: SearchableTask[] = useMemo(
    () =>
      allTasks
        .filter((t) => deptModuleIds.has(t.moduleId))
        .map((t) => ({
          id: t.id,
          name: t.name,
          operation: t.operation,
          owner: t.owner,
          moduleId: t.moduleId,
          moduleName: moduleMap[t.moduleId],
          riskLevel: t.riskLevel,
        })),
    [allTasks, deptModuleIds, moduleMap]
  );

  /** Navigate to a SOP within this module — set view to SOP Vault and open the SOP. */
  const handleSopSelect = (sopId: string) => {
    navigateToView(sopId);
  };

  /** Navigate to a task — switch to Work Inventory module and open task detail. */
  const handleTaskSelect = (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;
    navigate(`/department/${departmentId}/work-inventory`);
    setTimeout(() => {
      navigateToTasks(task.moduleId);
      setTimeout(() => navigateToTaskDetail(taskId), 50);
    }, 50);
  };

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        {/* SOPvault logo — root "Departments" link */}
        <Link to="/" className="no-underline flex items-center gap-2.5 group">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary shrink-0">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">SOPvault</span>
            <p className="text-[10px] text-muted-foreground leading-none group-hover:text-primary transition-colors">Departments</p>
          </div>
        </Link>

        {/* Department name crumb */}
        {department && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <EzButton
              variant="text"
              onClick={navigateToProcesses}
              className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
            >
              {department.name}
            </EzButton>
          </>
        )}

        {/* Static "SOP" module label — always visible; active state when on processes root */}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <EzButton
          variant="text"
          onClick={navigateToProcesses}
          className={`text-xs font-medium p-0 ${
            currentView === "processes" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          SOP
        </EzButton>

        {/* Process (Business Process) crumb */}
        {process && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <EzButton
              variant="text"
              onClick={() => navigateToList()}
              className={`text-xs font-medium p-0 ${
                currentView === "list" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {process.name}
            </EzButton>
          </>
        )}

        {/* SOP document crumb — shown when viewing, editing, or creating a specific SOP */}
        {(currentView === "view" || currentView === "edit" || currentView === "create") && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs font-semibold text-foreground truncate max-w-48">
              {currentView === "create" ? "New SOP" : sop?.title ?? ""}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
        <GlobalSearch
          sops={searchableSops}
          tasks={searchableTasks}
          onSopSelect={handleSopSelect}
          onTaskSelect={handleTaskSelect}
        />
        <AppNav />
      </div>
    </header>
  );
}
