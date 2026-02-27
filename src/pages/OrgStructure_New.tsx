import { useState, useCallback, useRef } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface RaciMap {
  R: string;
  A: string;
  C: string;
  I: string;
}

interface Role {
  id: number;
  title: string;
  dept: string;
  icon: string;
  parent: number | null;
  sops: number;
  notes: string;
  multi: boolean;
  raci: RaciMap;
}

type RaciKey = keyof RaciMap;

interface RoleModalState {
  open: boolean;
  editId: number | null;
  title: string;
  dept: string;
  icon: string;
  parent: string;
  sops: string;
  notes: string;
}

interface RaciModalState {
  open: boolean;
  roleId: number | null;
}

type Theme = "dwm" | "it";

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────

const DWM_ROLES: Role[] = [
  { id: 1, title: "Plant Manager", dept: "Operations", icon: "🏭", parent: null, sops: 0, notes: "Full plant authority", multi: false, raci: { R: "Plant Manager", A: "Plant Manager", C: "Production Manager", I: "Safety Officer" } },
  { id: 2, title: "Production Manager", dept: "Manufacturing", icon: "🧪", parent: 1, sops: 5, notes: "Manages all production lines", multi: false, raci: { R: "Production Manager", A: "Plant Manager", C: "QA Manager", I: "Regulatory Affairs Lead" } },
  { id: 3, title: "QA Manager", dept: "Quality", icon: "🔬", parent: 1, sops: 18, notes: "QMS ownership, SOP approvals", multi: false, raci: { R: "QA Manager", A: "Plant Manager", C: "Regulatory Affairs Lead", I: "Production Manager" } },
  { id: 4, title: "Regulatory Affairs Lead", dept: "Regulatory", icon: "🛡️", parent: 1, sops: 8, notes: "Dossier & submission authority", multi: false, raci: { R: "Regulatory Affairs Lead", A: "Plant Manager", C: "QA Manager", I: "Production Manager" } },
  { id: 5, title: "Sterile Mfg Supervisor", dept: "Manufacturing", icon: "🧪", parent: 2, sops: 12, notes: "Cleanroom operations", multi: false, raci: { R: "Sterile Mfg Supervisor", A: "Production Manager", C: "QA Officer", I: "QA Manager" } },
  { id: 6, title: "QA Officer", dept: "Quality", icon: "🔬", parent: 3, sops: 9, notes: "IPQC, deviation management", multi: false, raci: { R: "QA Officer", A: "QA Manager", C: "Validation Engineer", I: "Production Manager" } },
  { id: 7, title: "Manufacturing Operator", dept: "Manufacturing", icon: "📋", parent: 5, sops: 0, notes: "Executes batch operations", multi: false, raci: { R: "Manufacturing Operator", A: "Sterile Mfg Supervisor", C: "QA Officer", I: "Production Manager" } },
  { id: 8, title: "Validation Engineer", dept: "Engineering", icon: "⚙️", parent: 3, sops: 6, notes: "Process & cleaning validation", multi: true, raci: { R: "Validation Engineer", A: "QA Manager", C: "QA Officer", I: "Regulatory Affairs Lead" } },
  { id: 9, title: "Safety Officer", dept: "HSE", icon: "🛡️", parent: 1, sops: 4, notes: "GMP & HSE compliance", multi: false, raci: { R: "Safety Officer", A: "Plant Manager", C: "Production Manager", I: "QA Manager" } },
  { id: 10, title: "QC Analyst", dept: "Quality", icon: "🔬", parent: 6, sops: 7, notes: "Lab testing & release", multi: false, raci: { R: "QC Analyst", A: "QA Officer", C: "QA Manager", I: "Regulatory Affairs Lead" } },
];

const IT_ROLES: Role[] = [
  { id: 1, title: "Chief Technology Officer", dept: "Engineering", icon: "💼", parent: null, sops: 0, notes: "Technology vision & strategy", multi: false, raci: { R: "Chief Technology Officer", A: "Chief Technology Officer", C: "VP of Engineering", I: "Chief Product Officer" } },
  { id: 2, title: "VP of Engineering", dept: "Engineering", icon: "🏗️", parent: 1, sops: 3, notes: "Manages all engineering squads", multi: false, raci: { R: "VP of Engineering", A: "Chief Technology Officer", C: "Head of Data", I: "Chief Product Officer" } },
  { id: 3, title: "Chief Product Officer", dept: "Product", icon: "🗂️", parent: 1, sops: 2, notes: "Product strategy & roadmap", multi: false, raci: { R: "Chief Product Officer", A: "Chief Technology Officer", C: "VP of Engineering", I: "Head of Data" } },
  { id: 4, title: "Head of Security", dept: "Security", icon: "🔒", parent: 1, sops: 8, notes: "InfoSec, compliance & risk", multi: false, raci: { R: "Head of Security", A: "Chief Technology Officer", C: "Head of DevOps", I: "VP of Engineering" } },
  { id: 5, title: "EM — Backend", dept: "Engineering", icon: "💻", parent: 2, sops: 5, notes: "Microservices, APIs, databases", multi: false, raci: { R: "EM — Backend", A: "VP of Engineering", C: "EM — Frontend", I: "Chief Technology Officer" } },
  { id: 6, title: "EM — Frontend", dept: "Engineering", icon: "💻", parent: 2, sops: 4, notes: "Web & UI platform teams", multi: false, raci: { R: "EM — Frontend", A: "VP of Engineering", C: "EM — Backend", I: "Chief Product Officer" } },
  { id: 7, title: "Head of DevOps", dept: "DevOps", icon: "☁️", parent: 2, sops: 7, notes: "CI/CD, cloud infra, SRE", multi: false, raci: { R: "Head of DevOps", A: "VP of Engineering", C: "Head of Security", I: "Chief Technology Officer" } },
  { id: 8, title: "Head of Data", dept: "Data", icon: "📊", parent: 1, sops: 6, notes: "Data platform, analytics, ML", multi: false, raci: { R: "Head of Data", A: "Chief Technology Officer", C: "Chief Product Officer", I: "VP of Engineering" } },
  { id: 9, title: "Product Manager", dept: "Product", icon: "🗂️", parent: 3, sops: 3, notes: "Feature delivery & backlog", multi: false, raci: { R: "Product Manager", A: "Chief Product Officer", C: "EM — Backend", I: "VP of Engineering" } },
  { id: 10, title: "Senior Backend Engineer", dept: "Engineering", icon: "💻", parent: 5, sops: 2, notes: "Node.js, PostgreSQL, Redis", multi: false, raci: { R: "Senior Backend Engineer", A: "EM — Backend", C: "Senior Frontend Engineer", I: "Head of Data" } },
  { id: 11, title: "Senior Frontend Engineer", dept: "Engineering", icon: "💻", parent: 6, sops: 2, notes: "React, TypeScript, design systems", multi: false, raci: { R: "Senior Frontend Engineer", A: "EM — Frontend", C: "Product Manager", I: "EM — Backend" } },
  { id: 12, title: "ML Engineer", dept: "Data", icon: "🤖", parent: 8, sops: 4, notes: "Model training, MLOps pipeline", multi: true, raci: { R: "ML Engineer", A: "Head of Data", C: "Senior Backend Engineer", I: "Chief Product Officer" } },
  { id: 13, title: "QA Lead", dept: "QA", icon: "🧪", parent: 2, sops: 5, notes: "Test strategy & automation", multi: false, raci: { R: "QA Lead", A: "VP of Engineering", C: "EM — Backend", I: "Chief Technology Officer" } },
  { id: 14, title: "DevOps Engineer", dept: "DevOps", icon: "☁️", parent: 7, sops: 3, notes: "Kubernetes, Terraform, AWS", multi: false, raci: { R: "DevOps Engineer", A: "Head of DevOps", C: "Head of Security", I: "VP of Engineering" } },
  { id: 15, title: "Security Engineer", dept: "Security", icon: "🔒", parent: 4, sops: 6, notes: "Pen testing, SIEM, vulnerability mgmt", multi: false, raci: { R: "Security Engineer", A: "Head of Security", C: "Head of DevOps", I: "Chief Technology Officer" } },
];

const DWM_DEPTS = ["All", "Operations", "Quality", "Manufacturing", "Regulatory"];
const IT_DEPTS  = ["All", "Engineering", "Product", "Security", "DevOps", "Data", "QA"];
const DWM_DEPT_OPTIONS = ["Operations", "Quality", "Manufacturing", "Regulatory", "Engineering", "HSE"];
const IT_DEPT_OPTIONS  = ["Engineering", "Product", "Security", "DevOps", "Data", "QA"];
const DWM_ICONS = ["🏭", "🔬", "⚙️", "📋", "🛡️", "🧪", "👤", "🏗️"];
const IT_ICONS  = ["💼", "🏗️", "🗂️", "🔒", "💻", "☁️", "📊", "🤖", "🧪", "🛠️"];

const RACI_DEFS: { key: RaciKey; label: string; meaning: string; bg: string; border: string; titleColor: string; valColor: string }[] = [
  { key: "R", label: "R — Responsible", meaning: "Executes the work — does the task", bg: "#d1fae5", border: "#a7f3d0", titleColor: "#065f46", valColor: "#064e3b" },
  { key: "A", label: "A — Accountable", meaning: "Owns the outcome — answers for results", bg: "#fef3c7", border: "#fde68a", titleColor: "#92400e", valColor: "#78350f" },
  { key: "C", label: "C — Consulted",   meaning: "Provides input — two-way communication", bg: "#dbeafe", border: "#bfdbfe", titleColor: "#1e40af", valColor: "#1e3a8a" },
  { key: "I", label: "I — Informed",    meaning: "Kept in the loop — one-way, post-decision", bg: "#f1f5f9", border: "#e2e8f0", titleColor: "#475569", valColor: "#334155" },
];

const RACI_BADGE: Record<RaciKey, { bg: string; color: string }> = {
  R: { bg: "#d1fae5", color: "#065f46" },
  A: { bg: "#fef3c7", color: "#92400e" },
  C: { bg: "#dbeafe", color: "#1e40af" },
  I: { bg: "#f1f5f9", color: "#475569" },
};

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────

const THEME = {
  dwm: {
    topbarBg: "#ffffff",
    topbarBorder: "#e2e8f0",
    topbarText: "#0f172a",
    searchBg: "#f8fafc",
    searchBorder: "#e2e8f0",
    searchInputColor: "#0f172a",
    chipBorder: "#e2e8f0",
    chipBg: "#ffffff",
    chipColor: "#64748b",
    accentBg: "#4f46e5",
    accentHover: "#4338ca",
    statsBg: "#ffffff",
    statsBorder: "#e2e8f0",
    statLabel: "#64748b",
    statVal: "#0f172a",
    bg: "#f1f5f9",
    surface: "#ffffff",
    surface2: "#f8fafc",
    border: "#e2e8f0",
    text: "#0f172a",
    muted: "#64748b",
    muted2: "#94a3b8",
    accent: "#4f46e5",
    accentLight: "#eef2ff",
    red: "#ef4444",
    name: "DWM Pharma",
    sopLabel: "SOPs",
  },
  it: {
    topbarBg: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",
    topbarBorder: "#1e3a5f",
    topbarText: "#ffffff",
    searchBg: "rgba(255,255,255,0.08)",
    searchBorder: "rgba(255,255,255,0.12)",
    searchInputColor: "#ffffff",
    chipBorder: "rgba(255,255,255,0.15)",
    chipBg: "rgba(255,255,255,0.06)",
    chipColor: "rgba(255,255,255,0.55)",
    accentBg: "#0070f3",
    accentHover: "#0058c7",
    statsBg: "#0f172a",
    statsBorder: "#1e3a5f",
    statLabel: "rgba(255,255,255,0.4)",
    statVal: "#ffffff",
    bg: "#f0f4ff",
    surface: "#ffffff",
    surface2: "#f5f7ff",
    border: "#dde3f5",
    text: "#0f172a",
    muted: "#5a6a8a",
    muted2: "#8fa0c0",
    accent: "#0070f3",
    accentLight: "#e6f0ff",
    red: "#ff4757",
    name: "IT Engineering",
    sopLabel: "Repos",
  },
} as const;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function isDescendant(roles: Role[], potentialAncestor: number, childId: number): boolean {
  let current = roles.find(r => r.id === potentialAncestor);
  while (current && current.parent !== null) {
    if (current.parent === childId) return true;
    current = roles.find(r => r.id === current!.parent);
  }
  return false;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

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

// ─── ORG NODE (recursive) ─────────────────────────────────────────────────────

interface OrgNodeProps {
  role: Role;
  roles: Role[];
  selectedId: number | null;
  dragId: number | null;
  dragOverId: number | null;
  onSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
  onDragOver: (id: number) => void;
  onDragLeave: (id: number) => void;
  onDrop: (targetId: number) => void;
  t: typeof THEME.dwm;
}

function OrgNode({ role, roles, selectedId, dragId, dragOverId, onSelect, onEdit, onDelete, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, t }: OrgNodeProps) {
  const children = roles.filter(r => r.parent === role.id);
  const isSelected = selectedId === role.id;
  const isDragOver = dragOverId === role.id;
  const [hovered, setHovered] = useState(false);

  const nodeBorder = isDragOver ? "#10b981" : isSelected ? t.accent : hovered ? t.accent : t.border;
  const nodeBg = isDragOver ? "#f0fdf4" : isSelected ? t.accentLight : t.surface;
  const nodeBorderStyle = isDragOver ? "dashed" : "solid";
  const boxShadow = hovered && !isDragOver
    ? `0 0 0 3px ${t.accent}20, 0 1px 4px rgba(0,0,0,0.07)`
    : "0 1px 4px rgba(0,0,0,0.07)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        draggable
        onClick={() => onSelect(role.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragStart={e => { e.stopPropagation(); onDragStart(role.id); }}
        onDragEnd={onDragEnd}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); onDragOver(role.id); }}
        onDragLeave={() => onDragLeave(role.id)}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); onDrop(role.id); }}
        style={{
          background: nodeBg,
          border: `2px ${nodeBorderStyle} ${nodeBorder}`,
          borderRadius: 10,
          padding: "0.75rem 1rem",
          minWidth: 140,
          maxWidth: 160,
          textAlign: "center",
          cursor: "pointer",
          position: "relative",
          boxShadow,
          userSelect: "none",
          transition: "all 0.18s",
          opacity: dragId === role.id ? 0.4 : 1,
        }}
      >
        {hovered && (
          <div style={{ position: "absolute", top: -10, right: -10, display: "flex", gap: 3, zIndex: 10 }}>
            <button
              onClick={e => { e.stopPropagation(); onEdit(role.id); }}
              style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
            >✏</button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(role.id); }}
              style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: t.red, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
            >🗑</button>
          </div>
        )}
        <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>{role.icon}</div>
        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: t.text, lineHeight: 1.3 }}>{role.title}</div>
        <div style={{ fontSize: "0.58rem", color: t.muted2, marginTop: "0.1rem" }}>{role.dept}</div>
        {role.multi && (
          <div style={{ marginTop: "0.4rem", display: "flex", justifyContent: "center" }}>
            <span style={{ fontSize: "0.52rem", padding: "0.1rem 0.4rem", borderRadius: 3, fontWeight: 600, textTransform: "uppercase", background: "#ede9fe", color: "#5b21b6" }}>Multi-Hat</span>
          </div>
        )}
      </div>

      {children.length > 0 && (
        <>
          <div style={{ width: 2, height: 20, background: t.border }} />
          <div style={{ display: "flex", gap: "1.2rem", position: "relative" }}>
            {children.length > 1 && (
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", height: 2, background: t.border, width: `calc(100% - 160px)` }} />
            )}
            {children.map(child => (
              <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 2, height: 20, background: t.border }} />
                <OrgNode
                  role={child} roles={roles} selectedId={selectedId} dragId={dragId} dragOverId={dragOverId}
                  onSelect={onSelect} onEdit={onEdit} onDelete={onDelete}
                  onDragStart={onDragStart} onDragEnd={onDragEnd}
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                  t={t}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── RACI MODAL ───────────────────────────────────────────────────────────────

interface RaciModalProps {
  state: RaciModalState;
  roles: Role[];
  onClose: () => void;
  onSave: (roleId: number, key: RaciKey, val: string) => void;
  t: typeof THEME.dwm;
}

function RaciModal({ state, roles, onClose, onSave, t }: RaciModalProps) {
  if (!state.open || state.roleId === null) return null;
  const role = roles.find(r => r.id === state.roleId);
  if (!role) return null;
  const opts = ["— None —", ...roles.map(r => r.title)];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.surface, borderRadius: 14, width: 580, maxWidth: "95vw", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden", animation: "modalIn 0.2s ease" }}>
        <div style={{ padding: "1.1rem 1.3rem", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700, color: t.text }}>{role.icon} {role.title} — RACI</div>
            <div style={{ fontSize: "0.62rem", color: t.muted, marginTop: 2 }}>Assign a role to each RACI position · changes save instantly</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.surface2, cursor: "pointer", fontSize: "0.8rem", color: t.muted }}>✕</button>
        </div>
        <div style={{ padding: "0.7rem 1.2rem", background: t.surface2, borderBottom: `1px solid ${t.border}`, fontSize: "0.68rem", color: t.muted }}>
          Defining how <strong style={{ color: t.text }}>{role.title}</strong> ({role.dept}) participates in processes and decisions.
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["RACI Position", "Assigned Role", "Meaning"].map(h => (
                <th key={h} style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: t.muted, padding: "0.55rem 1rem", background: t.surface2, borderBottom: `1px solid ${t.border}`, textAlign: "left", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RACI_DEFS.map(def => {
              const current = role.raci[def.key] || "— None —";
              return (
                <tr key={def.key} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={{ padding: "0.75rem 1rem", verticalAlign: "middle" }}>
                    <span style={{ fontSize: "0.67rem", fontWeight: 700, padding: "0.22rem 0.65rem", borderRadius: 3, background: def.bg, color: def.titleColor, whiteSpace: "nowrap" }}>{def.label}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", verticalAlign: "middle" }}>
                    <select
                      value={current}
                      onChange={e => onSave(role.id, def.key, e.target.value)}
                      style={{ width: "100%", padding: "0.32rem 0.55rem", border: `1px solid ${t.border}`, borderRadius: 7, fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", color: t.text, background: t.surface2, outline: "none" }}
                    >
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", verticalAlign: "middle", fontSize: "0.64rem", color: t.muted }}>{def.meaning}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "0.75rem 1.2rem", background: "#fffbeb", borderTop: "1px solid #fde68a" }}>
          <span style={{ fontSize: "0.65rem", color: "#92400e" }}><strong>Note:</strong> Changes save immediately. Process-level RACI per SOP is managed in the Ownership module.</span>
        </div>
        <div style={{ padding: "0.9rem 1.3rem", borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "flex-end", background: t.surface2 }}>
          <button onClick={onClose} style={{ padding: "0.4rem 0.9rem", borderRadius: 7, border: `1px solid ${t.border}`, background: t.surface, color: t.muted, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── ROLE MODAL ───────────────────────────────────────────────────────────────

interface RoleModalProps {
  state: RoleModalState;
  roles: Role[];
  deptOptions: string[];
  iconOptions: string[];
  sopLabel: string;
  onChange: (patch: Partial<RoleModalState>) => void;
  onSave: () => void;
  onClose: () => void;
  t: typeof THEME.dwm;
}

function RoleModal({ state, roles, deptOptions, iconOptions, sopLabel, onChange, onSave, onClose, t }: RoleModalProps) {
  if (!state.open) return null;
  const isEdit = state.editId !== null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.surface, borderRadius: 14, width: 480, maxWidth: "95vw", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ padding: "1.2rem 1.4rem", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700 }}>{isEdit ? "Edit Role" : "Add New Role"}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.surface2, cursor: "pointer", fontSize: "0.8rem", color: t.muted }}>✕</button>
        </div>
        <div style={{ padding: "1.4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.muted, display: "block", marginBottom: "0.4rem" }}>Title *</label>
              <input value={state.title} onChange={e => onChange({ title: e.target.value })} placeholder="e.g. QA Manager" style={{ width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${t.border}`, borderRadius: 7, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", color: t.text, background: t.surface2, outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.muted, display: "block", marginBottom: "0.4rem" }}>Department *</label>
              <select value={state.dept} onChange={e => onChange({ dept: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${t.border}`, borderRadius: 7, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", color: t.text, background: t.surface2, outline: "none" }}>
                <option value="">Select…</option>
                {deptOptions.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.muted, display: "block", marginBottom: "0.4rem" }}>Reports To</label>
              <select value={state.parent} onChange={e => onChange({ parent: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${t.border}`, borderRadius: 7, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", color: t.text, background: t.surface2, outline: "none" }}>
                <option value="">— Top Level —</option>
                {roles.filter(r => r.id !== state.editId).map(r => <option key={r.id} value={r.id}>{r.icon} {r.title} ({r.dept})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.muted, display: "block", marginBottom: "0.4rem" }}>Icon</label>
              <select value={state.icon} onChange={e => onChange({ icon: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${t.border}`, borderRadius: 7, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", color: t.text, background: t.surface2, outline: "none" }}>
                {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.muted, display: "block", marginBottom: "0.4rem" }}>{sopLabel} Owned</label>
            <input type="number" value={state.sops} onChange={e => onChange({ sops: e.target.value })} min={0} placeholder="0" style={{ width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${t.border}`, borderRadius: 7, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", color: t.text, background: t.surface2, outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.muted, display: "block", marginBottom: "0.4rem" }}>Permissions / Notes</label>
            <input value={state.notes} onChange={e => onChange({ notes: e.target.value })} placeholder="e.g. Can approve SOPs, manage KPIs" style={{ width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${t.border}`, borderRadius: 7, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", color: t.text, background: t.surface2, outline: "none" }} />
          </div>
        </div>
        <div style={{ padding: "1rem 1.4rem", borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "flex-end", gap: "0.6rem", background: t.surface2 }}>
          <button onClick={onClose} style={{ padding: "0.4rem 0.9rem", borderRadius: 7, border: `1px solid ${t.border}`, background: t.surface, color: t.muted, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={onSave} style={{ padding: "0.4rem 0.9rem", borderRadius: 7, border: "none", background: t.accent, color: "#fff", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Save Role</button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  roleId: number | null;
  roles: Role[];
  sopLabel: string;
  onClose: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onOpenRaci: (id: number) => void;
  t: typeof THEME.dwm;
}

function DetailPanel({ roleId, roles, sopLabel, onClose, onEdit, onDelete, onOpenRaci, t }: DetailPanelProps) {
  const role = roleId !== null ? roles.find(r => r.id === roleId) : null;
  if (!role) return null;
  const parent = role.parent ? roles.find(r => r.id === role.parent) : null;
  const children = roles.filter(r => r.parent === role.id);

  return (
    <div style={{ position: "fixed", right: 0, top: 88, bottom: 0, width: 300, background: t.surface, borderLeft: `1px solid ${t.border}`, zIndex: 100, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)", overflowY: "auto", animation: "slideIn 0.2s ease" }}>
      <div style={{ padding: "1rem 1.2rem", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: t.surface, zIndex: 1 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>{role.title}</div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.surface2, cursor: "pointer", fontSize: "0.8rem", color: t.muted }}>✕</button>
      </div>

      {/* Role Info */}
      <div style={{ padding: "1rem 1.2rem", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: t.muted, marginBottom: "0.7rem", fontWeight: 600 }}>Role Info</div>
        {[
          ["Icon", role.icon],
          ["Department", role.dept],
          ["Reports To", parent?.title ?? "Top Level"],
          [sopLabel + " Owned", String(role.sops)],
          ["Notes", role.notes || "—"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: t.muted }}>{k}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 500, color: k === sopLabel + " Owned" ? t.accent : t.text }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Direct Reports */}
      <div style={{ padding: "1rem 1.2rem", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: t.muted, marginBottom: "0.7rem", fontWeight: 600 }}>Direct Reports ({children.length})</div>
        {children.length > 0 ? children.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", padding: "0.4rem", borderRadius: 6, background: t.surface2 }}>
            <span>{c.icon}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>{c.title}</span>
          </div>
        )) : <div style={{ fontSize: "0.68rem", color: t.muted2 }}>No direct reports</div>}
      </div>

      {/* RACI */}
      <div style={{ padding: "1rem 1.2rem", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: t.muted, marginBottom: "0.7rem", fontWeight: 600 }}>RACI</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.6rem" }}>
          {RACI_DEFS.map(def => (
            <div key={def.key} style={{ padding: "0.45rem 0.6rem", borderRadius: 6, background: def.bg, border: `1px solid ${def.border}` }}>
              <div style={{ fontSize: "0.5rem", fontWeight: 700, color: def.titleColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.15rem" }}>{def.label}</div>
              <div style={{ fontSize: "0.67rem", fontWeight: 500, color: def.valColor }}>{role.raci[def.key] || <span style={{ color: t.muted2, fontStyle: "italic" }}>Unset</span>}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onOpenRaci(role.id)} style={{ width: "100%", padding: "0.4rem", borderRadius: 7, border: `1px solid ${t.border}`, background: t.surface, color: t.muted, cursor: "pointer", fontSize: "0.68rem", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
          ✏ Edit RACI
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "1rem 1.2rem" }}>
        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: t.muted, marginBottom: "0.7rem", fontWeight: 600 }}>Quick Actions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <button onClick={() => onEdit(role.id)} style={{ padding: "0.4rem 0.9rem", borderRadius: 7, border: `1px solid ${t.border}`, background: t.surface, color: t.muted, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>✏ Edit Role</button>
          <button onClick={() => onDelete(role.id)} style={{ padding: "0.4rem 0.9rem", borderRadius: 7, border: `1px solid ${t.border}`, background: t.surface, color: t.red, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>🗑 Delete Role</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ORG APP ─────────────────────────────────────────────────────────────

interface OrgAppProps {
  theme: Theme;
  initialRoles: Role[];
  depts: string[];
  deptOptions: string[];
  iconOptions: string[];
}

function OrgApp({ theme, initialRoles, depts, deptOptions, iconOptions }: OrgAppProps) {
  const t = THEME[theme];
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [nextId, setNextId] = useState(initialRoles.length + 1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [rowHover, setRowHover] = useState<number | null>(null);
  const { msg: toastMsg, visible: toastVisible, show: showToast } = useToast();

  const [roleModal, setRoleModal] = useState<RoleModalState>({ open: false, editId: null, title: "", dept: "", icon: iconOptions[0], parent: "", sops: "", notes: "" });
  const [raciModal, setRaciModal] = useState<RaciModalState>({ open: false, roleId: null });

  const filtered = roles.filter(r => {
    const deptOk = activeFilter === "All" || r.dept === activeFilter;
    const q = searchQ.toLowerCase();
    const searchOk = !q || r.title.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q);
    return deptOk && searchOk;
  });

  const roots = roles.filter(r => r.parent === null);
  const total = roles.length;
  const multi = roles.filter(r => r.multi).length;
  const deptCount = new Set(roles.map(r => r.dept)).size;

  const handleSelect = (id: number) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const openAddModal = () => setRoleModal({ open: true, editId: null, title: "", dept: "", icon: iconOptions[0], parent: "", sops: "0", notes: "" });
  const openEditModal = (id: number) => {
    const r = roles.find(x => x.id === id);
    if (!r) return;
    setRoleModal({ open: true, editId: id, title: r.title, dept: r.dept, icon: r.icon, parent: r.parent ? String(r.parent) : "", sops: String(r.sops), notes: r.notes });
  };

  const saveRole = () => {
    const { title, dept, icon, parent, sops, notes, editId } = roleModal;
    if (!title.trim() || !dept) { showToast("Title and Department are required"); return; }
    const parentId = parent ? parseInt(parent) : null;
    if (editId !== null) {
      setRoles(prev => prev.map(r => r.id === editId ? { ...r, title: title.trim(), dept, icon, parent: parentId, sops: parseInt(sops) || 0, notes: notes.trim() } : r));
      showToast("Role updated");
    } else {
      const newRole: Role = { id: nextId, title: title.trim(), dept, icon, parent: parentId, sops: parseInt(sops) || 0, notes: notes.trim(), multi: false, raci: { R: "", A: "", C: "", I: "" } };
      setRoles(prev => [...prev, newRole]);
      setNextId(n => n + 1);
      showToast("Role added");
    }
    setRoleModal(s => ({ ...s, open: false }));
  };

  const deleteRole = (id: number) => {
    const r = roles.find(x => x.id === id);
    if (!r) return;
    const children = roles.filter(x => x.parent === id);
    if (children.length) { showToast(`Cannot delete — ${r.title} has ${children.length} direct report(s)`); return; }
    if (!confirm(`Delete "${r.title}"?`)) return;
    setRoles(prev => prev.filter(x => x.id !== id));
    if (selectedId === id) setSelectedId(null);
    showToast(`"${r.title}" deleted`);
  };

  const saveRaciChange = (roleId: number, key: RaciKey, val: string) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, raci: { ...r.raci, [key]: val === "— None —" ? "" : val } } : r));
    showToast(`RACI ${key} updated`);
  };

  const handleDrop = (targetId: number) => {
    if (!dragId || dragId === targetId) return;
    if (isDescendant(roles, targetId, dragId)) return;
    const dragged = roles.find(r => r.id === dragId);
    const target = roles.find(r => r.id === targetId);
    if (!dragged || !target) return;
    setRoles(prev => prev.map(r => r.id === dragId ? { ...r, parent: targetId } : r));
    showToast(`"${dragged.title}" moved under "${target.title}"`);
    setDragId(null);
    setDragOverId(null);
  };

  const exportCSV = () => {
    const header = `Role,Department,Reports To,${t.sopLabel},Notes,RACI-R,RACI-A,RACI-C,RACI-I\n`;
    const rows = roles.map(r => {
      const parentTitle = r.parent ? roles.find(x => x.id === r.parent)?.title ?? "Top Level" : "Top Level";
      return `"${r.title}","${r.dept}","${parentTitle}","${r.sops}","${r.notes}","${r.raci.R}","${r.raci.A}","${r.raci.C}","${r.raci.I}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${theme.toUpperCase()}_Org_Structure.csv`;
    a.click();
    showToast("Exported as CSV");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.text, background: t.bg }}>

      {/* TOP BAR */}
      <div style={{ background: t.topbarBg, borderBottom: `1px solid ${t.topbarBorder}`, padding: "0 1.4rem", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: t.topbarText }}>
            Org Structure & RACI
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: t.searchBg, border: `1px solid ${t.searchBorder}`, borderRadius: 7, padding: "0.35rem 0.8rem", width: 220 }}>
            <span style={{ color: t.topbarText, opacity: 0.4 }}>🔍</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search roles…" style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.72rem", color: t.searchInputColor, width: "100%", fontFamily: "'DM Sans', sans-serif" }} />
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {depts.map(d => (
              <button key={d} onClick={() => setActiveFilter(d)}
                style={{ fontSize: "0.62rem", padding: "0.28rem 0.7rem", borderRadius: 20, border: `1px solid ${activeFilter === d ? t.accentBg : t.chipBorder}`, background: activeFilter === d ? t.accentBg : t.chipBg, color: activeFilter === d ? "#fff" : t.chipColor, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={exportCSV} style={{ padding: "0.4rem 0.9rem", borderRadius: 7, border: `1px solid ${theme === "it" ? "rgba(255,255,255,0.2)" : t.border}`, background: theme === "it" ? "rgba(255,255,255,0.1)" : t.surface, color: theme === "it" ? "rgba(255,255,255,0.8)" : t.muted, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>⬇ Export</button>
          <button onClick={openAddModal} style={{ padding: "0.4rem 0.9rem", borderRadius: 7, border: "none", background: t.accentBg, color: "#fff", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>+ Add Role</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: t.statsBg, borderBottom: `1px solid ${t.statsBorder}`, padding: "0.5rem 1.4rem", display: "flex", gap: "2rem", flexShrink: 0 }}>
        {[
          { dot: t.accent, label: "Total Roles:", val: total },
          { dot: "#8b5cf6", label: "Multi-Hat:", val: multi },
          { dot: "#f59e0b", label: "Departments:", val: deptCount },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
            <span style={{ fontSize: "0.62rem", color: t.statLabel }}>{s.label}</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", fontWeight: 700, color: t.statVal }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* TREE PANEL */}
        <div style={{ width: "55%", borderRight: `1px solid ${t.border}`, background: t.surface2, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "0.8rem 1.2rem", borderBottom: `1px solid ${t.border}`, background: t.surface, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: t.muted }}>Visual Org Tree</span>
            <span style={{ fontSize: "0.62rem", color: t.muted2 }}>Drag nodes to re-parent · Click to select</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "max-content", paddingBottom: "2rem" }}>
              {roots.map(root => (
                <OrgNode
                  key={root.id} role={root} roles={roles} selectedId={selectedId}
                  dragId={dragId} dragOverId={dragOverId}
                  onSelect={handleSelect} onEdit={openEditModal} onDelete={deleteRole}
                  onDragStart={id => setDragId(id)}
                  onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                  onDragOver={id => { if (dragId !== id && !isDescendant(roles, id, dragId ?? -1)) setDragOverId(id); }}
                  onDragLeave={id => { if (dragOverId === id) setDragOverId(null); }}
                  onDrop={handleDrop}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TABLE PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "0.8rem 1.2rem", borderBottom: `1px solid ${t.border}`, background: t.surface, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: t.muted }}>Role Registry</span>
            <span style={{ fontSize: "0.62rem", color: t.muted2 }}>{filtered.length} role{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Role", "Department", "Reports To", "RACI", t.sopLabel, "Status", ""].map(h => (
                    <th key={h} style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: t.muted, padding: "0.6rem 1rem", background: t.surface2, borderBottom: `1px solid ${t.border}`, textAlign: "left", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const parentTitle = r.parent ? roles.find(x => x.id === r.parent)?.title ?? "—" : "—";
                  const isHovered = rowHover === r.id;
                  const isSelected = selectedId === r.id;
                  return (
                    <tr key={r.id}
                      onClick={() => handleSelect(r.id)}
                      onMouseEnter={() => setRowHover(r.id)}
                      onMouseLeave={() => setRowHover(null)}
                      style={{ background: isSelected ? t.accentLight : isHovered ? "#fafbff" : "transparent", cursor: "pointer" }}>
                      <td style={{ padding: "0.7rem 1rem", fontSize: "0.72rem", borderBottom: `1px solid ${t.border}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "1rem" }}>{r.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.title}</div>
                            <div style={{ fontSize: "0.6rem", color: t.muted2 }}>{r.notes}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "0.7rem 1rem", borderBottom: `1px solid ${t.border}`, verticalAlign: "middle" }}>
                        <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: 4, background: t.accentLight, color: t.accent }}>{r.dept}</span>
                      </td>
                      <td style={{ padding: "0.7rem 1rem", fontSize: "0.68rem", color: t.muted, borderBottom: `1px solid ${t.border}`, verticalAlign: "middle" }}>{parentTitle}</td>
                      <td style={{ padding: "0.7rem 1rem", borderBottom: `1px solid ${t.border}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "0.2rem" }}>
                          {(["R", "A", "C", "I"] as RaciKey[]).map(k => (
                            <span key={k} title={`${k}: ${r.raci[k] || "—"}`} style={{ fontSize: "0.55rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: 3, background: RACI_BADGE[k].bg, color: RACI_BADGE[k].color }}>{k}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "0.7rem 1rem", textAlign: "center", fontWeight: 600, color: t.accent, borderBottom: `1px solid ${t.border}`, verticalAlign: "middle" }}>{r.sops}</td>
                      <td style={{ padding: "0.7rem 1rem", borderBottom: `1px solid ${t.border}`, verticalAlign: "middle" }}>
                        <span style={{ fontSize: "0.52rem", padding: "0.1rem 0.4rem", borderRadius: 3, fontWeight: 600, textTransform: "uppercase", background: "#d1fae5", color: "#065f46" }}>Active</span>
                      </td>
                      <td style={{ padding: "0.7rem 1rem", borderBottom: `1px solid ${t.border}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "0.3rem", opacity: isHovered ? 1 : 0, transition: "opacity 0.15s" }}>
                          {[
                            { label: "Edit", action: () => openEditModal(r.id) },
                            { label: "RACI", action: () => setRaciModal({ open: true, roleId: r.id }) },
                            { label: "Delete", action: () => deleteRole(r.id), danger: true },
                          ].map(btn => (
                            <button key={btn.label} onClick={e => { e.stopPropagation(); btn.action(); }}
                              style={{ fontSize: "0.6rem", padding: "0.2rem 0.5rem", borderRadius: 4, border: `1px solid ${t.border}`, background: t.surface, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: (btn as any).danger ? t.red : t.text }}>
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL PANEL */}
      {selectedId !== null && (
        <DetailPanel
          roleId={selectedId} roles={roles} sopLabel={t.sopLabel}
          onClose={() => setSelectedId(null)}
          onEdit={openEditModal}
          onDelete={deleteRole}
          onOpenRaci={id => setRaciModal({ open: true, roleId: id })}
          t={t}
        />
      )}

      {/* ROLE MODAL */}
      <RoleModal
        state={roleModal} roles={roles}
        deptOptions={deptOptions} iconOptions={iconOptions} sopLabel={t.sopLabel}
        onChange={patch => setRoleModal(s => ({ ...s, ...patch }))}
        onSave={saveRole}
        onClose={() => setRoleModal(s => ({ ...s, open: false }))}
        t={t}
      />

      {/* RACI MODAL */}
      <RaciModal
        state={raciModal} roles={roles}
        onClose={() => setRaciModal({ open: false, roleId: null })}
        onSave={saveRaciChange}
        t={t}
      />

      {/* TOAST */}
      <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: 8, fontSize: "0.72rem", zIndex: 2000, opacity: toastVisible ? 1 : 0, transition: "opacity 0.3s", pointerEvents: "none" }}>
        {toastMsg}
      </div>
    </div>
  );
}

// ─── ROOT APP with theme switcher ─────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState<Theme>("dwm");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: none; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        select, input, button { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* SWITCHER BAR */}
      <div style={{ background: "#0f172a", padding: "0.4rem 1.4rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
        <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", marginRight: "0.3rem", fontFamily: "'DM Sans', sans-serif" }}>VIEW:</span>
        {(["dwm", "it"] as Theme[]).map(th => (
          <button key={th} onClick={() => setTheme(th)}
            style={{ padding: "0.25rem 0.8rem", borderRadius: 20, fontSize: "0.62rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", border: "1px solid", transition: "all 0.15s", borderColor: theme === th ? "#4f46e5" : "rgba(255,255,255,0.15)", background: theme === th ? "#4f46e5" : "rgba(255,255,255,0.05)", color: theme === th ? "#fff" : "rgba(255,255,255,0.5)" }}>
            {th === "dwm" ? "🏭 DWM Pharma" : "💻 IT Engineering"}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {theme === "dwm"
          ? <OrgApp key="dwm" theme="dwm" initialRoles={DWM_ROLES} depts={DWM_DEPTS} deptOptions={DWM_DEPT_OPTIONS} iconOptions={DWM_ICONS} />
          : <OrgApp key="it"  theme="it"  initialRoles={IT_ROLES}  depts={IT_DEPTS}  deptOptions={IT_DEPT_OPTIONS}  iconOptions={IT_ICONS} />
        }
      </div>
    </div>
  );
}
