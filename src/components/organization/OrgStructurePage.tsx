import { useState } from "react";
import { Link } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import { Network, ChevronRight } from "lucide-react";
import { RoleTierId } from "@/types/organization";
import { TierList } from "@/components/organization/TierList";
import { RoleList } from "@/components/organization/RoleList";

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
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="no-underline flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
              <Network className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight">Org Structure</span>
              <p className="text-[10px] text-muted-foreground leading-none">RACI Role Catalog</p>
            </div>
          </Link>

          {/* Breadcrumb: back to tiers when viewing roles */}
          {currentView === "roles" && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <EzButton
                variant="text"
                onClick={handleBackToTiers}
                className="text-xs font-medium text-muted-foreground hover:text-foreground p-0"
              >
                Tiers
              </EzButton>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {selectedTierId ? selectedTierId.charAt(0).toUpperCase() + selectedTierId.slice(1) : ""} Roles
              </span>
            </>
          )}
        </div>

        {/* Home link */}
        <Link to="/" className="no-underline">
          <EzButton variant="outlined" size="small">
            Back to DWM
          </EzButton>
        </Link>
      </header>

      {/* Content */}
      {currentView === "tiers" && <TierList onSelectTier={handleSelectTier} />}
      {currentView === "roles" && selectedTierId && <RoleList tierId={selectedTierId} />}
    </div>
  );
}
