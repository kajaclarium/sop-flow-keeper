import { EzTextarea, EzCheckbox, EzButton } from "@clarium/ezui-react-components";
import { GripVertical, Trash2, Camera, Paperclip } from "lucide-react";
import { SOPStep } from "@/types/sop";

interface StepCardProps {
  step: SOPStep;
  index: number;
  onUpdate: (updates: Partial<SOPStep>) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

/** Renders an individual SOP procedure step with instruction text and evidence toggle options. */
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
          <EzTextarea
            placeholder="Describe this step…"
            value={step.instruction}
            onChange={(e) => onUpdate({ instruction: e.target.value })}
            rows={2}
            className="resize-none"
            disabled={disabled}
          />
          <div className="flex items-center gap-5">
            <span className="text-xs text-muted-foreground font-medium">Evidence:</span>
            <EzCheckbox
              label="Attach Photo"
              checked={step.requirePhoto}
              onCheckedChange={(checked) => onUpdate({ requirePhoto: !!checked })}
              disabled={disabled}
              size="small"
            />
            <EzCheckbox
              label="Any Evidence File"
              checked={step.requireEvidenceFile}
              onCheckedChange={(checked) => onUpdate({ requireEvidenceFile: !!checked })}
              disabled={disabled}
              size="small"
            />
          </div>
        </div>
        {!disabled && (
          <EzButton
            variant="text"
            severity="danger"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
            disabled={!canRemove}
            icon={<Trash2 className="h-4 w-4" />}
            aria-label="Remove step"
          />
        )}
      </div>
    </div>
  );
}
