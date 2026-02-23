import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Camera,
  Hash,
  GripVertical,
  FileUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  instruction: string;
  requirePhoto: boolean;
  requireMeasurement: boolean;
}

const owners = ["Sarah Chen", "Mike Torres", "Emily Park", "James Rodriguez", "Lisa Wang", "David Kim"];

export default function SOPCreator() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"block" | "file">("block");
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, instruction: "", requirePhoto: false, requireMeasurement: false },
  ]);

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: prev.length + 1, instruction: "", requirePhoto: false, requireMeasurement: false },
    ]);
  };

  const removeStep = (id: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, id: i + 1 })));
  };

  const updateStep = (id: number, field: keyof Step, value: string | boolean) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-8 h-16 border-b bg-card shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-sm font-semibold">New SOP Document</h1>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
            {/* Metadata card */}
            <div className="rounded-xl border bg-card p-6 space-y-5">
              <h2 className="text-lg font-semibold">Document Metadata</h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">SOP ID</Label>
                  <Input value="SOP-009" disabled className="bg-muted font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Version</Label>
                  <Input value="v1.0" disabled className="bg-muted font-mono text-sm" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Document Title</Label>
                  <Input
                    placeholder="Enter SOP title…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Assigned Owner</Label>
                  <Select value={owner} onValueChange={setOwner}>
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
                  <Label className="text-xs text-muted-foreground">Effective Date Range</Label>
                  <Input type="date" />
                </div>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center justify-center">
              <div className="inline-flex rounded-lg border bg-muted p-1">
                <button
                  onClick={() => setMode("block")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                    mode === "block"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Hash className="h-4 w-4" />
                  Block Builder
                </button>
                <button
                  onClick={() => setMode("file")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                    mode === "file"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileUp className="h-4 w-4" />
                  File Wrapper
                </button>
              </div>
            </div>

            {/* Block Builder */}
            {mode === "block" && (
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.id} className="rounded-xl border bg-card p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 pt-2 shrink-0">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          {step.id}
                        </span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Describe this step…"
                          value={step.instruction}
                          onChange={(e) => updateStep(step.id, "instruction", e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                        {/* Evidence Requirements */}
                        <div className="flex items-center gap-5">
                          <span className="text-xs text-muted-foreground font-medium">Evidence:</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={step.requirePhoto}
                              onCheckedChange={(checked) => updateStep(step.id, "requirePhoto", !!checked)}
                            />
                            <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Photo Upload</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={step.requireMeasurement}
                              onCheckedChange={(checked) => updateStep(step.id, "requireMeasurement", !!checked)}
                            />
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Measurement</span>
                          </label>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeStep(step.id)}
                        disabled={steps.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addStep}>
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </div>
            )}

            {/* File Wrapper */}
            {mode === "file" && (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm">Drag & drop your file here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, or image files up to 25MB
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileUp className="h-4 w-4" />
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                  Uploaded files are locked upon approval. New uploads will generate a new version.
                </p>
              </div>
            )}

            {/* Action footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Save Draft</Button>
              <Button variant="secondary">Send for Approval</Button>
              <Button disabled className="gap-1.5 opacity-50">
                Make Effective
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
