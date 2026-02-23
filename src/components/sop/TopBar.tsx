import { ShieldCheck } from "lucide-react";

export function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
          <ShieldCheck className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight">SOPvault</span>
          <p className="text-[10px] text-muted-foreground leading-none">Enterprise SOP Platform</p>
        </div>
      </div>
      {children}
    </header>
  );
}
