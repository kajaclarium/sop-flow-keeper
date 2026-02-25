import { SOPProvider, useSOP } from "@/contexts/SOPContext";
import { TopBar } from "@/components/sop/TopBar";
import { SOPList } from "@/components/sop/SOPList";
import { SOPEditor } from "@/components/sop/SOPEditor";
import { SOPViewer } from "@/components/sop/SOPViewer";
import { BusinessProcessList } from "@/components/sop/BusinessProcessList";

function SOPApp() {
  const { currentView } = useSOP();

  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopBar />
      {currentView === "processes" && <BusinessProcessList />}
      {currentView === "list" && <SOPList />}
      {currentView === "create" && <SOPEditor mode="create" />}
      {currentView === "edit" && <SOPEditor mode="edit" />}
      {currentView === "view" && <SOPViewer />}
    </div>
  );
}

export default function Index() {
  return (
    <SOPProvider>
      <SOPApp />
    </SOPProvider>
  );
}
