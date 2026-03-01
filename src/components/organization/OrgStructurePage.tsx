import { useState } from "react";
import { Link } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import { Network, ChevronRight } from "lucide-react";
import { RoleTierId } from "@/types/organization";
import { TierList } from "@/components/organization/TierList";
import { RoleList } from "@/components/organization/RoleList";
import { AppNav } from "@/components/shared/AppNav";

/** View state for the Org Structure page: tiers (parent) or roles within a tier (child). */
type OrgStructureView = "tiers" | "roles";

/** Org Structure page — manages 3-tier role hierarchy with RACI designations. */
export function OrgStructurePage() {
  const [currentView, setCurrentView] = useState<OrgStructureView>("tiers");
  const [selectedTierId, setSelectedTierId] = useState<RoleTierId | null>(null);

  /** Navigates into a specific tier's role list. */
  const handleSelectTier = (tierId: RoleTierId) => {
    setSelectedTierId(tierId);
    setCurrentView("roles");
  };

  /** Navigates back to the tier list. */
  const handleBackToTiers = () => {
    setSelectedTierId(null);
    setCurrentView("tiers");
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Standard sticky top bar — matches SOP and Work Inventory modules */}
      <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          {/* Logo — home (Departments) link */}
          <Link to="/" className="no-underline flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary shrink-0">
              <Network className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight">Org Structure</span>
              <p className="text-[10px] text-muted-foreground leading-none group-hover:text-primary transition-colors">
                Departments
              </p>
            </div>
          </Link>

          {/* Breadcrumb: Departments > Org Structure > [Tier] Roles */}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <EzButton
            variant="text"
            onClick={handleBackToTiers}
            className={`text-xs font-medium p-0 ${
              currentView === "tiers" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Org Structure
          </EzButton>

          {currentView === "roles" && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs font-semibold text-foreground">
                {selectedTierId ? selectedTierId.charAt(0).toUpperCase() + selectedTierId.slice(1) : ""} Roles
              </span>
            </>
          )}
        </div>

        {/* Module switcher dropdown — same as all other pages */}
        <AppNav />
      </header>

      {/* Content */}
      {currentView === "tiers" && <TierList onSelectTier={handleSelectTier} />}
      {currentView === "roles" && selectedTierId && <RoleList tierId={selectedTierId} />}
    </div>
  );
}
