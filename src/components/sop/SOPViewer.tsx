import { useSOP } from "@/contexts/SOPContext";
import { SOPStatusBadge } from "./SOPStatusBadge";
import { StatusWorkflow } from "./StatusWorkflow";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Pencil,
  Lock,
  Send,
  CheckCircle2,
  RotateCcw,
  Camera,
  Hash,
  FileText,
  Blocks,
  Clock,
  User,
  History,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function SOPViewer() {
  const { getSelectedSop, navigateToList, navigateToEdit, transitionStatus, createNewVersion } = useSOP();
  const { toast } = useToast();
  const sop = getSelectedSop();

  if (!sop) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">SOP not found</p>
      </div>
    );
  }

  const isLocked = sop.status === "Effective";

  const handleTransition = (newStatus: "In Review" | "Approved" | "Effective") => {
    transitionStatus(sop.id, newStatus);
    toast({ title: `Status → ${newStatus}` });
  };

  const handleNewVersion = () => {
    createNewVersion(sop.id);
    toast({ title: "New Version Created" });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={navigateToList}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-sm font-semibold">{sop.id}</h1>
          <SOPStatusBadge status={sop.status} />
          <div className="ml-auto flex items-center gap-2">
            {!isLocked && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigateToEdit(sop.id)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
            {isLocked && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleNewVersion}>
                <RotateCcw className="h-3.5 w-3.5" /> New Version
              </Button>
            )}
          </div>
        </div>

        {/* Workflow */}
        <StatusWorkflow currentStatus={sop.status} />

        {/* Document card */}
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">{sop.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {sop.owner}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Created {sop.createdAt}</span>
              <span className="font-mono">{sop.currentVersion}</span>
              <span className="flex items-center gap-1">
                {sop.format === "block" ? <Blocks className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                {sop.format === "block" ? "Block Builder" : "File Wrapper"}
              </span>
            </div>
          </div>

          {/* Steps */}
          {sop.format === "block" && sop.steps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Procedure Steps</h3>
              {sop.steps.map((step, i) => (
                <div key={step.id} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{step.instruction || <span className="text-muted-foreground italic">No instruction</span>}</p>
                    {(step.requirePhoto || step.requireMeasurement) && (
                      <div className="flex items-center gap-3 mt-1.5">
                        {step.requirePhoto && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <Camera className="h-3 w-3" /> Photo Required
                          </span>
                        )}
                        {step.requireMeasurement && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <Hash className="h-3 w-3" /> Measurement Required
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File */}
          {sop.format === "file" && sop.fileName && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{sop.fileName}</p>
                <p className="text-xs text-muted-foreground">Attached document</p>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {sop.aiAnalysis && (
            <div className="rounded-lg border bg-primary/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">AI Analysis</h3>
              </div>
              <div className="prose prose-sm max-w-none text-sm">
                <ReactMarkdown>{sop.aiAnalysis}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Version history */}
          {sop.versions.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <History className="h-3.5 w-3.5" /> Version History
              </h3>
              <div className="space-y-2">
                {sop.versions.map((v) => (
                  <div key={v.version} className={cn(
                    "flex items-center gap-4 px-4 py-2.5 rounded-lg border text-sm",
                    v.version === sop.currentVersion ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                  )}>
                    <span className="font-mono font-medium">{v.version}</span>
                    <SOPStatusBadge status={v.status} />
                    <span className="text-xs text-muted-foreground">{v.createdBy}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{v.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {sop.status === "Draft" && (
            <Button variant="secondary" className="gap-1.5" onClick={() => handleTransition("In Review")}>
              <Send className="h-4 w-4" /> Send for Review
            </Button>
          )}
          {sop.status === "In Review" && (
            <Button variant="secondary" className="gap-1.5" onClick={() => handleTransition("Approved")}>
              <CheckCircle2 className="h-4 w-4" /> Approve
            </Button>
          )}
          {sop.status === "Approved" && (
            <Button className="gap-1.5" onClick={() => handleTransition("Effective")}>
              <Lock className="h-4 w-4" /> Make Effective
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
