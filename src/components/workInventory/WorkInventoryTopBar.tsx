import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import { Boxes, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useSOP } from "@/contexts/SOPContext";
import { AppNav } from "@/components/shared/AppNav";
import { GlobalSearch, SearchableSOP, SearchableTask } from "@/components/shared/GlobalSearch";

/**
 * Top navigation bar for Work Inventory module.
 * Provides breadcrumb trail and unified GlobalSearch across SOPs and Work Inventory.
 */
export function WorkInventoryTopBar() {
  const { currentView, navigateToModules, navigateToTasks, navigateToTaskDetail, getSelectedModule, getSelectedTask, selectedModuleId, modules, allTasks } = useWorkInventory();
  const { sops, businessProcesses, navigateToView: viewSOP } = useSOP();
  const { getDepartmentById } = useOrganization();
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();

  const department = departmentId ? getDepartmentById(departmentId) : null;
  const module = getSelectedModule();
  const task = getSelectedTask();
  const showModuleCrumb = currentView !== "modules";
  const showTaskCrumb = currentView === "taskDetail" && task;

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

  /** Navigate to a SOP — switch to SOP module and open the SOP detail view. */
  const handleSopSelect = (sopId: string) => {
    navigate(`/department/${departmentId}/sop`);
    setTimeout(() => viewSOP(sopId), 50);
  };

  /** Navigate to a task — open the task detail in the current Work Inventory module. */
  const handleTaskSelect = (taskId: string) => {
    // Instead of direct state mutation which can be race-y or fail across mounts,
    // we use the same search-param pattern as SOPList.
    navigate(`${location.pathname}?taskId=${taskId}`, { replace: true });
  };

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        {/* Work Inventory logo — root "Departments" link */}
        <Link to="/" className="no-underline flex items-center gap-2.5 group">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary shrink-0">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">Work Inventory</span>
            <p className="text-[10px] text-muted-foreground leading-none group-hover:text-primary transition-colors">Departments</p>
          </div>
        </Link>

        {/* Department name crumb */}
        {department && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <EzButton
              variant="text"
              onClick={navigateToModules}
              className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
            >
              {department.name}
            </EzButton>
          </>
        )}

        {/* Static "Process" module label — always visible; active state when on modules root */}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <EzButton
          variant="text"
          onClick={navigateToModules}
          className={`text-xs font-medium p-0 ${
            currentView === "modules" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Process
        </EzButton>

        {/* Module breadcrumb */}
        {showModuleCrumb && module && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <EzButton
              variant="text"
              onClick={() => navigateToTasks(selectedModuleId!)}
              className={`text-xs font-medium p-0 ${
                currentView === "tasks" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {module.name}
            </EzButton>
          </>
        )}

        {/* Task detail crumb */}
        {showTaskCrumb && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs font-semibold text-foreground truncate max-w-48">{task.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
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
