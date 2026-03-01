import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import {
  ShieldCheck, Boxes, Network, LayoutGrid, ChevronDown, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Unified navigation bar shared across all modules for seamless cross-module switching. */
export function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { departmentId } = useParams<{ departmentId: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPath = location.pathname;

  /** Close dropdown when clicking outside. */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* If no departmentId is available, only show the DWM home link */
  if (!departmentId) {
    return (
      <nav className="flex items-center">
        <Link to="/" className="no-underline">
          <EzButton variant="text" icon={<LayoutGrid className="h-4 w-4" />}>
            Home
          </EzButton>
        </Link>
      </nav>
    );
  }

  const isSopActive = currentPath.includes("/sop");
  const isInventoryActive = currentPath.includes("/work-inventory");
  const isOrgActive = currentPath.includes("/org-structure");

  const activeModule = isSopActive 
    ? { label: "SOP Vault", icon: ShieldCheck, color: "text-primary" }
    : isInventoryActive 
    ? { label: "Work Inventory", icon: Boxes, color: "text-primary" }
    : isOrgActive
    ? { label: "Org Structure", icon: Network, color: "text-primary" }
    : { label: "DWM Hub", icon: LayoutGrid, color: "text-muted-foreground" };

  const menuItems = [
    {
      id: "sop",
      label: "SOP Management",
      icon: ShieldCheck,
      active: isSopActive,
      onClick: () => navigate(`/department/${departmentId}/sop`),
    },
    {
      id: "inventory",
      label: "Work Inventory",
      icon: Boxes,
      active: isInventoryActive,
      onClick: () => navigate(`/department/${departmentId}/work-inventory`),
    },
    {
      id: "org",
      label: "Org Structure",
      icon: Network,
      active: isOrgActive,
      onClick: () => navigate("/org-structure"),
    },
    {
      id: "home",
      label: "Back to Home",
      icon: LayoutGrid,
      active: false,
      onClick: () => navigate("/"),
      isSecondary: true,
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <EzButton 
        variant="text" 
        className={cn(
          "h-9 px-3 gap-2 hover:bg-accent/50 group transition-all duration-200",
          isOpen && "bg-accent/50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <activeModule.icon className={cn("h-4 w-4 transition-colors", activeModule.color)} />
        <span className="text-xs font-semibold hidden md:inline">
          {activeModule.label}
        </span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200",
          isOpen && "rotate-180 text-foreground"
        )} />
      </EzButton>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-56 z-50 rounded-xl border bg-popover shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  {item.isSecondary && <div className="mx-2 my-1.5 border-t" />}
                  <button
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                      item.active 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("h-4 w-4", item.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span>{item.label}</span>
                    </div>
                    {item.active && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}



