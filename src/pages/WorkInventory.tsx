import { WorkInventoryProvider, useWorkInventory } from "@/contexts/WorkInventoryContext";
import { WorkInventoryTopBar } from "@/components/workInventory/WorkInventoryTopBar";
import { ModuleList } from "@/components/workInventory/ModuleList";
import { TaskList } from "@/components/workInventory/TaskList";
import { TaskDetail } from "@/components/workInventory/TaskDetail";

function WorkInventoryApp() {
  const { currentView } = useWorkInventory();

  return (
    <div className="flex flex-col min-h-screen w-full">
      <WorkInventoryTopBar />
      {currentView === "modules" && <ModuleList />}
      {currentView === "tasks" && <TaskList />}
      {currentView === "taskDetail" && <TaskDetail />}
    </div>
  );
}

export default function WorkInventory() {
  return (
    <WorkInventoryProvider>
      <WorkInventoryApp />
    </WorkInventoryProvider>
  );
}
