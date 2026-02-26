import { EzButton } from "@clarium/ezui-react-components";
import { Boxes, ChevronRight } from "lucide-react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { AppNav } from "@/components/shared/AppNav";

/** Top navigation bar with breadcrumb navigation and cross-module switcher for Work Inventory. */
export function WorkInventoryTopBar() {
  const { currentView, navigateToModules, navigateToTasks, getSelectedModule, getSelectedTask, selectedModuleId } = useWorkInventory();

  const module = getSelectedModule();
  const task = getSelectedTask();
  const showModuleCrumb = currentView !== "modules";
  const showTaskCrumb = currentView === "taskDetail" && task;

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        <EzButton variant="text" onClick={navigateToModules} className="flex items-center gap-2.5 p-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">SOPvault</span>
            <p className="text-[10px] text-muted-foreground leading-none">Work Inventory</p>
          </div>
        </EzButton>

        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <EzButton
          variant="text"
          onClick={navigateToModules}
          className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
        >
          Processes
        </EzButton>

        {showModuleCrumb && module && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <EzButton
              variant="text"
              onClick={() => navigateToTasks(selectedModuleId!)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
            >
              {module.name}
            </EzButton>
          </>
        )}

        {showTaskCrumb && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{task.name}</span>
          </>
        )}
      </div>

      <AppNav />
    </header>
  );
}
