import { EzButton } from "@clarium/ezui-react-components";
import { Boxes, ChevronRight } from "lucide-react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { Link } from "react-router-dom";

/** Top navigation bar with breadcrumb navigation for the Work Inventory feature. */
export function WorkInventoryTopBar() {
  const { currentView, navigateToModules, navigateToTasks, getSelectedModule, getSelectedTask, selectedModuleId } = useWorkInventory();

  const module = getSelectedModule();
  const task = getSelectedTask();
  const showModuleCrumb = currentView !== "modules";
  const showTaskCrumb = currentView === "taskDetail" && task;

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        {/* Link is kept for actual page navigation — not an action button */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">SOPvault</span>
            <p className="text-[10px] text-muted-foreground leading-none">Enterprise SOP Platform</p>
          </div>
        </Link>

        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <EzButton
          variant="text"
          onClick={navigateToModules}
          className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
        >
          Work Inventory
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

      {/* Navigation link to SOP Management — kept as Link for page transition */}
      <Link
        to="/"
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        SOP Management
        <ChevronRight className="h-3 w-3" />
      </Link>
    </header>
  );
}
