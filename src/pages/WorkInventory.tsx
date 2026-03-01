import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { WorkInventoryProvider, useWorkInventory } from "@/contexts/WorkInventoryContext";
import { SOPProvider } from "@/contexts/SOPContext";
import { WorkInventoryTopBar } from "@/components/workInventory/WorkInventoryTopBar";
import { ModuleList } from "@/components/workInventory/ModuleList";
import { TaskList } from "@/components/workInventory/TaskList";
import { TaskDetail } from "@/components/workInventory/TaskDetail";
import { WorkInventorySidebar } from "@/components/workInventory/WorkInventorySidebar";

function WorkInventoryApp() {
  const { currentView, allTasks, navigateToTasks, navigateToTaskDetail } = useWorkInventory();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskIdParam = searchParams.get("taskId");

  /** 
   * Handle deep-linking from SOP module or external links.
   * If ?taskId=... is present, find the task and auto-navigate to its detail view.
   */
  useEffect(() => {
    if (taskIdParam && allTasks.length > 0) {
      const task = allTasks.find(t => t.id === taskIdParam);
      if (task) {
        navigateToTasks(task.moduleId);
        // Small delay to ensure module view is set before opening detail
        setTimeout(() => navigateToTaskDetail(task.id), 10);
        
        // Clear the param after handling to prevent loops/re-selection on re-mounts
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("taskId");
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [taskIdParam, allTasks, navigateToTasks, navigateToTaskDetail, searchParams, setSearchParams]);

  return (
    <div className="flex-1 flex overflow-hidden">
      <WorkInventorySidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {currentView === "modules" && <ModuleList />}
        {currentView === "tasks" && <TaskList />}
        {currentView === "taskDetail" && <TaskDetail />}
      </main>
    </div>
  );
}

export default function WorkInventory() {
  const { departmentId } = useParams<{ departmentId: string }>();

  return (
    <WorkInventoryProvider departmentId={departmentId}>
      {/* SOPProvider needed by WorkInventoryTopBar's GlobalSearch for cross-module SOP navigation */}
      <SOPProvider departmentId={departmentId}>
        <div className="flex flex-col h-screen w-full overflow-hidden">
          <WorkInventoryTopBar />
          <WorkInventoryApp />
        </div>
      </SOPProvider>
    </WorkInventoryProvider>
  );
}

