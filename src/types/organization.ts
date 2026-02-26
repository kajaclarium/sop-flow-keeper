/** Identifier for the three organizational tiers. */
export type RoleTierId = "strategic" | "managerial" | "operational";

/** RACI designation for organizational roles. */
export type RACIType = "responsible" | "accountable" | "consulted" | "informed";

/** Human-readable labels for each RACI type. */
export const RACI_LABELS: Record<RACIType, string> = {
    responsible: "Responsible",
    accountable: "Accountable",
    consulted: "Consulted",
    informed: "Informed",
};

/** Short descriptions for each RACI type. */
export const RACI_DESCRIPTIONS: Record<RACIType, string> = {
    responsible: "Does the work to complete the task or deliverable",
    accountable: "Ultimately answerable for the correct completion; approves/signs off",
    consulted: "Provides input and expertise before or during execution",
    informed: "Kept up to date on progress and outcomes",
};

/**
 * Represents one of the three organizational tiers.
 * Tiers are editable (name, description) but the set of tier IDs is fixed.
 */
export interface RoleTier {
    /** Fixed tier identifier — one of strategic, managerial, operational. */
    id: RoleTierId;
    /** Display name for the tier — editable by the user. */
    name: string;
    /** Description of the tier's purpose and scope — editable by the user. */
    description: string;
}

/**
 * An abstract organizational role (a "chair," not a person).
 * Roles are created within a tier and used for assignment across the application.
 * Principle: "Chair Over Person" — standards belong to Roles, not names.
 */
export interface OrgRole {
    /** Unique identifier for the role. */
    id: string;
    /** Display name of the role (e.g., "Shift Lead", "Maintenance Manager"). */
    name: string;
    /** Description of the role's responsibilities. */
    description: string;
    /** The tier this role belongs to. */
    tierId: RoleTierId;
    /** RACI designation defining how this role participates in processes. */
    raciType: RACIType;
    /** ISO date string of when the role was created. */
    createdAt: string;
}

/** Represents a department within the organizational hierarchy. */
export interface Department {
    /** Unique identifier for the department. */
    id: string;
    /** Display name of the department. */
    name: string;
    /** Brief description of the department's purpose and responsibilities. */
    description: string;
    /** Role name assigned as head of this department (selected from OrgRole catalog). */
    headOfDepartment: string;
    /** Parent department ID for hierarchical nesting; null for root-level departments. */
    parentId: string | null;
    /** ISO date string of when the department was created. */
    createdAt: string;
}
