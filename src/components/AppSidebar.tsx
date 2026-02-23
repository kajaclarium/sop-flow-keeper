import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FilePlus,
  Settings,
  Users,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Create SOP", path: "/create", icon: FilePlus },
  { title: "Compliance", path: "#", icon: ShieldCheck },
  { title: "Team", path: "#", icon: Users },
  { title: "Reports", path: "#", icon: BarChart3 },
  { title: "Settings", path: "#", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sidebar-primary">
          <ShieldCheck className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold text-sidebar-primary-foreground tracking-tight">SOPvault</span>
          <p className="text-[10px] text-sidebar-muted leading-none">Enterprise SOP Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.title}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-sidebar-muted">© 2026 SOPvault</p>
      </div>
    </aside>
  );
}
