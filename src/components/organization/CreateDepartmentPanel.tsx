import { useState, useEffect } from "react";
import { EzButton, EzInput, EzSelect } from "@clarium/ezui-react-components";
import { X, Building2, Save } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { cn } from "@/lib/utils";

interface CreateDepartmentPanelProps {
  /** Whether the slide-over panel is visible. */
  isOpen: boolean;
  /** Callback to close the panel. */
  onClose: () => void;
  /** Optional department ID when editing instead of creating. */
  editingId?: string | null;
}

/** Right-side slide-over panel for creating or editing a department. */
export function CreateDepartmentPanel({ isOpen, onClose, editingId }: CreateDepartmentPanelProps) {
  const { createDepartment, updateDepartment, getDepartmentById, departments, getRoleOptions } = useOrganization();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headOfDepartment, setHeadOfDepartment] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);

  /** Populate form when editing an existing department. */
  useEffect(() => {
    if (editingId) {
      const dept = getDepartmentById(editingId);
      if (dept) {
        setName(dept.name);
        setDescription(dept.description);
        setHeadOfDepartment(dept.headOfDepartment);
        setParentId(dept.parentId);
      }
    } else {
      resetForm();
    }
  }, [editingId, getDepartmentById]);

  /** Clears all form fields to their default state. */
  const resetForm = () => {
    setName("");
    setDescription("");
    setHeadOfDepartment("");
    setParentId(null);
  };

  /** Saves the department (create or update) and closes the panel. */
  const handleSave = () => {
    if (!name.trim() || !headOfDepartment) return;

    if (editingId) {
      updateDepartment(editingId, {
        name: name.trim(),
        description: description.trim(),
        headOfDepartment,
        parentId,
      });
    } else {
      createDepartment({
        name: name.trim(),
        description: description.trim(),
        headOfDepartment,
        parentId,
      });
    }
    resetForm();
    onClose();
  };

  /** Handles closing by resetting form and invoking the close callback. */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /** Build parent department options, excluding the currently editing department and its descendants. */
  const getParentOptions = () => {
    const excludeIds = new Set<string>();
    if (editingId) {
      /* Recursively collect all descendant IDs to prevent circular references */
      excludeIds.add(editingId);
      const collectDescendants = (id: string) => {
        departments.forEach((d) => {
          if (d.parentId === id && !excludeIds.has(d.id)) {
            excludeIds.add(d.id);
            collectDescendants(d.id);
          }
        });
      };
      collectDescendants(editingId);
    }

    return departments
      .filter((d) => !excludeIds.has(d.id))
      .map((d) => ({ label: d.name, value: d.id }));
  };

  /** Role options from org structure — grouped by tier label. */
  const roleOptions = getRoleOptions();
  const parentOptions = getParentOptions();
  const isEditing = Boolean(editingId);

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-over panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[440px] bg-card border-l shadow-2xl z-50",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 h-16 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{isEditing ? "Edit Department" : "Create Department"}</h2>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {isEditing ? "Update department details" : "Add a new department to your organization"}
              </p>
            </div>
          </div>
          <EzButton
            variant="text"
            size="small"
            onClick={handleClose}
            icon={<X className="h-4 w-4" />}
            aria-label="Close panel"
          />
        </div>

        {/* Panel body */}
        <div className="p-6 space-y-5 overflow-y-auto" style={{ height: "calc(100% - 64px - 72px)" }}>
          <EzInput
            label="Department Name"
            placeholder="e.g. Maintenance Department"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <EzInput
            label="Description"
            placeholder="Brief description of department responsibilities"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <EzSelect
            label="Head of Department (Role)"
            placeholder="Select a role from the catalog"
            options={roleOptions}
            value={headOfDepartment || undefined}
            onValueChange={(val) => setHeadOfDepartment(val as string)}
            clearable
            searchable
          />

          <EzSelect
            label="Parent Department (Optional)"
            placeholder="None — top-level department"
            options={parentOptions}
            value={parentId || undefined}
            onValueChange={(val) => setParentId((val as string) || null)}
            clearable
          />

          {/* Visual hint about hierarchy */}
          <div className="rounded-lg bg-muted/50 border p-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {parentId
                ? `This department will appear as a child of "${departments.find((d) => d.id === parentId)?.name}" in the organizational tree.`
                : "This department will appear at the root level, directly under the Global Organizational Structure."}
            </p>
          </div>

          {/* Role not found hint */}
          <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 p-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-violet-600">Role not listed?</strong> Go to the{" "}
              <strong>Org Structure</strong> screen from the landing page to create new roles in the RACI catalog.
            </p>
          </div>
        </div>

        {/* Panel footer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 px-6 h-[72px] border-t bg-card">
          <EzButton variant="outlined" onClick={handleClose}>Cancel</EzButton>
          <EzButton
            onClick={handleSave}
            disabled={!name.trim() || !headOfDepartment}
            icon={<Save className="h-4 w-4" />}
          >
            {isEditing ? "Update" : "Create Department"}
          </EzButton>
        </div>
      </div>
    </>
  );
}
