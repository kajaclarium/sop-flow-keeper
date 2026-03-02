import { LayoutGrid } from "lucide-react";
import { AppNav } from "./AppNav";

/** Standard sticky top bar for DWM — provides consistent branding and cross-module navigation. */
export function GlobalHeader() {
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary shrink-0">
          <LayoutGrid className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight">DWM</span>
          <p className="text-[10px] text-muted-foreground leading-none uppercase tracking-tighter font-bold">Daily Work Management</p>
        </div>
      </div>
      <AppNav />
    </header>
  );
}
