import { useState, useCallback, useRef, useMemo } from "react";
import { Network, ChevronRight } from "lucide-react";
import type { Role, RaciKey, RoleModalState, RaciModalState } from "@/types/orgStructure";
import { DEPARTMENTS, DEPT_OPTIONS, ICON_OPTIONS } from "@/data/orgStructureData";
import { PageShell } from "@/components/shared/PageShell";
import { OrgStructureSidebar } from "@/components/org-structure/OrgStructureSidebar";
import { OrgStructureTopBar } from "@/components/org-structure/OrgStructureTopBar";
import { OrgStructureStatsBar } from "@/components/org-structure/OrgStructureStatsBar";
import { OrgTreePanel } from "@/components/org-structure/OrgTreePanel";
import { RoleRegistryTable } from "@/components/org-structure/RoleRegistryTable";
import { RoleDetailPanel } from "@/components/org-structure/RoleDetailPanel";
import { RoleFormModal } from "@/components/org-structure/RoleFormModal";
import { RaciFormModal } from "@/components/org-structure/RaciFormModal";
import { useOrganization } from "@/contexts/OrganizationContext";
import { OrgRole } from "@/types/organization";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Checks if `potentialAncestor` is a descendant of `childId` (to prevent circular drag). */
function isDescendant(roles: Role[], potentialAncestor: string, childId: string): boolean {
  let current = roles.find((r) => r.id === potentialAncestor);
  while (current && current.parent !== null) {
    if (current.parent === childId) return true;
    current = roles.find((r) => r.id === current!.parent);
  }
  return false;
}

/** Simple toast hook for transient notifications. */
function useToast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2400);
  }, []);
  return { msg, visible, show };
}

/** Org Structure & RACI page — manages hierarchical roles with drag-and-drop tree and role registry. */
export default function OrgStructure() {
  const { roles: orgRoles, departments, createRole, updateRole, deleteRole: deleteRoleFromContext } = useOrganization();
  
  // Map OrgRole to Legacy Role UI format for compatibility with sub-components
  const roles = useMemo(() => orgRoles.map(r => {
    const deptObj = departments.find(d => d.id === r.departmentId || d.name === r.departmentId);
    return {
      id: r.id,
      title: r.name,
      dept: deptObj ? deptObj.name : "Unassigned",
      icon: r.icon || "👤",
      parent: r.parentId,
      sops: r.sops || 0,
      notes: r.description,
      multi: false,
      raci: (r.raci || { R: "", A: "", C: "", I: "" }) as Record<RaciKey, string>
    };
  }), [orgRoles, departments]);

  // ── State ──
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const { msg: toastMsg, visible: toastVisible, show: showToast } = useToast();

  const [roleModal, setRoleModal] = useState<RoleModalState>({
    open: false, editId: null, title: "", dept: "", icon: ICON_OPTIONS[0], parent: "", sops: "", notes: "",
  });
  const [raciModal, setRaciModal] = useState<RaciModalState>({ open: false, roleId: null });

  // ── Derived ──
  const filtered = roles.filter((r) => {
    const deptOk = activeFilter === "All" || r.dept === activeFilter;
    const q = searchQ.toLowerCase();
    const searchOk = !q || r.title.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q);
    return deptOk && searchOk;
  });

  const totalRoles = roles.length;
  const multiHatCount = roles.filter((r) => r.multi).length;
  const deptCount = new Set(roles.map((r) => r.dept)).size;

  // ── Handlers ──
  const handleSelect = (id: string) => setSelectedId((prev) => (prev === id ? null : id));

  /** Sidebar selection — "all" means deselect. */
  const handleSidebarSelect = (id: string) => {
    if (id === "all") {
      setSelectedId(null);
    } else {
      setSelectedId((prev) => (prev === id ? null : id));
    }
  };

  const openAddModal = () =>
    setRoleModal({ open: true, editId: null, title: "", dept: "", icon: ICON_OPTIONS[0], parent: "", sops: "0", notes: "" });

  const openEditModal = (id: string) => {
    const r = roles.find((x) => x.id === id);
    if (!r) return;
    setRoleModal({
      open: true, editId: id, title: r.title, dept: r.dept, icon: r.icon,
      parent: r.parent || "", sops: String(r.sops), notes: r.notes,
    });
  };

  const saveRole = () => {
    const { title, dept, icon, parent, sops, notes, editId } = roleModal;
    if (!title.trim() || !dept) { showToast("Title and Department are required"); return; }
    
    if (editId !== null) {
      updateRole(editId, {
        name: title.trim(),
        departmentId: dept,
        icon,
        parentId: parent || null,
        sops: parseInt(sops) || 0,
        description: notes.trim()
      });
      showToast("Role updated");
    } else {
      createRole({
        name: title.trim(),
        departmentId: dept,
        icon,
        tierId: "operational", // Default tier for new roles via this UI
        parentId: parent || null,
        sops: parseInt(sops) || 0,
        description: notes.trim(),
        raciType: "responsible",
        raci: { R: "", A: "", C: "", I: "" }
      });
      showToast("Role added");
    }
    setRoleModal((s) => ({ ...s, open: false }));
  };

  const deleteRole = (id: string) => {
    const r = roles.find((x) => x.id === id);
    if (!r) return;
    const children = roles.filter((x) => x.parent === id);
    if (children.length) { showToast(`Cannot delete — ${r.title} has ${children.length} direct report(s)`); return; }
    if (!confirm(`Delete "${r.title}"?`)) return;
    deleteRoleFromContext(id);
    if (selectedId === id) setSelectedId(null);
    showToast(`"${r.title}" deleted`);
  };

  const saveRaciChange = (roleId: string, key: RaciKey, val: string) => {
    const r = orgRoles.find(x => x.id === roleId);
    if (!r) return;
    updateRole(roleId, {
      raci: { ...(r.raci || { R: "", A: "", C: "", I: "" }), [key]: val === "— None —" ? "" : val }
    });
    showToast(`RACI ${key} updated`);
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    if (isDescendant(roles, targetId, dragId)) return;
    const dragged = roles.find((r) => r.id === dragId);
    const target = roles.find((r) => r.id === targetId);
    if (!dragged || !target) return;
    updateRole(dragId, { parentId: targetId });
    showToast(`"${dragged.title}" moved under "${target.title}"`);
    setDragId(null);
    setDragOverId(null);
  };

  const exportCSV = () => {
    const header = `Role,Department,Reports To,SOPs,Notes,RACI-R,RACI-A,RACI-C,RACI-I\n`;
    const rows = roles.map((r) => {
      const parentTitle = r.parent ? roles.find((x) => x.id === r.parent)?.title ?? "Top Level" : "Top Level";
      return `"${r.title}","${r.dept}","${parentTitle}","${r.sops}","${r.notes}","${r.raci.R}","${r.raci.A}","${r.raci.C}","${r.raci.I}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "DWM_Org_Structure.csv";
    a.click();
    showToast("Exported as CSV");
  };

  // ── Render ──
  return (
    <PageShell
      icon={<Network className="h-4 w-4 text-primary-foreground" />}
      title="Org Structure"
      subtitle="Daily Work Management"
      breadcrumbs={
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-xs font-semibold text-foreground">Org Structure & RACI</span>
        </>
      }
      sidebar={
        <OrgStructureSidebar
          roles={roles}
          selectedId={selectedId}
          onSelect={handleSidebarSelect}
        />
      }
    >
      {/* Top bar: search + filters + actions */}
      <OrgStructureTopBar
        searchQuery={searchQ}
        onSearchChange={setSearchQ}
        departments={DEPARTMENTS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onExport={exportCSV}
        onAddRole={openAddModal}
      />

      {/* Stats bar */}
      <OrgStructureStatsBar totalRoles={totalRoles} multiHatCount={multiHatCount} departmentCount={deptCount} />

      {/* Main content: Tree + Table */}
      <div className="flex flex-1 overflow-hidden">
        <OrgTreePanel
          roles={roles}
          selectedId={selectedId}
          dragId={dragId}
          dragOverId={dragOverId}
          onSelect={handleSelect}
          onEdit={openEditModal}
          onDelete={deleteRole}
          onDragStart={(id) => setDragId(id)}
          onDragEnd={() => { setDragId(null); setDragOverId(null); }}
          onDragOver={(id) => { if (dragId !== id && !isDescendant(roles, id, dragId ?? "")) setDragOverId(id); }}
          onDragLeave={(id) => { if (dragOverId === id) setDragOverId(null); }}
          onDrop={handleDrop}
        />
        <RoleRegistryTable
          filteredRoles={filtered}
          allRoles={roles}
          selectedId={selectedId}
          onSelect={handleSelect}
          onEdit={openEditModal}
          onDelete={deleteRole}
          onOpenRaci={(id) => setRaciModal({ open: true, roleId: id })}
        />
      </div>

      {/* Detail Panel (slide-in) */}
      {selectedId !== null && (
        <RoleDetailPanel
          roleId={selectedId}
          roles={roles}
          onClose={() => setSelectedId(null)}
          onEdit={openEditModal}
          onDelete={deleteRole}
          onOpenRaci={(id) => setRaciModal({ open: true, roleId: id })}
        />
      )}

      {/* Role Modal */}
      <RoleFormModal
        state={roleModal}
        roles={roles}
        deptOptions={DEPT_OPTIONS}
        iconOptions={ICON_OPTIONS}
        onChange={(patch) => setRoleModal((s) => ({ ...s, ...patch }))}
        onSave={saveRole}
        onClose={() => setRoleModal((s) => ({ ...s, open: false }))}
      />

      {/* RACI Modal */}
      <RaciFormModal
        state={raciModal}
        roles={roles}
        onClose={() => setRaciModal({ open: false, roleId: null })}
        onSave={saveRaciChange}
      />

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-xs z-[2000] transition-opacity duration-300 pointer-events-none ${toastVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        {toastMsg}
      </div>
    </PageShell>
  );
}
