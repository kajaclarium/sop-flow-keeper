import { useParams } from "react-router-dom";
import { WorkInventoryProvider, useWorkInventory } from "@/contexts/WorkInventoryContext";
import { WorkInventoryTopBar } from "@/components/workInventory/WorkInventoryTopBar";
import { ModuleList } from "@/components/workInventory/ModuleList";
import { TaskList } from "@/components/workInventory/TaskList";
import { TaskDetail } from "@/components/workInventory/TaskDetail";
import { WorkInventorySidebar } from "@/components/workInventory/WorkInventorySidebar";

function WorkInventoryApp() {
  const { currentView } = useWorkInventory();

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
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <WorkInventoryTopBar />
        <WorkInventoryApp />
      </div>
    </WorkInventoryProvider>
  );
}
