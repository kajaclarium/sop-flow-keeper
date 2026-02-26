import { useCallback } from "react";
import { useSOP } from "@/contexts/SOPContext";
import { SOPStatusBadge } from "./SOPStatusBadge";
import { StatusWorkflow } from "./StatusWorkflow";
import { EzButton, EzBadge } from "@clarium/ezui-react-components";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Pencil,
  Lock,
  Send,
  CheckCircle2,
  RotateCcw,
  Camera,
  Paperclip,
  FileText,
  Blocks,
  Clock,
  User,
  History,
  Sparkles,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/** Read-only view of a single SOP document with status actions. */
export function SOPViewer() {
  const { getSelectedSop, navigateToList, navigateToEdit, transitionStatus, createNewVersion } = useSOP();
  const { toast } = useToast();
  const sop = getSelectedSop();

  const handleDownload = useCallback(() => {
    if (!sop) return;
    /* Generate a text document from the SOP data */
    let content = `SOP: ${sop.id}\nTitle: ${sop.title}\nVersion: ${sop.currentVersion}\nStatus: ${sop.status}\nOwner: ${sop.owner}\nEffective Date: ${sop.effectiveDate || "N/A"}\n\n`;
    content += "=" .repeat(60) + "\n\n";

    if (sop.steps.length > 0) {
      content += "PROCEDURE STEPS\n" + "-".repeat(40) + "\n\n";
      sop.steps.forEach((step, i) => {
        content += `Step ${i + 1}: ${step.instruction}\n`;
        const evidence: string[] = [];
        if (step.requirePhoto) evidence.push("Photo Required");
        if (step.requireEvidenceFile) evidence.push("Evidence File Required");
        if (evidence.length) content += `  Evidence: ${evidence.join(", ")}\n`;
        content += "\n";
      });
    }

    if (sop.aiAnalysis) {
      content += "\nAI ANALYSIS\n" + "-".repeat(40) + "\n" + sop.aiAnalysis + "\n";
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sop.id}-${sop.currentVersion}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Document Downloaded" });
  }, [sop, toast]);

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
          <EzButton variant="text" size="small" onClick={navigateToList} icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </EzButton>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-sm font-semibold">{sop.id}</h1>
          <SOPStatusBadge status={sop.status} />
          <div className="ml-auto flex items-center gap-2">
            {isLocked && (
              <>
                <EzButton variant="outlined" size="small" onClick={handleDownload} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </EzButton>
                <EzButton variant="outlined" size="small" onClick={handleNewVersion} icon={<RotateCcw className="h-3.5 w-3.5" />}>
                  New Version
                </EzButton>
              </>
            )}
            {!isLocked && (
              <EzButton variant="outlined" size="small" onClick={() => navigateToEdit(sop.id)} icon={<Pencil className="h-3.5 w-3.5" />}>
                Edit
              </EzButton>
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
          {sop.steps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Procedure Steps</h3>
              {sop.steps.map((step, i) => (
                <div key={step.id} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{step.instruction || <span className="text-muted-foreground italic">No instruction</span>}</p>
                    {(step.requirePhoto || step.requireEvidenceFile) && (
                      <div className="flex items-center gap-3 mt-1.5">
                        {step.requirePhoto && (
                          <EzBadge severity="neutral" size="small" icon={<Camera className="h-3 w-3" />} text="Photo Required" />
                        )}
                        {step.requireEvidenceFile && (
                          <EzBadge severity="neutral" size="small" icon={<Paperclip className="h-3 w-3" />} text="Evidence File Required" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File */}
          {sop.fileName && (
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
                {sop.versions.map((v) => {
                  const isCurrent = v.version === sop.currentVersion;
                  const isPrevious = !isCurrent;
                  return (
                    <div key={v.version} className={cn(
                      "flex items-center gap-4 px-4 py-2.5 rounded-lg border text-sm transition-all",
                      isCurrent && "bg-primary/10 border-primary/30 ring-1 ring-primary/20",
                      isPrevious && "bg-muted/20 opacity-60"
                    )}>
                      <span className={cn(
                        "font-mono font-medium",
                        isPrevious && "line-through text-muted-foreground"
                      )}>{v.version}</span>
                      <SOPStatusBadge status={v.status} />
                      <span className={cn("text-xs text-muted-foreground", isPrevious && "line-through")}>{v.createdBy}</span>
                      <span className={cn("text-xs text-muted-foreground ml-auto", isPrevious && "line-through")}>{v.createdAt}</span>
                      {isCurrent && (
                        <EzBadge severity="primary" size="small" text="Current" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {sop.status === "Draft" && (
            <EzButton severity="secondary" onClick={() => handleTransition("In Review")} icon={<Send className="h-4 w-4" />}>
              Send for Review
            </EzButton>
          )}
          {sop.status === "In Review" && (
            <EzButton severity="secondary" onClick={() => handleTransition("Approved")} icon={<CheckCircle2 className="h-4 w-4" />}>
              Approve
            </EzButton>
          )}
          {sop.status === "Approved" && (
            <EzButton severity="primary" onClick={() => handleTransition("Effective")} icon={<Lock className="h-4 w-4" />}>
              Make Effective
            </EzButton>
          )}
        </div>
      </div>
    </div>
  );
}
