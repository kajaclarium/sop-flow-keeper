import { useOrganization } from "@/contexts/OrganizationContext";
import { DepartmentCard } from "@/components/organization/DepartmentCard";
import { Department } from "@/types/organization";

interface OrgTreeProps {
  /** Callback fired when edit is requested for a department. */
  onEdit: (id: string) => void;
  /** Callback fired when delete is requested for a department. */
  onDelete: (id: string) => void;
}

/** Recursively renders a single branch of the tree: a department card and its children. */
function TreeBranch({
  department,
  onEdit,
  onDelete,
  getChildDepartments,
}: {
  department: Department;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getChildDepartments: (parentId: string) => Department[];
}) {
  const children = getChildDepartments(department.id);
  const hasChildren = children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Department card node */}
      <DepartmentCard
        department={department}
        hasChildren={hasChildren}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Children branch with connector lines */}
      {hasChildren && (
        <div className="flex flex-col items-center mt-1">
          {/* Vertical connector from parent to the junction */}
          <div className="w-px h-6 bg-border" />

          {/* Horizontal rail that spans across all children */}
          {children.length > 1 && (
            <div className="relative flex items-center">
              <div
                className="h-px bg-border"
                style={{
                  /* Width spans from center of first child to center of last child */
                  width: `${(children.length - 1) * 260}px`,
                }}
              />
            </div>
          )}

          {/* Children row */}
          <div className="flex items-start gap-10">
            {children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector from the junction down to the child */}
                <div className="w-px h-6 bg-border" />
                <TreeBranch
                  department={child}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getChildDepartments={getChildDepartments}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Full organizational tree visualization.
 * Renders a root "Global Organizational Structure" node at the top,
 * with department branches growing downward in a hierarchy.
 */
export function OrgTree({ onEdit, onDelete }: OrgTreeProps) {
  const { getRootDepartments, getChildDepartments } = useOrganization();
  const rootDepartments = getRootDepartments();

  if (rootDepartments.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full overflow-x-auto pb-8">
      {/* Vertical connector from the root card down to the junction */}
      <div className="w-px h-8 bg-border" />

      {/* Horizontal rail spanning all root departments */}
      {rootDepartments.length > 1 && (
        <div className="relative flex items-center">
          <div
            className="h-px bg-border"
            style={{
              width: `${(rootDepartments.length - 1) * 260}px`,
            }}
          />
        </div>
      )}

      {/* Root department branches */}
      <div className="flex items-start gap-10">
        {rootDepartments.map((dept) => (
          <div key={dept.id} className="flex flex-col items-center">
            <div className="w-px h-6 bg-border" />
            <TreeBranch
              department={dept}
              onEdit={onEdit}
              onDelete={onDelete}
              getChildDepartments={getChildDepartments}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
