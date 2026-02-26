import { EzButton } from "@clarium/ezui-react-components";
import { LayoutGrid } from "lucide-react";

/** Top navigation bar for the DWM Landing page with branding. */
export function DWMTopBar() {
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
          <LayoutGrid className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight">DWM</span>
          <p className="text-[10px] text-muted-foreground leading-none">Daily Work Management</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hidden sm:inline">Enterprise Organization Platform</span>
      </div>
    </header>
  );
}
