import { useState, useRef, useEffect, useCallback } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  /** The tooltip title displayed in bold. */
  title: string;
  /** The main description text explaining the concept. */
  description: string;
  /** Optional secondary guidance or best-practice tip. */
  tip?: string;
  /** Preferred side for the tooltip. Defaults to "right". */
  side?: "top" | "right" | "bottom" | "left";
  /** Size of the info icon. Defaults to 14px. */
  iconSize?: number;
  /** Additional CSS class for the icon wrapper. */
  className?: string;
}

/** Enterprise contextual help icon. Hover or click to see an explanation popover. */
export function InfoTooltip({ title, description, tip, side = "right", iconSize = 14, className }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /** Closes the tooltip when clicking outside of it. */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setVisible(false);
      setPinned(false);
    }
  }, []);

  useEffect(() => {
    if (pinned) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pinned, handleClickOutside]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPinned(!pinned);
    setVisible(!pinned);
  };

  const handleMouseEnter = () => {
    if (!pinned) setVisible(true);
  };

  const handleMouseLeave = () => {
    if (!pinned) setVisible(false);
  };

  /* Position classes based on the preferred side */
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  /* Arrow classes for the tooltip pointer */
  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[--tooltip-bg]",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[--tooltip-bg]",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[--tooltip-bg]",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[--tooltip-bg]",
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center rounded-full p-0.5 transition-all",
          "text-muted-foreground/60 hover:text-primary hover:bg-primary/10",
          pinned && "text-primary bg-primary/10 ring-1 ring-primary/30"
        )}
        aria-label={`Info: ${title}`}
      >
        <Info style={{ width: iconSize, height: iconSize }} />
      </button>

      {visible && (
        <div
          className={cn(
            "absolute z-50 w-72 rounded-xl border bg-popover shadow-xl p-4 space-y-2",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            positionClasses[side]
          )}
          style={{ ["--tooltip-bg" as string]: "hsl(var(--popover))" }}
        >
          {/* Arrow */}
          <div className={cn("absolute w-0 h-0 border-[6px]", arrowClasses[side])} />

          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <Info className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold leading-tight">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>

          {tip && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">Best Practice</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
