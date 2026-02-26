import { Link, useLocation } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import {
  ShieldCheck, Boxes, ArrowLeftRight, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Navigation items for the application modules. */
const NAV_ITEMS = [
  { path: "/", label: "SOP Management", shortLabel: "SOPs", icon: ShieldCheck, description: "Manage standard operating procedures" },
  { path: "/work-inventory", label: "Work Inventory", shortLabel: "Inventory", icon: Boxes, description: "Process registry and task management" },
];

/** Unified navigation bar shared across all modules for seamless cross-module switching. */
export function AppNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="flex items-center gap-1 px-1 py-1 rounded-lg bg-muted/50 border">
      {NAV_ITEMS.map((item) => {
        const isActive = item.path === "/"
          ? currentPath === "/"
          : currentPath.startsWith(item.path);
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
  const isOnSop = location.pathname === "/";
  const target = isOnSop ? "/work-inventory" : "/";
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
