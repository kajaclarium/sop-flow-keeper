import { FileText, Blocks } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormatIconProps {
  format: "block" | "file";
  className?: string;
}

export function FormatIcon({ format, className }: FormatIconProps) {
  const Icon = format === "block" ? Blocks : FileText;
  return (
    <div
      className={cn(
        "flex items-center justify-center h-8 w-8 rounded-md",
        format === "block" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}
