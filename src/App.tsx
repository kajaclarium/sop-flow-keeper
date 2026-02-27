import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/" element={<Index />} />
          <Route path="/work-inventory" element={<WorkInventory />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/orgstructure_new" element={<OrgStructure_New />} />
          <Route path="/org_structure" element={<Org_Structure />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
