import React, { createContext, useContext, useState, useCallback } from "react";
import { Department, RoleTier, RoleTierId, OrgRole, RACIType } from "@/types/organization";

/** Generates a unique department ID with a DEP- prefix. */
const generateDeptId = () => `DEP-${String(Math.floor(Math.random() * 9000) + 1000)}`;

/** Generates a unique role ID with a ROLE- prefix. */
const generateRoleId = () => `ROLE-${String(Math.floor(Math.random() * 9000) + 1000)}`;

/** The three fixed organizational tiers — editable in name/description but immutable in count. */
const INITIAL_TIERS: RoleTier[] = [
  {
    id: "strategic",
    name: "Strategic",
    description: "Sets direction and priorities. Owns governance and organizational outcomes.",
  },
  {
    id: "managerial",
    name: "Managerial",
    description: "Translates strategy to plans. Manages departments, KPIs, and coordinates cross-functions.",
  },
  {
    id: "operational",
    name: "Operational",
    description: "Executes daily operations. Delivers services and products. Provides frontline insights.",
  },
];

/**
 * Seed roles matching existing owner strings used across SOP and Work Inventory.
 * Each role is an abstract position ("chair") with a RACI designation.
 */
const INITIAL_ROLES: OrgRole[] = [
  /* Strategic tier — Accountable roles that own governance and outcomes */
  { id: "ROLE-0001", name: "Director of Operations", description: "Oversees all operational functions and strategic alignment", tierId: "strategic", raciType: "accountable", createdAt: "2025-06-01" },
  { id: "ROLE-0002", name: "Facilities Director", description: "Leads all facility management, infrastructure, and capital planning", tierId: "strategic", raciType: "accountable", createdAt: "2025-06-01" },
  { id: "ROLE-0003", name: "IT Director", description: "Drives IT strategy, cybersecurity, and digital infrastructure", tierId: "strategic", raciType: "accountable", createdAt: "2025-06-01" },

  /* Managerial tier — Consulted/Accountable roles that translate strategy to plans */
  { id: "ROLE-0004", name: "Senior Manager", description: "Manages cross-functional teams and departmental objectives", tierId: "managerial", raciType: "accountable", createdAt: "2025-06-01" },
  { id: "ROLE-0005", name: "Maintenance Manager", description: "Plans and oversees preventive and corrective maintenance programs", tierId: "managerial", raciType: "accountable", createdAt: "2025-06-01" },
  { id: "ROLE-0006", name: "HR Manager", description: "Manages recruitment, onboarding, training, and employee relations", tierId: "managerial", raciType: "accountable", createdAt: "2025-06-01" },
  { id: "ROLE-0007", name: "Compliance Lead", description: "Ensures regulatory compliance and coordinates audits", tierId: "managerial", raciType: "consulted", createdAt: "2025-06-01" },
  { id: "ROLE-0008", name: "QC Lead", description: "Leads quality control processes and inspection standards", tierId: "managerial", raciType: "accountable", createdAt: "2025-06-01" },
  { id: "ROLE-0009", name: "Logistics Coordinator", description: "Coordinates inbound/outbound logistics and warehouse operations", tierId: "managerial", raciType: "consulted", createdAt: "2025-06-01" },
  { id: "ROLE-0010", name: "IT Manager", description: "Manages day-to-day IT operations and help desk", tierId: "managerial", raciType: "accountable", createdAt: "2025-06-01" },

  /* Operational tier — Responsible roles that execute daily work */
  { id: "ROLE-0011", name: "Maintenance Technician", description: "Performs hands-on preventive and corrective maintenance tasks", tierId: "operational", raciType: "responsible", createdAt: "2025-06-01" },
  { id: "ROLE-0012", name: "Senior Technician", description: "Handles complex repairs and mentors junior technicians", tierId: "operational", raciType: "responsible", createdAt: "2025-06-01" },
  { id: "ROLE-0013", name: "Facility Supervisor", description: "Supervises daily facility cleaning and hygiene operations", tierId: "operational", raciType: "responsible", createdAt: "2025-06-01" },
  { id: "ROLE-0014", name: "QC Inspector", description: "Inspects incoming materials and in-process quality checks", tierId: "operational", raciType: "responsible", createdAt: "2025-06-01" },
  { id: "ROLE-0015", name: "HSE Officer", description: "Implements workplace safety protocols and incident response", tierId: "operational", raciType: "responsible", createdAt: "2025-06-01" },
  { id: "ROLE-0016", name: "System Administrator", description: "Manages system backups, server administration, and disaster recovery", tierId: "operational", raciType: "responsible", createdAt: "2025-06-01" },
];

/** Seed departments referencing role names as head-of-department. */
const INITIAL_DEPARTMENTS: Department[] = [
  { id: "DEP-0001", name: "Facility Management", description: "Cleaning, maintenance, and facility operations across all locations", headOfDepartment: "Facilities Director", parentId: null, createdAt: "2025-06-01" },
  { id: "DEP-0002", name: "IT & Data Operations", description: "Data backup, recovery, IT infrastructure, and cybersecurity", headOfDepartment: "IT Director", parentId: null, createdAt: "2025-06-01" },
  { id: "DEP-0003", name: "Safety & Compliance", description: "Incident response, chemical handling, and regulatory compliance", headOfDepartment: "Compliance Lead", parentId: null, createdAt: "2025-06-01" },
  { id: "DEP-0004", name: "Human Resources", description: "Employee onboarding, training, and HR procedures", headOfDepartment: "HR Manager", parentId: null, createdAt: "2025-06-01" },
];

interface OrganizationContextType {
  /* ---- Tiers ---- */
  /** The three organizational tiers (Strategic, Managerial, Operational). */
  tiers: RoleTier[];
  /** Updates the name and/or description of a tier. */
  updateTier: (id: RoleTierId, updates: Partial<Pick<RoleTier, "name" | "description">>) => void;

  /* ---- Roles ---- */
  /** All organizational roles (abstract chairs). */
  roles: OrgRole[];
  /** Creates a new role and returns its generated ID. */
  createRole: (data: Omit<OrgRole, "id" | "createdAt">) => string;
  /** Updates an existing role by ID. */
  updateRole: (id: string, updates: Partial<OrgRole>) => void;
  /** Deletes a role by ID. */
  deleteRole: (id: string) => void;
  /** Returns all roles belonging to a specific tier. */
  getRolesByTier: (tierId: RoleTierId) => OrgRole[];
  /** Returns a flat list of all role names for dropdown population. */
  getAllRoleNames: () => string[];
  /** Returns all roles formatted as EzSelect options with tier label. */
  getRoleOptions: () => Array<{ label: string; value: string }>;

  /* ---- Departments ---- */
  /** All departments in the organization. */
  departments: Department[];
  /** Creates a new department and returns its generated ID. */
  createDepartment: (data: Omit<Department, "id" | "createdAt">) => string;
  /** Updates an existing department by ID with partial data. */
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  /** Removes a department and re-parents its children to the deleted dept's parent. */
  deleteDepartment: (id: string) => void;
  /** Returns all root-level departments (parentId is null). */
  getRootDepartments: () => Department[];
  /** Returns all direct child departments of a given parent. */
  getChildDepartments: (parentId: string) => Department[];
  /** Finds a department by its ID. */
  getDepartmentById: (id: string) => Department | undefined;
  /** Builds the ancestor chain for breadcrumb display. */
  getDepartmentBreadcrumbs: (departmentId: string) => Department[];
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

/** Provider that manages tiers, roles (with RACI), and departments in-memory. */
export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [tiers, setTiers] = useState<RoleTier[]>(INITIAL_TIERS);
  const [roles, setRoles] = useState<OrgRole[]>(INITIAL_ROLES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);

  /* ---- Tier Operations ---- */

  /** Updates the name or description of an existing tier. */
  const updateTier = useCallback((id: RoleTierId, updates: Partial<Pick<RoleTier, "name" | "description">>) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  /* ---- Role Operations ---- */

  /** Creates a new role, generating a unique ID and timestamp. */
  const createRole = useCallback((data: Omit<OrgRole, "id" | "createdAt">): string => {
    const id = generateRoleId();
    const newRole: OrgRole = { ...data, id, createdAt: new Date().toISOString().split("T")[0] };
    setRoles((prev) => [...prev, newRole]);
    return id;
  }, []);

  /** Merges partial updates into the matching role record. */
  const updateRole = useCallback((id: string, updates: Partial<OrgRole>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  /** Deletes a role by ID. */
  const deleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /** Returns all roles belonging to a specific tier. */
  const getRolesByTier = useCallback((tierId: RoleTierId) => {
    return roles.filter((r) => r.tierId === tierId);
  }, [roles]);

  /** Returns a flat array of all unique role names. */
  const getAllRoleNames = useCallback(() => {
    return roles.map((r) => r.name);
  }, [roles]);

  /** Returns roles formatted as EzSelect options with tier prefix for clarity. */
  const getRoleOptions = useCallback(() => {
    return roles.map((r) => {
      const tier = tiers.find((t) => t.id === r.tierId);
      return { label: `${r.name} — ${tier?.name ?? r.tierId}`, value: r.name };
    });
  }, [roles, tiers]);

  /* ---- Department Operations ---- */

  /** Creates a new department, generating a unique ID and timestamp. */
  const createDepartment = useCallback((data: Omit<Department, "id" | "createdAt">): string => {
    const id = generateDeptId();
    const newDept: Department = { ...data, id, createdAt: new Date().toISOString().split("T")[0] };
    setDepartments((prev) => [...prev, newDept]);
    return id;
  }, []);

  /** Merges partial updates into the matching department record. */
  const updateDepartment = useCallback((id: string, updates: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  /** Removes a department and re-assigns its children to the deleted dept's parent. */
  const deleteDepartment = useCallback((id: string) => {
    setDepartments((prev) => {
      const target = prev.find((d) => d.id === id);
      if (!target) return prev;
      /* Re-parent children to the deleted department's parent before removing */
      return prev
        .map((d) => (d.parentId === id ? { ...d, parentId: target.parentId } : d))
        .filter((d) => d.id !== id);
    });
  }, []);

  /** Returns departments with no parent (top-level nodes in the tree). */
  const getRootDepartments = useCallback(() => {
    return departments.filter((d) => d.parentId === null);
  }, [departments]);

  /** Returns direct children of a specific parent department. */
  const getChildDepartments = useCallback((parentId: string) => {
    return departments.filter((d) => d.parentId === parentId);
  }, [departments]);

  /** Looks up a single department by ID. */
  const getDepartmentById = useCallback((id: string) => {
    return departments.find((d) => d.id === id);
  }, [departments]);

  /** Walks up the parent chain to build a breadcrumb trail from root to the given department. */
  const getDepartmentBreadcrumbs = useCallback((departmentId: string): Department[] => {
    const crumbs: Department[] = [];
    let currentId: string | null = departmentId;
    /* Traverse upward, max 20 levels to prevent infinite loops */
    let safetyCounter = 0;
    while (currentId && safetyCounter < 20) {
      const dept = departments.find((d) => d.id === currentId);
      if (!dept) break;
      crumbs.unshift(dept);
      currentId = dept.parentId;
      safetyCounter += 1;
    }
    return crumbs;
  }, [departments]);

  return (
    <OrganizationContext.Provider
      value={{
        tiers, updateTier,
        roles, createRole, updateRole, deleteRole, getRolesByTier, getAllRoleNames, getRoleOptions,
        departments, createDepartment, updateDepartment, deleteDepartment,
        getRootDepartments, getChildDepartments, getDepartmentById, getDepartmentBreadcrumbs,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

/** Hook to access the organization context. Must be used within OrganizationProvider. */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error("useOrganization must be used within OrganizationProvider");
  return context;
}
