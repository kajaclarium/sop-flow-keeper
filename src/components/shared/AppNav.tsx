import { Link, useLocation, useParams } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import {
  ShieldCheck, Boxes, ArrowLeftRight, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Navigation items for the application modules, constructed dynamically per department. */
const buildNavItems = (departmentId: string) => [
  { path: `/department/${departmentId}/sop`, label: "SOP Management", shortLabel: "SOPs", icon: ShieldCheck },
  { path: `/department/${departmentId}/work-inventory`, label: "Work Inventory", shortLabel: "Inventory", icon: Boxes },
];

/** Unified navigation bar shared across all modules for seamless cross-module switching. */
export function AppNav() {
  const location = useLocation();
  const { departmentId } = useParams<{ departmentId: string }>();
  const currentPath = location.pathname;

  /* If no departmentId is available, only show the DWM home link */
  if (!departmentId) {
    return (
      <nav className="flex items-center gap-1 px-1 py-1 rounded-lg bg-muted/50 border">
        <Link to="/" className="no-underline">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground shadow-sm">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </div>
        </Link>
      </nav>
    );
  }

  const navItems = buildNavItems(departmentId);

  return (
    <nav className="flex items-center gap-1 px-1 py-1 rounded-lg bg-muted/50 border">
      {/* Home link back to DWM landing */}
      <Link to="/" className="no-underline">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Home</span>
        </div>
      </Link>

      {/* Module tabs */}
      {navItems.map((item) => {
        const isActive = currentPath.startsWith(item.path);
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path} className="no-underline">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{item.shortLabel}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

/** Quick switch button that navigates to the other module — ideal for embedding in context. */
export function QuickSwitch() {
  const location = useLocation();
  const { departmentId } = useParams<{ departmentId: string }>();

  /* Without a departmentId, quick switch is not meaningful */
  if (!departmentId) return null;

  const isOnSop = location.pathname.includes("/sop");
  const target = isOnSop
    ? `/department/${departmentId}/work-inventory`
    : `/department/${departmentId}/sop`;
  const targetLabel = isOnSop ? "Work Inventory" : "SOP Management";
  const TargetIcon = isOnSop ? Boxes : ShieldCheck;

  return (
    <Link to={target} className="no-underline">
      <EzButton variant="outlined" size="small" icon={<TargetIcon className="h-3.5 w-3.5" />}>
        <span className="hidden sm:inline">{targetLabel}</span>
        <ArrowLeftRight className="h-3 w-3 ml-1 sm:hidden" />
      </EzButton>
    </Link>
  );
}
