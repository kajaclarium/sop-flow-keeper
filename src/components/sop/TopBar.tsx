import { Link, useParams } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import { ShieldCheck, ChevronRight, LayoutGrid } from "lucide-react";
import { useSOP } from "@/contexts/SOPContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { AppNav } from "@/components/shared/AppNav";

interface TopBarProps {
  children?: React.ReactNode;
}

/** Top navigation bar with breadcrumb navigation and cross-module switcher for the SOP feature. */
export function TopBar({ children }: TopBarProps) {
  const { currentView, navigateToProcesses, navigateToList, getSelectedProcess, getSelectedSop } = useSOP();
  const { getDepartmentById } = useOrganization();
  const { departmentId } = useParams<{ departmentId: string }>();

  const department = departmentId ? getDepartmentById(departmentId) : null;
  const process = getSelectedProcess();
  const sop = getSelectedSop();
  const showProcessCrumb = currentView !== "processes";
  const showListCrumb = currentView !== "processes" && currentView !== "list" && process;

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        {/* DWM home link */}
        <Link to="/" className="no-underline flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">SOPvault</span>
            <p className="text-[10px] text-muted-foreground leading-none">Enterprise SOP Platform</p>
          </div>
        </Link>

        {/* Department breadcrumb */}
        {department && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <EzButton
              variant="text"
              onClick={navigateToProcesses}
              className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
            >
              {department.name}
            </EzButton>
          </>
        )}

        {/* Process breadcrumb */}
        {showProcessCrumb && process && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <EzButton
              variant="text"
              onClick={() => navigateToList()}
              className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
            >
              {process.name}
            </EzButton>
          </>
        )}

        {/* SOP breadcrumb */}
        {(currentView === "view" || currentView === "edit") && sop && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{sop.title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
        <AppNav />
      </div>
    </header>
  );
}
