import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import WorkInventory from "./pages/WorkInventory";
import NotFound from "./pages/NotFound";
import OrgStructure_New from "./pages/OrgStructure_New";
import Org_Structure from "./pages/Org_Structure";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Layout route — sidebar + content */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/work-inventory" element={<WorkInventory />} />
            <Route path="/org_structure" element={<Org_Structure />} />
          </Route>

          {/* Standalone pages (no sidebar) */}
          <Route path="/orgstructure_new" element={<OrgStructure_New />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
