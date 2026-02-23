import { useState, useRef, useCallback } from "react";
import { Upload, FileUp, Loader2, FileText, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
  fileName?: string;
  aiAnalysis?: string;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  disabled?: boolean;
}

export function FileUploadZone({
  onFileSelected,
  fileName,
  aiAnalysis,
  isAnalyzing,
  onAnalyze,
  disabled,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  }, [disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [disabled, onFileSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          !isDragging && !disabled && "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
          disabled && "opacity-50 cursor-not-allowed border-border bg-muted/10",
          fileName && "border-primary/30 bg-primary/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {fileName ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">File attached. Click to replace.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, or image files up to 25MB</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" type="button">
              <FileUp className="h-4 w-4" />
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {fileName && !disabled && (
        <div className="flex justify-center">
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isAnalyzing ? "Analyzing with AI…" : "Analyze with AI"}
          </Button>
        </div>
      )}

      {aiAnalysis && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none text-sm text-foreground/90">
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground/60 text-center max-w-sm mx-auto">
        Uploaded files are locked upon approval. New uploads will generate a new version.
      </p>
    </div>
  );
}
