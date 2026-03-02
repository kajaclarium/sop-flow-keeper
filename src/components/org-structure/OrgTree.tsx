import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import { DepartmentCard } from "@/components/organization/DepartmentCard";
import { cn } from "@/lib/utils";

interface OrgTreeProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/** 
 * Visualizes the department hierarchy as a tree.
 * Uses OrganizationContext to fetch root departments and recursively render children.
 */
export function OrgTree({ onEdit, onDelete }: OrgTreeProps) {
  const { getRootDepartments, getChildDepartments } = useOrganization();
  const rootDepartments = getRootDepartments();

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="w-px h-8 bg-border" />
      <div className="flex gap-8 items-start">
        {rootDepartments.map((dept) => (
          <DepartmentNode
            key={dept.id}
            department={dept}
            onEdit={onEdit}
            onDelete={onDelete}
            getChildDepartments={getChildDepartments}
          />
        ))}
      </div>
    </div>
  );
}

interface DepartmentNodeProps {
  department: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getChildDepartments: (parentId: string) => any[];
}

function DepartmentNode({ department, onEdit, onDelete, getChildDepartments }: DepartmentNodeProps) {
  const children = getChildDepartments(department.id);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center">
      <DepartmentCard
        department={department}
        hasChildren={children.length > 0}
        onEdit={() => onEdit(department.id)}
        onDelete={() => onDelete(department.id)}
        onClick={() => navigate(`/department/${department.id}/sop`)}
      />

      {children.length > 0 && (
        <>
          <div className="w-px h-8 bg-border" />
          <div className="flex gap-8 items-start relative">
            {/* Horizontal connector line for multiple children */}
            {children.length > 1 && (
              <div 
                className="absolute top-0 h-px bg-border -translate-y-px" 
                style={{ 
                  left: 'calc(50% / var(--child-count))',
                  right: 'calc(50% / var(--child-count))',
                  width: 'calc(100% - 280px)',
                  marginLeft: '140px'
                }} 
              />
            )}
            
            {children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-8 bg-border" />
                <DepartmentNode
                  department={child}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getChildDepartments={getChildDepartments}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
