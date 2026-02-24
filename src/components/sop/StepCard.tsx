import { GripVertical, Trash2, Camera, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SOPStep } from "@/types/sop";

interface StepCardProps {
  step: SOPStep;
  index: number;
  onUpdate: (updates: Partial<SOPStep>) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

export function StepCard({ step, index, onUpdate, onRemove, canRemove, disabled }: StepCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 group transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 pt-2 shrink-0">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {index + 1}
          </span>
        </div>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="Describe this step…"
            value={step.instruction}
            onChange={(e) => onUpdate({ instruction: e.target.value })}
            rows={2}
            className="resize-none"
            disabled={disabled}
          />
          <div className="flex items-center gap-5">
            <span className="text-xs text-muted-foreground font-medium">Evidence:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={step.requirePhoto}
                onCheckedChange={(checked) => onUpdate({ requirePhoto: !!checked })}
                disabled={disabled}
              />
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Attach Photo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={step.requireEvidenceFile}
                onCheckedChange={(checked) => onUpdate({ requireEvidenceFile: !!checked })}
                disabled={disabled}
              />
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Any Evidence File</span>
            </label>
          </div>
        </div>
        {!disabled && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
            disabled={!canRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
