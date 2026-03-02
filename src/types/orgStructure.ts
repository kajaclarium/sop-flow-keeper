export type RaciKey = "R" | "A" | "C" | "I";

/** Unified Role type for the Org Structure UI, using string IDs. */
export interface Role {
    id: string;
    title: string;
    dept: string;
    icon: string;
    parent: string | null;
    sops: number;
    notes: string;
    multi: boolean;
    raci: Record<RaciKey, string>;
}

/** Visual styles for RACI badges. */
export const RACI_BADGE: Record<RaciKey, { bgClass: string; textClass: string }> = {
    R: { bgClass: "bg-blue-100", textClass: "text-blue-700" },
    A: { bgClass: "bg-emerald-100", textClass: "text-emerald-700" },
    C: { bgClass: "bg-amber-100", textClass: "text-amber-700" },
    I: { bgClass: "bg-slate-100", textClass: "text-slate-700" },
};

/** State for the Role creation/edit modal. */
export interface RoleModalState {
    open: boolean;
    editId: string | null;
    title: string;
    dept: string;
    icon: string;
    parent: string;
    sops: string;
    notes: string;
}

/** State for the RACI configuration modal. */
export interface RaciModalState {
    open: boolean;
    roleId: string | null;
}

/** Definition for RACI types with UI styling metadata. */
export const RACI_DEFS = [
    { key: "R" as RaciKey, label: "Responsible", meaning: "Does the work to complete the task", bgClass: "bg-blue-50", borderClass: "border-blue-100", titleClass: "text-blue-600", valClass: "text-blue-900" },
    { key: "A" as RaciKey, label: "Accountable", meaning: "Answerable for correct completion", bgClass: "bg-emerald-50", borderClass: "border-emerald-100", titleClass: "text-emerald-600", valClass: "text-emerald-900" },
    { key: "C" as RaciKey, label: "Consulted", meaning: "Provides input and expertise", bgClass: "bg-amber-50", borderClass: "border-amber-100", titleClass: "text-amber-600", valClass: "text-amber-900" },
    { key: "I" as RaciKey, label: "Informed", meaning: "Kept up to date on progress", bgClass: "bg-slate-50", borderClass: "border-slate-100", titleClass: "text-slate-600", valClass: "text-slate-900" },
] as const;
