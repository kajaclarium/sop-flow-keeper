import { useState, useCallback } from "react";
import { useSOP } from "@/contexts/SOPContext";
import { SOPFormat, SOPStep } from "@/types/sop";
import { StepCard } from "./StepCard";
import { FileUploadZone } from "./FileUploadZone";
import { StatusWorkflow } from "./StatusWorkflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Hash,
  FileUp,
  Save,
  Send,
  CheckCircle2,
  Lock,
  RotateCcw,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const owners = ["Sarah Chen", "Mike Torres", "Emily Park", "James Rodriguez", "Lisa Wang", "David Kim"];

const makeStep = (): SOPStep => ({
  id: crypto.randomUUID(),
  instruction: "",
  requirePhoto: false,
  requireEvidenceFile: false,
  requireMeasurement: false,
});

export function SOPEditor({ mode }: { mode: "create" | "edit" }) {
  const {
    navigateToList,
    navigateToView,
    createSop,
    updateSop,
    transitionStatus,
    createNewVersion,
    getSelectedSop,
  } = useSOP();
  const { toast } = useToast();

  const existingSop = mode === "edit" ? getSelectedSop() : undefined;
  const isLocked = existingSop?.status === "Effective";

  const [title, setTitle] = useState(existingSop?.title || "");
  const [owner, setOwner] = useState(existingSop?.owner || "");
  const [format, setFormat] = useState<SOPFormat>(existingSop?.format || "block");
  const [fileName, setFileName] = useState(existingSop?.fileName || "");
  const [fileContent, setFileContent] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(existingSop?.aiAnalysis || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtractingSteps, setIsExtractingSteps] = useState(false);

  // Local steps state for create mode
  const [localSteps, setLocalSteps] = useState<SOPStep[]>(
    existingSop?.steps?.length ? existingSop.steps : [makeStep()]
  );

  const canEdit = !isLocked;

  const handleLocalStepUpdate = useCallback((stepId: string, updates: Partial<SOPStep>) => {
    setLocalSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
  }, []);

  const handleLocalStepRemove = useCallback((stepId: string) => {
    setLocalSteps((prev) => prev.filter((s) => s.id !== stepId));
  }, []);

  const handleLocalStepAdd = useCallback(() => {
    setLocalSteps((prev) => [...prev, makeStep()]);
  }, []);

  const handleFileSelected = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!fileContent || !fileName) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-sop", {
        body: { fileName, fileContent },
      });
      if (error) throw error;
      const analysis = data?.analysis || "Analysis complete.";
      setAiAnalysis(analysis);
      if (existingSop) {
        updateSop(existingSop.id, { aiAnalysis: analysis });
      }
      toast({ title: "AI Analysis Complete", description: "Your document has been analyzed." });
    } catch (err: any) {
      toast({ title: "Analysis Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [fileContent, fileName, existingSop, updateSop, toast]);

  // Extract steps from file content via AI and switch to block editor
  const handleConvertToBlocks = useCallback(async () => {
    if (!fileContent || !fileName) return;
    setIsExtractingSteps(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-sop", {
        body: { fileName, fileContent, extractSteps: true },
      });
      if (error) throw error;
      const steps: SOPStep[] = (data?.steps || []).map((s: any) => ({
        id: crypto.randomUUID(),
        instruction: s.instruction || "",
        requirePhoto: s.requirePhoto || false,
        requireEvidenceFile: s.requireEvidenceFile || false,
        requireMeasurement: false,
      }));
      if (steps.length > 0) {
        setLocalSteps(steps);
        setFormat("block");
        toast({ title: "Steps Extracted", description: `${steps.length} steps imported into Block Editor.` });
      } else {
        toast({ title: "No Steps Found", description: "AI couldn't extract steps. Try editing manually.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Extraction Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsExtractingSteps(false);
    }
  }, [fileContent, fileName, toast]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (mode === "create") {
      const id = createSop(title, format, owner || "Unassigned", localSteps);
      toast({ title: "SOP Created", description: `${id} saved as draft.` });
      navigateToList();
    } else if (existingSop) {
      updateSop(existingSop.id, {
        title,
        owner: owner || existingSop.owner,
        steps: localSteps,
        fileName: fileName || undefined,
        aiAnalysis: aiAnalysis || undefined,
      });
      toast({ title: "SOP Updated" });
      navigateToView(existingSop.id);
    }
  }, [title, format, owner, mode, existingSop, localSteps, fileName, aiAnalysis, createSop, updateSop, navigateToList, navigateToView, toast]);

  const handleTransition = useCallback(
    (newStatus: "In Review" | "Approved" | "Effective") => {
      if (!existingSop) return;
      transitionStatus(existingSop.id, newStatus);
      toast({ title: `Status → ${newStatus}` });
    },
    [existingSop, transitionStatus, toast]
  );

  const handleNewVersion = useCallback(() => {
    if (!existingSop) return;
    createNewVersion(existingSop.id);
    toast({ title: "New Version Created", description: "SOP is now a draft again." });
  }, [existingSop, createNewVersion, toast]);

  const sop = existingSop;
  const activeFormat = mode === "edit" ? sop?.format || format : format;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Back + title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={navigateToList}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-sm font-semibold">
            {mode === "create" ? "New SOP Document" : `Edit ${sop?.id || ""}`}
          </h1>
          {sop && (
            <div className="ml-auto">
              <StatusWorkflow currentStatus={sop.status} />
            </div>
          )}
        </div>

        {/* Metadata card */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h2 className="text-lg font-semibold">Document Metadata</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">SOP ID</Label>
              <Input value={sop?.id || "Auto-generated"} disabled className="bg-muted font-mono text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Version</Label>
              <Input value={sop?.currentVersion || "v0.1"} disabled className="bg-muted font-mono text-sm" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Document Title</Label>
              <Input
                placeholder="Enter SOP title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assigned Owner</Label>
              <Select value={owner} onValueChange={setOwner} disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Effective Date</Label>
              <Input value={sop?.effectiveDate || "—"} disabled className="bg-muted text-sm" />
            </div>
          </div>
        </div>

        {/* Format toggle */}
        <div className="flex items-center justify-center">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <button
              onClick={() => setFormat("block")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeFormat === "block" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Hash className="h-4 w-4" /> Block Builder
            </button>
            <button
              onClick={() => setFormat("file")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeFormat === "file" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileUp className="h-4 w-4" /> File Wrapper
            </button>
          </div>
        </div>

        {/* Block Builder */}
        {activeFormat === "block" && (
          <div className="space-y-3">
            {localSteps.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                onUpdate={(updates) => handleLocalStepUpdate(step.id, updates)}
                onRemove={() => handleLocalStepRemove(step.id)}
                canRemove={localSteps.length > 1}
                disabled={!canEdit}
              />
            ))}
            {canEdit && (
              <Button variant="outline" className="w-full gap-2 border-dashed" onClick={handleLocalStepAdd}>
                <Plus className="h-4 w-4" /> Add Step
              </Button>
            )}
          </div>
        )}

        {/* File Wrapper */}
        {activeFormat === "file" && (
          <div className="space-y-4">
            <FileUploadZone
              onFileSelected={handleFileSelected}
              fileName={fileName}
              aiAnalysis={aiAnalysis}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAnalyze}
              disabled={!canEdit}
            />
            {/* Convert to Block Editor button */}
            {fileName && fileContent && canEdit && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleConvertToBlocks}
                  disabled={isExtractingSteps}
                >
                  {isExtractingSteps ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-4 w-4" />
                  )}
                  {isExtractingSteps ? "Extracting Steps…" : "Convert to Block Editor"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            {sop?.status === "Effective" && (
              <Button variant="outline" className="gap-1.5" onClick={handleNewVersion}>
                <RotateCcw className="h-4 w-4" /> Create New Version
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-1.5" onClick={handleSave} disabled={!canEdit}>
              <Save className="h-4 w-4" /> Save {mode === "create" ? "Draft" : ""}
            </Button>
            {sop?.status === "Draft" && (
              <Button variant="secondary" className="gap-1.5" onClick={() => handleTransition("In Review")}>
                <Send className="h-4 w-4" /> Send for Review
              </Button>
            )}
            {sop?.status === "In Review" && (
              <Button variant="secondary" className="gap-1.5" onClick={() => handleTransition("Approved")}>
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
            )}
            {sop?.status === "Approved" && (
              <Button className="gap-1.5" onClick={() => handleTransition("Effective")}>
                <Lock className="h-4 w-4" /> Make Effective
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
