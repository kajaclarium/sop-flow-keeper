import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { DWMLanding } from "@/components/organization/DWMLanding";
import { OrgStructurePage } from "@/components/organization/OrgStructurePage";
import Index from "./pages/Index";
import WorkInventory from "./pages/WorkInventory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <BrowserRouter>
          <Routes>
            {/* DWM Landing — organizational tree */}
            <Route path="/" element={<DWMLanding />} />

            {/* Org Structure — 3-tier RACI role catalog */}
            <Route path="/org-structure" element={<OrgStructurePage />} />

            {/* Department-scoped SOP Management */}
            <Route path="/department/:departmentId/sop" element={<Index />} />

            {/* Department-scoped Work Inventory */}
            <Route path="/department/:departmentId/work-inventory" element={<WorkInventory />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrganizationProvider>
    </QueryClientProvider>
  );
}
