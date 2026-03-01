import { useNavigate } from "react-router-dom";
import { EzButton } from "@clarium/ezui-react-components";
import { Building2, User, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Department } from "@/types/organization";
import { cn } from "@/lib/utils";

interface DepartmentCardProps {
  /** The department data to display. */
  department: Department;
  /** Whether this card has child departments below it in the tree. */
  hasChildren: boolean;
  /** Callback fired when the edit action is clicked. */
  onEdit: (id: string) => void;
  /** Callback fired when the delete action is clicked. */
  onDelete: (id: string) => void;
}

/** A single department node card used in the org tree, with hover actions and click-to-navigate. */
export function DepartmentCard({ department, hasChildren, onEdit, onDelete }: DepartmentCardProps) {
  const navigate = useNavigate();

  /** Navigate into the department's Process (Work Inventory) page on card click. */
  const handleClick = () => {
    navigate(`/department/${department.id}/work-inventory`);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card shadow-sm transition-all duration-200",
        "hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 cursor-pointer",
        "w-[220px] min-h-[100px]"
      )}
      onClick={handleClick}
    >
      {/* Card body */}
      <div className="p-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
            <Building2 className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">{department.name}</h3>
            {department.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {department.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer: head of department + actions */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{department.headOfDepartment}</span>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <EzButton
            variant="text"
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(department.id); }}
            icon={<Pencil className="h-3 w-3" />}
            aria-label={`Edit ${department.name}`}
          />
          <EzButton
            variant="text"
            severity="danger"
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(department.id); }}
            icon={<Trash2 className="h-3 w-3" />}
            aria-label={`Delete ${department.name}`}
          />
        </div>
      </div>

      {/* Visual indicator that children exist */}
      {hasChildren && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
          <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ChevronRight className="h-3 w-3 text-primary rotate-90" />
          </div>
        </div>
      )}
    </div>
  );
}
