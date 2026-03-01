import { useState, useCallback } from "react";
import { useSOP } from "@/contexts/SOPContext";
import { SOPFormat, SOPStep } from "@/types/sop";
import { StepCard } from "./StepCard";
import { FileUploadZone } from "./FileUploadZone";
import { StatusWorkflow } from "./StatusWorkflow";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EzButton, EzInput } from "@clarium/ezui-react-components";
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

/** Creates a new empty SOP step with a unique ID. */
const makeStep = (): SOPStep => ({
  id: crypto.randomUUID(),
  instruction: "",
  requirePhoto: false,
  requireEvidenceFile: false,
  requireMeasurement: false,
  inputs: [],
  outputs: [],
});

interface SOPEditorProps {
  mode: "create" | "edit";
}

/** Full SOP editor with metadata fields, block builder, and file wrapper modes. */
export function SOPEditor({ mode }: SOPEditorProps) {
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

  /* Local steps state for create mode */
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please try again.";
      toast({ title: "Analysis Failed", description: message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [fileContent, fileName, existingSop, updateSop, toast]);

  /** Extract steps from file content via AI and switch to block editor */
  const handleConvertToBlocks = useCallback(async () => {
    if (!fileContent || !fileName) return;
    setIsExtractingSteps(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-sop", {
        body: { fileName, fileContent, extractSteps: true },
      });
      if (error) throw error;
      const steps: SOPStep[] = (data?.steps || []).map((s: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        instruction: (s.instruction as string) || "",
        requirePhoto: (s.requirePhoto as boolean) || false,
        requireEvidenceFile: (s.requireEvidenceFile as boolean) || false,
        requireMeasurement: false,
      }));
      if (steps.length > 0) {
        setLocalSteps(steps);
        setFormat("block");
        toast({ title: "Steps Extracted", description: `${steps.length} steps imported into Block Editor.` });
      } else {
        toast({ title: "No Steps Found", description: "AI couldn't extract steps. Try editing manually.", variant: "destructive" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please try again.";
      toast({ title: "Extraction Failed", description: message, variant: "destructive" });
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
          <EzButton variant="text" size="small" onClick={navigateToList} icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </EzButton>
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Document Metadata</h2>
            <InfoTooltip
              title="Document Metadata"
              description="Metadata includes the SOP's unique ID, version number, title, owner, and effective date. The ID and version are auto-generated. The effective date is set when the SOP reaches 'Effective' status."
              tip="Choose a clear, descriptive title that makes this SOP easy to find. The owner should be the person responsible for keeping this document current."
              side="right"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <EzInput
              label="SOP ID"
              value={sop?.id || "Auto-generated"}
              disabled
              className="bg-muted font-mono text-sm"
            />
            <EzInput
              label="Version"
              value={sop?.currentVersion || "v0.1"}
              disabled
              className="bg-muted font-mono text-sm"
            />
            <div className="col-span-2">
              <EzInput
                label="Document Title"
                placeholder="Enter SOP title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <EzInput
              label="Effective Date"
              value={sop?.effectiveDate || "—"}
              disabled
              className="bg-muted text-sm"
            />
          </div>
        </div>

        {/* Format toggle */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <EzButton
              variant={activeFormat === "block" ? "classic" : "text"}
              onClick={() => setFormat("block")}
              icon={<Hash className="h-4 w-4" />}
              size="small"
            >
              Block Builder
            </EzButton>
            <EzButton
              variant={activeFormat === "file" ? "classic" : "text"}
              onClick={() => setFormat("file")}
              icon={<FileUp className="h-4 w-4" />}
              size="small"
            >
              File Wrapper
            </EzButton>
          </div>
          <InfoTooltip
            title="SOP Format"
            description="Choose how to author this SOP. 'Block Builder' lets you create structured, step-by-step procedures inline. 'File Wrapper' lets you upload an existing document (PDF, DOCX) and optionally run AI analysis on it."
            tip="Use Block Builder for new SOPs to ensure consistent structure. Use File Wrapper for existing documents you want to bring into the system."
            side="right"
            iconSize={13}
          />
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
              <EzButton variant="outlined" fullWidth onClick={handleLocalStepAdd} icon={<Plus className="h-4 w-4" />}>
                Add Step
              </EzButton>
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
                <EzButton
                  variant="outlined"
                  onClick={handleConvertToBlocks}
                  disabled={isExtractingSteps}
                  icon={isExtractingSteps ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
                >
                  {isExtractingSteps ? "Extracting Steps…" : "Convert to Block Editor"}
                </EzButton>
              </div>
            )}
          </div>
        )}

        {/* Action footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            {sop?.status === "Effective" && (
              <EzButton variant="outlined" onClick={handleNewVersion} icon={<RotateCcw className="h-4 w-4" />}>
                Create New Version
              </EzButton>
            )}
          </div>
          <div className="flex items-center gap-3">
            <EzButton variant="outlined" onClick={handleSave} disabled={!canEdit} icon={<Save className="h-4 w-4" />}>
              Save {mode === "create" ? "Draft" : ""}
            </EzButton>
            {sop?.status === "Draft" && (
              <EzButton severity="secondary" onClick={() => handleTransition("In Review")} icon={<Send className="h-4 w-4" />}>
                Send for Review
              </EzButton>
            )}
            {sop?.status === "In Review" && (
              <EzButton severity="secondary" onClick={() => handleTransition("Approved")} icon={<CheckCircle2 className="h-4 w-4" />}>
                Approve
              </EzButton>
            )}
            {sop?.status === "Approved" && (
              <EzButton severity="primary" onClick={() => handleTransition("Effective")} icon={<Lock className="h-4 w-4" />}>
                Make Effective
              </EzButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
