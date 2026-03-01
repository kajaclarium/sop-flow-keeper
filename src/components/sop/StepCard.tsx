import { EzTextarea, EzCheckbox, EzButton, EzInput, EzSelect } from "@clarium/ezui-react-components";
import { GripVertical, Trash2, Camera, Paperclip, ArrowDownToLine, ArrowUpFromLine, Plus, X, Pencil, Save } from "lucide-react";
import { SOPStep } from "@/types/sop";
import { TaskIO, IOType, IO_TYPE_OPTIONS } from "@/types/common";
import { useState } from "react";
import { cn } from "@/lib/utils";

const IO_TYPE_STYLES: Record<string, string> = {
  document: "bg-blue-50 text-blue-700 border-blue-200",
  material: "bg-amber-50 text-amber-700 border-amber-200",
  data: "bg-violet-50 text-violet-700 border-violet-200",
  approval: "bg-green-50 text-green-700 border-green-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

interface StepCardProps {
  step: SOPStep;
  index: number;
  onUpdate: (updates: Partial<SOPStep>) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

/** Renders an individual SOP procedure step with instruction text, evidence options, and I/O management. */
export function StepCard({ step, index, onUpdate, onRemove, canRemove, disabled }: StepCardProps) {
  const [addingIO, setAddingIO] = useState<"input" | "output" | null>(null);
  const [editingIO, setEditingIO] = useState<{ id: string; direction: "input" | "output" } | null>(null);

  const [ioLabel, setIoLabel] = useState("");
  const [ioType, setIoType] = useState<IOType>("data");
  const [ioDesc, setIoDesc] = useState("");

  const startAddIO = (direction: "input" | "output") => {
    setAddingIO(direction);
    setIoLabel("");
    setIoType("data");
    setIoDesc("");
  };

  const startEditIO = (io: TaskIO, direction: "input" | "output") => {
    setEditingIO({ id: io.id, direction });
    setIoLabel(io.label);
    setIoType(io.type);
    setIoDesc(io.description);
  };

  const saveIO = () => {
    if (!ioLabel.trim()) return;

    if (addingIO) {
      const newIO: TaskIO = { id: crypto.randomUUID(), label: ioLabel.trim(), type: ioType, description: ioDesc.trim() };
      const field = addingIO === "input" ? "inputs" : "outputs";
      onUpdate({ [field]: [...step[field], newIO] });
      setAddingIO(null);
    } else if (editingIO) {
      const field = editingIO.direction === "input" ? "inputs" : "outputs";
      const items = step[field].map((io) =>
        io.id === editingIO.id ? { ...io, label: ioLabel.trim(), type: ioType, description: ioDesc.trim() } : io
      );
      onUpdate({ [field]: items });
      setEditingIO(null);
    }
  };

  const removeIO = (id: string, direction: "input" | "output") => {
    const field = direction === "input" ? "inputs" : "outputs";
    onUpdate({ [field]: step[field].filter(io => io.id !== id) });
  };

  const renderIOSection = (direction: "input" | "output") => {
    const isInput = direction === "input";
    const items = isInput ? step.inputs : step.outputs;
    const Icon = isInput ? ArrowDownToLine : ArrowUpFromLine;
    const colorClass = isInput ? "text-blue-500" : "text-emerald-500";

    return (
      <div className="space-y-2 mt-4 pt-4 border-t border-dashed">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icon className={cn("h-3 w-3", colorClass)} />
            {isInput ? "Inputs" : "Outputs"} ({items.length})
          </h4>
          {!disabled && (
            <EzButton variant="text" size="small" className="h-6 text-[10px]" onClick={() => startAddIO(direction)} icon={<Plus className="h-3 w-3" />}>
              Add
            </EzButton>
          )}
        </div>

        {addingIO === direction && (
          <div className="rounded-lg border bg-muted/30 p-2 space-y-2">
            <EzInput placeholder="Label" value={ioLabel} onChange={(e) => setIoLabel(e.target.value)} className="h-7 text-xs" />
            <div className="flex gap-1.5">
              <EzSelect options={IO_TYPE_OPTIONS} value={ioType} onValueChange={(v) => setIoType(v as IOType)} className="h-7 text-xs w-24" />
              <EzInput placeholder="Description" value={ioDesc} onChange={(e) => setIoDesc(e.target.value)} className="h-7 text-xs flex-1" />
            </div>
            <div className="flex justify-end gap-1">
              <EzButton variant="text" size="small" className="h-6 text-[10px]" onClick={() => setAddingIO(null)} icon={<X className="h-2.5 w-2.5" />}>Cancel</EzButton>
              <EzButton size="small" className="h-6 text-[10px]" onClick={saveIO} icon={<Save className="h-2.5 w-2.5" />}>Save</EzButton>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((io) => (
            <div key={io.id} className="group/io relative rounded-md border bg-muted/10 p-2 space-y-0.5 hover:border-primary/20 transition-colors">
              {editingIO?.id === io.id && editingIO.direction === direction ? (
                <div className="space-y-2">
                  <EzInput value={ioLabel} onChange={(e) => setIoLabel(e.target.value)} className="h-7 text-xs" />
                  <div className="flex gap-1.5">
                    <EzSelect options={IO_TYPE_OPTIONS} value={ioType} onValueChange={(v) => setIoType(v as IOType)} className="h-7 text-xs w-24" />
                    <EzInput value={ioDesc} onChange={(e) => setIoDesc(e.target.value)} className="h-7 text-xs flex-1" />
                  </div>
                  <div className="flex justify-end gap-1">
                    <EzButton variant="text" size="small" className="h-6 text-[10px]" onClick={() => setEditingIO(null)} icon={<X className="h-2.5 w-2.5" />}>Cancel</EzButton>
                    <EzButton size="small" className="h-6 text-[10px]" onClick={saveIO} icon={<Save className="h-2.5 w-2.5" />}>Scale</EzButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate pr-8">{io.label}</span>
                    <span className={cn("text-[8px] px-1 rounded-[4px] border font-bold uppercase", IO_TYPE_STYLES[io.type])}>
                      {io.type}
                    </span>
                  </div>
                  {io.description && <p className="text-[10px] text-muted-foreground line-clamp-1">{io.description}</p>}
                  {!disabled && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover/io:opacity-100 transition-opacity flex gap-0.5">
                      <EzButton variant="text" size="small" className="h-5 w-5 p-0" onClick={() => startEditIO(io, direction)} icon={<Pencil className="h-2.5 w-2.5" />} />
                      <EzButton variant="text" severity="danger" size="small" className="h-5 w-5 p-0" onClick={() => removeIO(io.id, direction)} icon={<Trash2 className="h-2.5 w-2.5" />} />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 group transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 pt-2 shrink-0">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <EzTextarea
              placeholder="Describe this step…"
              value={step.instruction}
              onChange={(e) => onUpdate({ instruction: e.target.value })}
              rows={2}
              className="resize-none flex-1"
              disabled={disabled}
            />
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
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Requirements:</span>
            <EzCheckbox
              label="Photo"
              checked={step.requirePhoto}
              onCheckedChange={(checked) => onUpdate({ requirePhoto: !!checked })}
              disabled={disabled}
              className="text-xs"
            />
            <EzCheckbox
              label="Evidence File"
              checked={step.requireEvidenceFile}
              onCheckedChange={(checked) => onUpdate({ requireEvidenceFile: !!checked })}
              disabled={disabled}
              className="text-xs"
            />
            <EzCheckbox
              label="Measurement"
              checked={step.requireMeasurement}
              onCheckedChange={(checked) => onUpdate({ requireMeasurement: !!checked })}
              disabled={disabled}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderIOSection("input")}
            {renderIOSection("output")}
          </div>
        </div>
      </div>
    </div>
  );
}
