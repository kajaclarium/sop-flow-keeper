import React from "react";
import { cn } from "@/lib/utils";
import { GlobalHeader } from "./GlobalHeader";

interface PageShellProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

/**
 * Premium layout wrapper for DWM sub-pages.
 * Provides a consistent header, sidebar slot, and main content area.
 */
export function PageShell({
  children,
  icon,
  title,
  subtitle,
  breadcrumbs,
  sidebar,
  className,
}: PageShellProps) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50/50">
      {/* Global Branding & Navigation */}
      <GlobalHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Slot */}
        {sidebar && (
          <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto shadow-sm z-30">
            {sidebar}
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Internal Page Header */}
          <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20">
            <div className="flex items-center gap-3 overflow-hidden">
              {icon && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-slate-800 truncate">{title}</h1>
                  {breadcrumbs && (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {breadcrumbs}
                    </div>
                  )}
                </div>
                {subtitle && <p className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-wider">{subtitle}</p>}
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <div className={cn("flex-1 overflow-auto flex flex-col", className)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
